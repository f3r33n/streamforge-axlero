# 🚚 StreamForge

> A real-time fleet telemetry processing prototype developed collaboratively during the Axlero Python Development Internship 2026.

## PDF GUIDES --

**Axlero Python Development Internship — 2026**
Built collaboratively, one component at a time. 

├─ 01_StreamForge_Execution_Plan.pdf [StreamForge_Execution_Plan.pptx](https://github.com/user-attachments/files/30516638/StreamForge_Execution_Plan.pptx) 


├── 02_StreamForge_Prototype_Explained.pdf [StreamForge_Architecture_.pdf](https://github.com/user-attachments/files/30516635/StreamForge_Architecture_.pdf) 


└── 03_StreamForge_Team_Roadmap.pdf [StreamForge_Detailed_Roles_Presentation.pdf](https://github.com/user-attachments/files/30516630/StreamForge_Detailed_Roles_Presentation.pdf)


## 🎯 What is StreamForge?

StreamForge simulates vehicle telemetry and processes it through a simple real-time data pipeline.

```text
🚚 Telemetry Generator
        ↓
📨 Apache Kafka
        ↓
⚙️ Stream Processing
        ↓
🔌 FastAPI
        ↓
🖥️ Dashboard
```

The objective is to build a **working and demonstrable prototype**, developing and integrating each component incrementally.

## 🏗️ Project Structure

```text
streamforge-axlero/
├── producer/       # Telemetry generation
├── consumer/       # Kafka consumers
├── processing/     # Analytics and business logic
├── api/            # FastAPI backend
├── frontend/       # Dashboard
├── tests/          # Tests
└── docs/           # Architecture, planning and team documentation
```

The structure may evolve as development progresses.

## 👥 Development Workflow

```text
Member Branch
      ↓
   develop
      ↓
Integration & Testing
      ↓
     main
```

- `main` — stable integrated version
- `develop` — integration and testing
- Member branches — individual development work

Code is tested before being merged into the stable project.

## 📚 Documentation

Detailed project information is maintained separately:

- [📘 Execution Plan](docs/01_EXECUTION_PLAN.md)
- [📗 Architecture & Prototype](docs/02_ARCHITECTURE.md)
- [📙 Team Roadmap](docs/03_TEAM_ROADMAP.md)
- [🤝 Contribution Guide](CONTRIBUTING.md)

Presentations and project PDFs are stored in `docs/presentations/`.

## 👨‍💻 Team

| Member | Branch |
|---|---|
| Faizan | `faizan (LEADER)` |
| Raiba Shital Kate | `raiba-kate` |
| Sehajdeep Soni | `sehajdeep` |
| Mandaloju Varshitha | `varshitha` |
| Shiva Harsha | `shiva-harsha` |
| Meghana | `meghana` |

Technical responsibilities will be finalized according to project requirements and workload distribution.

## ✅ Core Goal

```text
Generate → Transport → Process → Expose → Display
   ✅          ✅          ✅         ✅        ✅
```

**Build the core pipeline first. Improve it second.**

## 📄 License

This project is licensed under the [MIT License](LICENSE).
