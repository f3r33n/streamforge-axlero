# 📘 StreamForge Execution Plan

## Purpose

This document defines how the StreamForge team will organize, develop, integrate, and review the project.

## Development Principle

StreamForge will be developed incrementally.

```text
Component Development
        ↓
Component Testing
        ↓
Integration into develop
        ↓
System Testing
        ↓
Stable Release to main
```

The team will prioritize a working prototype before implementing optional or advanced features.

## Git Workflow

The repository uses three branch categories.

### `main`

Contains the stable and integrated version of StreamForge.

Experimental or incomplete work should not be developed directly on `main`.

### `develop`

Acts as the integration branch.

Completed components are merged here and tested together before reaching `main`.

### Member Branches

Each team member has an individual development branch:

```text
faizan
raiba-kate
sehajdeep
varshitha
shiva-harsha
meghana
```

Members primarily develop and test their assigned components within their respective branches.

## Integration Workflow

```text
Member Branch
      ↓
Component Completed
      ↓
Review / Testing
      ↓
develop
      ↓
Integration Testing
      ↓
main
```

## Development Stages

### Stage 1 — Telemetry Generation
Generate simulated fleet telemetry.

### Stage 2 — Messaging
Transport telemetry through Kafka.

### Stage 3 — Processing
Transform telemetry into useful states, statistics and alerts.

### Stage 4 — API
Expose processed information through FastAPI.

### Stage 5 — Dashboard
Display fleet information through a simple interface.

### Stage 6 — Integration
Connect and test the complete pipeline.

## Team Principles

1. Keep components small and understandable.
2. Test components before integration.
3. Do not merge knowingly broken code into `main`.
4. Communicate interface changes that affect another component.
5. Commit meaningful development progress regularly.
6. Document the component you develop.
7. Prioritize the core prototype over unnecessary complexity.

## Final Objective

The final demonstration should show:

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

The project is considered successful when this pipeline can be demonstrated and explained by the team.
