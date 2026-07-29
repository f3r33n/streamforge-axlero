# 🚚 StreamForge

> A real-time fleet telemetry processing prototype developed collaboratively during the Axlero Python Development Internship 2026.

## 🎯 What We're Building

StreamForge simulates vehicle telemetry and processes it through a simple real-time data pipeline:

🚚 Vehicle Telemetry
        ↓
🐍 Python Producer
        ↓
📨 Apache Kafka
        ↓
⚙️ Stream Processing
        ↓
🔌 FastAPI
        ↓
🖥️ Dashboard

The goal is not to build a production-scale fleet platform, but a working prototype demonstrating how real-time data can be generated, transported, processed, exposed through an API, and visualized.

Example telemetry:

{
  "truck_id": "TRUCK-04",
  "speed": 52,
  "temperature": 27,
  "fuel": 64,
  "timestamp": "..."
}
🏗️ Project Structure
streamforge-axlero/
├── producer/       # Telemetry generation
├── consumer/       # Kafka consumers
├── processing/     # Analytics and business logic
├── api/            # FastAPI backend
├── frontend/       # Dashboard
├── tests/          # Tests
└── docs/           # Architecture, plans and documentation

The structure may evolve as development progresses.

👥 Development Workflow

Each member develops their assigned component on an individual branch.

Member Branch
      ↓
   develop
      ↓
Integration & Testing
      ↓
     main

main contains the stable integrated prototype.

develop is used for integration and testing.

Individual branches are used for component development.

👨‍💻 Team
Member	Role	Branch
Faizan	To be finalized	faizan
Raiba Shital Kate	To be finalized	raiba-kate
Sehajdeep Soni	To be finalized	sehajdeep
Mandaloju Varshitha	To be finalized	varshitha
Shiva Harsha	To be finalized	shiva-harsha
Meghana	Awaiting confirmation	meghana
📚 Documentation

Detailed project information is maintained in docs/.

01_EXECUTION_PLAN.md — schedule, milestones and execution strategy
02_ARCHITECTURE.md — system architecture and component interactions
03_TEAM_ROADMAP.md — roles, phases and deliverables
GIT_WORKFLOW.md — branch, commit and pull-request workflow

Presentation versions are available under docs/presentations/.

✅ Definition of Done

StreamForge succeeds when we can demonstrate:

Generate Telemetry
        ↓
Kafka Messaging
        ↓
Process Data
        ↓
FastAPI
        ↓
Dashboard
        ↓
Working Prototype

Each member should be able to demonstrate and explain their contributed component.
