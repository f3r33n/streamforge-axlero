# 🚚 StreamForge Axlero - Producer Module

## 📖 Overview

The **Producer Module** simulates a fleet of trucks and continuously generates real-time telemetry data.

Each truck produces realistic telemetry including speed, fuel level, engine temperature, GPS location, driver information, route assignment, truck status, alerts, and timestamps.

Currently, telemetry is generated and written to a **JSON Lines (`telemetry.jsonl`)** file. The module is designed so that the output can later be redirected to **Apache Kafka** without changing the simulation logic.

---

# ✨ Features

- Fleet simulation using Object-Oriented Programming
- Multiple truck simulation
- Dynamic speed updates
- Fuel consumption simulation
- Engine temperature simulation
- GPS location simulation
- Driver ID generation
- Route ID generation
- Truck status monitoring
- Unique Event ID generation (UUID)
- Alert generation
  - LOW_FUEL
  - HIGH_ENGINE_TEMPERATURE
  - OVERSPEED
- Configurable parameters using `config.py`
- JSON Lines (`telemetry.jsonl`) output
- Basic unit tests using `pytest`

---

# 📁 Project Structure

```text
streamforge-axlero/
│
├── producer/
│   ├── __init__.py
│   ├── config.py
│   ├── truck.py
│   ├── telemetry_generator.py
│   └── telemetry.jsonl
│
├── tests/
│   └── test_truck.py
│
└── README.md
```

---

# ▶️ Running the Producer

Activate the virtual environment:

```bash
.venv\Scripts\activate
```

Run the Producer:

```bash
python producer/telemetry_generator.py
```

To stop the simulation safely:

```text
Press Ctrl + C
```

The Producer exits gracefully without displaying a traceback.

---

# 🧪 Running Tests

Run the unit tests using:

```bash
python -m pytest
```

Expected output:

```text
4 passed
```

---

# 📦 Sample Telemetry

```json
{
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "truck_id": "TRUCK-01",
    "driver_id": "DRIVER-01",
    "route_id": "ROUTE-01",
    "speed": 58,
    "fuel": 82.40,
    "temperature": 31.8,
    "latitude": 18.520430,
    "longitude": 73.856743,
    "status": "MOVING",
    "alert": [
        "NORMAL"
    ],
    "timestamp": "2026-08-01T15:32:40.128431"
}
```

---

# ⚙️ Configuration

Simulation parameters can be modified in `producer/config.py`.

Available configuration includes:

- Fleet Size
- Simulation Interval
- Minimum & Maximum Speed
- Minimum & Maximum Temperature
- Low Fuel Threshold
- High Temperature Threshold
- Overspeed Threshold

---

# 🚀 Future Improvements

- Apache Kafka Integration
- Real-time Stream Processing
- Live Dashboard
- Database Storage
- Fleet Analytics
- Route Monitoring

---

## 👨‍💻 Producer Module

**Primary Contributor:** Raiba Kate

B.Tech – Artificial Intelligence & Data Science

Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology