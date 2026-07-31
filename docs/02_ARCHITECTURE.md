# 📗 StreamForge Architecture

## What Are We Building?

StreamForge is a prototype real-time fleet telemetry system.

Instead of connecting to real vehicles, the system generates simulated telemetry using Python.

Example event:

```json
{
  "truck_id": "TRUCK-04",
  "speed": 52,
  "temperature": 27,
  "fuel": 64,
  "latitude": 34.16,
  "longitude": 74.87,
  "timestamp": "2026-07-30T12:30:00"
}
```

These events travel through several components.

## Architecture

```text
┌─────────────────────┐
│ Telemetry Generator │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│    Apache Kafka     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Stream Processing  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│       FastAPI       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│      Dashboard      │
└─────────────────────┘
```

## 1. Telemetry Generator

Python generates simulated vehicle information such as:

- Vehicle ID
- Speed
- Fuel level
- Temperature
- Location
- Timestamp

The generator continuously produces events that represent vehicles reporting their current state.

## 2. Kafka

Apache Kafka provides the messaging layer.

```text
Producer → Kafka Topic → Consumer
```

It transports telemetry events between the producer and downstream processing components.

## 3. Stream Processing

Incoming telemetry is processed to derive useful information.

Possible outputs include:

- Latest vehicle state
- Average speed
- Active vehicle count
- Fuel status
- Temperature status
- Low-fuel alerts
- Other simple telemetry warnings

## 4. FastAPI

FastAPI exposes processed information through REST endpoints.

Possible endpoints include:

```text
GET /health
GET /trucks
GET /trucks/{id}
GET /stats
GET /alerts
```

The exact endpoints may evolve during development.

## 5. Dashboard

The dashboard consumes information from the API and presents it visually.

It may display:

- Active vehicles
- Vehicle telemetry
- Fleet statistics
- Alerts
- Vehicle status

## Prototype Scope

StreamForge is an internship prototype.

The goal is NOT to reproduce a production-scale logistics platform.

The priority is:

```text
Working Core Pipeline
        ↓
Reliable Integration
        ↓
Usable Interface
        ↓
Optional Improvements
```

Advanced features may be simplified when necessary while preserving the core architecture.
