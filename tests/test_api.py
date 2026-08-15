from fastapi.testclient import TestClient

from api.main import (
    app,
    latest_telemetry_by_truck,
    telemetry_lock,
    store_telemetry,
)


def setup_function():
    with telemetry_lock:
        latest_telemetry_by_truck.clear()


def sample_truck(truck_id="TRUCK-01", alerts=None):
    return {
        "event_id": "test-event",
        "truck_id": truck_id,
        "driver_id": "DRIVER-01",
        "route_id": "ROUTE-01",
        "speed": 72,
        "fuel": 55.5,
        "temperature": 31.2,
        "latitude": 18.55,
        "longitude": 73.88,
        "status": "MOVING",
        "alerts": alerts or ["NORMAL"],
        "timestamp": "2026-08-02T20:05:47.237114",
    }


client = TestClient(app)


def test_health_empty():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["trucks_tracked"] == 0


def test_trucks_empty():
    response = client.get("/trucks")
    assert response.status_code == 200
    assert response.json() == []


def test_stats_empty():
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_trucks"] == 0
    assert data["active_count"] == 0
    assert data["avg_speed"] == 0.0
    assert data["avg_fuel"] == 0.0
    assert data["alert_counts"] == {}


def test_store_and_list_trucks():
    store_telemetry(sample_truck("TRUCK-01"))
    store_telemetry(sample_truck("TRUCK-02", alerts=["LOW_FUEL"]))

    response = client.get("/trucks")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_truck_by_id():
    store_telemetry(sample_truck("TRUCK-01"))

    response = client.get("/trucks/TRUCK-01")
    assert response.status_code == 200
    assert response.json()["truck_id"] == "TRUCK-01"

    missing = client.get("/trucks/TRUCK-99")
    assert missing.status_code == 404


def test_stats_with_trucks():
    store_telemetry(sample_truck("TRUCK-01", alerts=["NORMAL"]))
    store_telemetry(
        {
            **sample_truck("TRUCK-02"),
            "speed": 48,
            "fuel": 44.5,
            "alerts": ["LOW_FUEL"],
        }
    )

    response = client.get("/stats")
    data = response.json()
    assert data["total_trucks"] == 2
    assert data["active_count"] == 2
    assert data["avg_speed"] == 60.0
    assert data["alert_counts"]["LOW_FUEL"] == 1


def test_alerts_from_trucks():
    store_telemetry(sample_truck("TRUCK-03", alerts=["OVERSPEED", "LOW_FUEL"]))

    response = client.get("/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) == 2
    types = {a["alert_type"] for a in alerts}
    assert types == {"OVERSPEED", "LOW_FUEL"}


def test_normalize_alert_field():
    store_telemetry(
        {
            **sample_truck("TRUCK-04"),
            "alert": ["NORMAL"],
        }
    )

    response = client.get("/trucks/TRUCK-04")
    data = response.json()
    assert "alerts" in data
    assert "alert" not in data
    assert data["alerts"] == ["NORMAL"]


def test_telemetry_latest_no_data():
    response = client.get("/telemetry/latest")
    assert response.status_code == 200
    assert response.json()["status"] == "no telemetry received yet"
