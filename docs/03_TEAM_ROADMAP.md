# 📙 StreamForge Team Roadmap

## Purpose

This document defines component ownership, individual development phases, dependencies and deliverables.

Roles will be finalized after team availability and technical capabilities are confirmed.

## Component Ownership

| Role | Member | Component | Status |
|---|---|---|---|
| Telemetry / Producer | TBD | Telemetry generation | ⏳ |
| Kafka / Messaging | TBD | Event transport | ⏳ |
| Stream Processing | TBD | Analytics and alerts | ⏳ |
| FastAPI | TBD | REST backend | ⏳ |
| Dashboard | TBD | User interface | ⏳ |

## Dependency Chain

```text
Telemetry
    ↓
Kafka
    ↓
Processing
    ↓
FastAPI
    ↓
Dashboard
```

Components should also be developed independently using sample/mock inputs where possible so that one unfinished component does not block the entire team.

## Shared Responsibilities

Every member is responsible for:

- Developing their assigned component
- Testing their component
- Maintaining understandable code
- Documenting important implementation details
- Communicating dependencies and interface changes
- Participating in integration
- Understanding their contribution for the final review

## Integration

Completed work should move through:

```text
Personal Branch
      ↓
Review
      ↓
develop
      ↓
Integration Testing
      ↓
main
```

Detailed Phase 1–5 responsibilities will be added after final role allocation.
