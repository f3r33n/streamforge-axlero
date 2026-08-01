# 🚚 StreamForge Axlero - Producer Module

## 📖 Overview

The Producer module simulates a fleet of trucks and continuously generates real-time telemetry data.

Currently, telemetry is stored in a **JSONL (`telemetry.jsonl`)** file. The module is designed so that the output can later be redirected to **Apache Kafka** without changing the simulation logic.

---

# ✨ Features

* Fleet simulation using Object-Oriented Programming
* Multiple truck simulation
* Dynamic speed updates
* Fuel consumption
* Engine temperature simulation
* GPS location simulation
* Driver ID generation
* Route ID generation
* Truck status monitoring
* Alert generation

  * LOW_FUEL
  * HIGH_ENGINE_TEMPERATURE
  * OVERSPEED
* Configurable parameters using `config.py`
* JSONL telemetry output

---

# 📁 Project Structure

```text
producer/
│── __init__.py
│── config.py
│── truck.py
│── telemetry_generator.py
│── telemetry.jsonl
```

---

# ▶️ Running the Producer

Activate the virtual environment

```bash
.venv\Scripts\activate
```

Run the producer

```bash
python producer/telemetry_generator.py
```

---

# 📦 Sample Telemetry

```json
{
    "truck_id": "TRUCK-01",
    "driver_id": "DRIVER-01",
    "route_id": "ROUTE-01",
    "speed": 58,
    "fuel": 82.40,
    "temperature": 31.8,
    "latitude": 18.520430,
    "longitude": 73.856743,
    "status": "MOVING",
    "alerts": [
        "NORMAL"
    ],
    "timestamp": "2026-08-01T15:32:40.128431"
}
```

---

# ⚙️ Configuration

Simulation parameters can be modified in `config.py`.

Examples:

* Fleet Size
* Simulation Interval
* Speed Limits
* Fuel Threshold
* Temperature Threshold
* Overspeed Threshold

---

# 🚀 Future Improvements

* Apache Kafka Integration
* Live Dashboard
* REST API
* Database Storage
* Fleet Analytics
* Route Monitoring

---

# 👨‍💻 Developer

**Producer Module Developed By**

**Raiba Kate**

Artificial Intelligence & Data Science

Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology
