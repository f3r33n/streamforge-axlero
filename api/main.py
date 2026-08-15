from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from threading import Thread, Lock
import sys
from confluent_kafka import Consumer
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="StreamForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Latest message from any truck (preserved for /telemetry/latest)
latest_telemetry = None
# Per-truck latest state
latest_telemetry_by_truck: dict[str, dict] = {}
telemetry_lock = Lock()

consumer_thread = None
should_stop = False

ALERT_LEVELS = {
    "OVERSPEED": "Critical",
    "HIGH_ENGINE_TEMPERATURE": "Critical",
    "LOW_FUEL": "Warning",
}

ALERT_LABELS = {
    "OVERSPEED": "Overspeed",
    "HIGH_ENGINE_TEMPERATURE": "High Engine Temp",
    "LOW_FUEL": "Low Fuel",
}


def normalize_telemetry(raw: dict) -> dict:
    """Normalize telemetry and use 'alerts' as the canonical field."""
    data = dict(raw)
    if "alerts" not in data and "alert" in data:
        data["alerts"] = data["alert"]
    if "alert" in data:
        del data["alert"]
    if "alerts" not in data:
        data["alerts"] = ["NORMAL"]
    return data


def store_telemetry(raw: dict) -> None:
    """Store normalized telemetry for a truck."""
    global latest_telemetry

    normalized = normalize_telemetry(raw)
    truck_id = normalized.get("truck_id")
    if not truck_id:
        logger.warning("Telemetry message missing truck_id, skipping")
        return

    with telemetry_lock:
        latest_telemetry = normalized
        latest_telemetry_by_truck[truck_id] = normalized


def get_all_trucks() -> list[dict]:
    with telemetry_lock:
        return list(latest_telemetry_by_truck.values())


def get_truck(truck_id: str) -> dict | None:
    with telemetry_lock:
        return latest_telemetry_by_truck.get(truck_id)


def compute_stats() -> dict:
    trucks = get_all_trucks()
    if not trucks:
        return {
            "active_count": 0,
            "total_trucks": 0,
            "avg_speed": 0.0,
            "avg_fuel": 0.0,
            "alert_counts": {},
        }

    active_count = sum(1 for t in trucks if t.get("status") == "MOVING")
    avg_speed = sum(t.get("speed", 0) for t in trucks) / len(trucks)
    avg_fuel = sum(t.get("fuel", 0) for t in trucks) / len(trucks)

    alert_counts: dict[str, int] = {}
    for truck in trucks:
        for alert in truck.get("alerts", []):
            if alert == "NORMAL":
                continue
            alert_counts[alert] = alert_counts.get(alert, 0) + 1

    return {
        "active_count": active_count,
        "total_trucks": len(trucks),
        "avg_speed": round(avg_speed, 2),
        "avg_fuel": round(avg_fuel, 2),
        "alert_counts": alert_counts,
    }


def compute_alerts() -> list[dict]:
    alerts = []
    for truck in get_all_trucks():
        truck_id = truck.get("truck_id", "UNKNOWN")
        for alert_type in truck.get("alerts", []):
            if alert_type == "NORMAL":
                continue
            level = ALERT_LEVELS.get(alert_type, "Warning")
            label = ALERT_LABELS.get(alert_type, alert_type.replace("_", " ").title())
            detail_parts = []
            if alert_type == "OVERSPEED":
                detail_parts.append(f"Speed: {truck.get('speed')} km/h — Limit: 100 km/h")
            elif alert_type == "LOW_FUEL":
                detail_parts.append(f"Fuel level at {truck.get('fuel')}% — refuel needed")
            elif alert_type == "HIGH_ENGINE_TEMPERATURE":
                detail_parts.append(
                    f"Engine at {truck.get('temperature')}°C — coolant check required"
                )
            alerts.append(
                {
                    "id": f"{truck_id}-{alert_type}",
                    "truck_id": truck_id,
                    "type": label,
                    "alert_type": alert_type,
                    "level": level,
                    "detail": " — ".join(detail_parts) if detail_parts else label,
                    "timestamp": truck.get("timestamp"),
                }
            )
    return alerts


def consume_telemetry():
    """Background thread that consumes telemetry from Kafka."""
    global should_stop

    consumer_config = {
        "bootstrap.servers": "localhost:9092",
        "group.id": "streamforge-api",
        "auto.offset.reset": "latest",
    }

    consumer = Consumer(consumer_config)
    consumer.subscribe(["truck-telemetry"])

    logger.info("Kafka consumer started in background thread")

    try:
        while not should_stop:
            message = consumer.poll(1.0)

            if message is None:
                continue

            if message.error():
                logger.error(f"Kafka error: {message.error()}")
                continue

            try:
                raw = json.loads(message.value().decode("utf-8"))
                store_telemetry(raw)
                logger.info("Telemetry received and stored")
            except json.JSONDecodeError as e:
                logger.error(f"Failed to decode JSON: {e}")
                continue

    except Exception as e:
        logger.error(f"Consumer error: {e}")

    finally:
        consumer.close()
        logger.info("Kafka consumer closed")


@app.on_event("startup")
def startup_event():
    global consumer_thread
    # Avoid starting the Kafka consumer when running under pytest.
    # pytest loads test modules before running and TestClient triggers
    # FastAPI startup events; starting a background consumer during
    # tests can introduce non-determinism. Detect pytest via sys.modules.
    # Detect pytest more robustly: check loaded modules, argv, and env vars.
    import os

    running_under_pytest = (
        any(name.startswith("pytest") for name in sys.modules)
        or any("pytest" in (arg or "") for arg in sys.argv)
        or bool(os.getenv("PYTEST_CURRENT_TEST"))
    )

    if running_under_pytest:
        logger.info("Detected pytest; skipping Kafka consumer startup")
        return

    consumer_thread = Thread(target=consume_telemetry, daemon=True)
    consumer_thread.start()
    logger.info("StreamForge API started")


@app.on_event("shutdown")
def shutdown_event():
    global should_stop
    should_stop = True
    logger.info("StreamForge API shutting down")


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "StreamForge API is running"}


@app.get("/health")
def health_check():
    trucks = get_all_trucks()
    return {
        "status": "healthy",
        "trucks_tracked": len(trucks),
    }


@app.get("/trucks")
def list_trucks():
    return get_all_trucks()


@app.get("/trucks/{truck_id}")
def get_truck_by_id(truck_id: str):
    truck = get_truck(truck_id)
    if truck is None:
        raise HTTPException(status_code=404, detail=f"Truck {truck_id} not found")
    return truck


@app.get("/stats")
def get_stats():
    return compute_stats()


@app.get("/alerts")
def get_alerts():
    return compute_alerts()


@app.get("/telemetry/latest")
def get_latest_telemetry():
    """Get the latest telemetry received from Kafka (any truck)."""
    # Prefer the per-truck store as the source of truth. Tests clear
    # `latest_telemetry_by_truck` but did not clear `latest_telemetry`,
    # causing cross-test leakage. Treat an empty per-truck store as
    # having received no telemetry yet.
    with telemetry_lock:
        if not latest_telemetry_by_truck:
            return {"status": "no telemetry received yet"}
        return latest_telemetry
