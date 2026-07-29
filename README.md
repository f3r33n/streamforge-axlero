
# 🚚 StreamForge

> A real-time fleet telemetry processing prototype built collaboratively during the Axlero Python Development Internship.

## 📌 Project Overview

StreamForge is a team project designed to simulate and process real-time telemetry data from a fleet of vehicles.

The prototype follows a simple pipeline:

**Telemetry Generator → Kafka → Stream Processing → FastAPI → Dashboard**

Instead of attempting to build a production-scale distributed system, our goal is to create a **working and demonstrable prototype** where each component can be developed, tested, and integrated step by step.

---

## 🧠 How StreamForge Works

```text
🚚 Fake Vehicle Telemetry
          │
          ▼
🐍 Telemetry Producer
          │
          ▼
📨 Apache Kafka
          │
          ▼
⚙️ Stream Processing
          │
          ▼
🔌 FastAPI
          │
          ▼
🖥️ Dashboard
````

Example telemetry event:

```json
{
  "truck_id": "TRUCK-04",
  "speed": 52,
  "temperature": 27,
  "fuel": 64,
  "timestamp": "..."
}
```

The system will progressively transform raw telemetry into useful information such as:

* Current vehicle status
* Average speed
* Fuel levels
* Temperature warnings
* Low-fuel alerts
* Active vehicle statistics

---

# 🏗️ Planned Project Structure

```text
streamforge-axlero/
│
├── producer/          # Telemetry generation
├── consumer/          # Kafka consumers
├── processing/        # Stream processing and business logic
├── api/               # FastAPI backend
├── frontend/          # Dashboard
├── tests/             # Project tests
├── docs/              # Team documentation and project PDFs
│
├── requirements.txt
├── .gitignore
└── README.md
```

The structure may evolve as development progresses.

---

# 👥 Team Workflow

Development follows a shared Git workflow.

```text
Individual Member Branch
          │
          ▼
       develop
          │
          ▼
 Integration & Testing
          │
          ▼
         main
```

Each member works primarily on their assigned component using their personal branch.

Current branches:

```text
main
develop

faizan
meghana
raiba-kate
sehajdeep
shiva-harsha
varshitha
```

### Branch Rules

**`main`**

* Stable project version
* Final integrated code
* Do not directly experiment here

**`develop`**

* Integration branch
* Completed components are combined and tested here

**Member branches**

* Individual development workspace
* Members commit and push their assigned work here

---

# 🧩 Development Strategy

StreamForge will be developed incrementally rather than attempting the entire system at once.

### Stage 1 — Telemetry

Generate realistic simulated vehicle data.

### Stage 2 — Messaging

Transport telemetry events through Kafka.

### Stage 3 — Processing

Consume telemetry and calculate useful statistics, states, and alerts.

### Stage 4 — API

Expose processed information through FastAPI endpoints.

### Stage 5 — Dashboard

Display fleet information through a simple user interface.

### Stage 6 — Integration & Testing

Connect all components and stabilize the complete prototype.

```text
Producer
   ↓
Kafka
   ↓
Processor
   ↓
FastAPI
   ↓
Dashboard
   ↓
Working StreamForge Prototype
```

---

# 📚 Team Documentation

Detailed planning material is maintained inside the [`docs/`](docs/) directory.

Recommended documents:

### 📘 01 — StreamForge Execution Plan

Team workflow, development schedule, Git strategy, milestones, and initial implementation plan.

`docs/StreamForge_Execution_Plan.pdf`

### 📗 02 — StreamForge Prototype Explained

A simplified explanation of what we are actually building and how the complete system works.

`docs/StreamForge_Prototype_Explained.pdf`

### 📙 03 — Team Roles & Development Roadmap

Individual responsibilities, component ownership, development phases, dependencies, and expected deliverables.

`docs/StreamForge_Team_Roadmap.pdf`

> The third document will be added after final team roles and responsibilities are confirmed.

---

# 👨‍💻 Team

| Member              | Primary Responsibility | Branch         |
| ------------------- | ---------------------- | -------------- |
| Faizan              | To be finalized        | `faizan`       |
| Raiba Shital Kate   | To be finalized        | `raiba-kate`   |
| Sehajdeep Soni      | To be finalized        | `sehajdeep`    |
| Mandaloju Varshitha | To be finalized        | `varshitha`    |
| Shiva Harsha        | To be finalized        | `shiva-harsha` |
| Meghana             | Awaiting confirmation  | `meghana`      |

Roles will be assigned according to project requirements, existing skills, learning requirements, and workload balance.

---

# 🎯 Prototype Philosophy

The priority is:

> **Make the core pipeline work first. Improve it second.**

A small working system is more valuable than a large collection of unfinished features.

Therefore development priority is:

**Core pipeline → Integration → Reliability → UI → Additional features**

Advanced features may be simplified when necessary while preserving the main architecture and learning objectives.

---

# 🧪 Definition of Done

The prototype will be considered successful when we can demonstrate:

```text
Generate telemetry
       ✅
        ↓
Send through Kafka
       ✅
        ↓
Process telemetry
       ✅
        ↓
Expose through API
       ✅
        ↓
Display results
       ✅
```

Each team member should also be able to explain the component they contributed to during the final project review.

---



## 🚀 StreamForge Team

**Axlero Python Development Internship — 2026**

Built collaboratively, one component at a time.

````

```text
docs/
│
├── 01_StreamForge_Execution_Plan.pdf
├── 02_StreamForge_Prototype_Explained.pdf
└── 03_StreamForge_Team_Roadmap.pdf
````

PDF #1 = **How we're managing the project**
PDF #2 = **What the hell we're actually building** 😂
PDF #3 = **Who builds what, in what order, with what deliverables**

That third one is the important one we'll create **after assigning the five active people their roles**. It can become the team's actual day-to-day manual rather than burying another 4,000 words inside the README.

One small correction before uploading: your actual GitHub invite screenshot shows Varshitha's account as **`mandalojuvarshitha-source`**, not `Mandalojuvarshitha`. Use the account GitHub actually resolved when documenting contributors.
