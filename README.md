# 🚨 Real-Time Incident & Ops Center (Multi-Agent & Event-Driven)

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/AI_Orchestration-LangGraph-FF6F00?logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/WebSockets-Socket.io-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> An enterprise-grade, event-driven **Emergency Dispatch & Ops Center** powered by a **Multi-Agent AI Pipeline** (LangGraph), real-time WebSockets, BullMQ async queues, and a sleek dark-mode geospatial Leaflet map centered on Pakistan (Islamabad / Rawalpindi).

---

## 📺 Live Operational Architecture Demo

```
 ┌────────────────────────┐      ┌───────────────────────────┐      ┌─────────────────────────────┐
 │  Emergency Telemetry   │ ───► │   Node.js Backend & Queue │ ───► │  Python AI Microservice     │
 │  Streamer (4s stream)  │      │  (BullMQ + Socket.io)     │      │  (LangGraph Multi-Agent)    │
 └────────────────────────┘      └───────────────────────────┘      └──────────────┬──────────────┘
                                               │                                   │
                                               ▼                                   │
                                 ┌───────────────────────────┐                     │
                                 │   React Command Center    │ ◄───────────────────┘
                                 │   (Feed + Map + Inspector)│
                                 └───────────────────────────┘
```

### 🤖 Multi-Agent AI Pipeline Evaluation Flow
1. **Agent 1 (Triage & Classifier)**: Evaluates raw distress signals, determines incident domain (`FIRE`, `MEDICAL`, `SECURITY`, `NATURAL_HAZARD`), and assigns severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
2. **Agent 2 (Geospatial & Route Optimizer)**: Calculates Haversine distances to nearby responder units (**Rescue 1122**, **Edhi Ambulance**, **Police Eagle Squad**) and computes travel ETA bounds.
3. **Agent 3 (Summarizer & Action Planner)**: Generates a concise incident brief, a 4-step tactical responder checklist, and an automated emergency broadcast payload.

---

## ✨ Key Features

- ⚡ **Event-Driven Microservices**: Handles bursty high-frequency telemetry without dropping frames using **BullMQ** on Redis.
- 📡 **Real-Time WebSocket Gateway**: Instantly pushes incoming alerts and dispatch updates via **Socket.io** without page reloads.
- 🗺️ **Sleek Command Center Geospatial Map**: Leaflet map with Carto Dark tiles, pulsing radar markers, and automatic fly-to camera transitions.
- 🇵🇰 **Pakistan Location Native**: Pre-configured with Islamabad and Rawalpindi emergency locations (*Jinnah Avenue, Blue Area, F-6 Markaz, Nullah Lai, Saddar*).
- 🛡️ **Zero-Dependency Resilience**: Seamless in-memory fallbacks for MongoDB & Redis if Docker/databases are offline.

---

## 🛠️ Tech Stack

### Frontend (`/apps/frontend`)
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark Glassmorphism UI), Lucide Icons
- **Mapping**: Leaflet + React-Leaflet (Carto Dark Tiles)
- **Real-time**: Socket.io Client

### Backend API (`/apps/backend`)
- **Runtime**: Node.js, Express, TypeScript
- **Real-time**: Socket.io Server (Dispatch Rooms & Event Broadcasts)
- **Async Queue**: BullMQ backed by Redis
- **Database**: Mongoose / MongoDB with `2dsphere` geospatial indexing

### AI Agent Microservice (`/apps/ai-service`)
- **Framework**: Python 3.11+, FastAPI, Uvicorn
- **AI Graph**: LangGraph multi-agent orchestration
- **Data Validation**: Pydantic v2
- **Fallback Engine**: Local rule-based heuristic engine when LLM keys are omitted

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18+ 
- **Python**: v3.11+
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/real-time-ops-center.git
cd real-time-ops-center
```

### 2. Start Python AI Microservice
```bash
cd apps/ai-service
py -m pip install -r requirements.txt
py -m uvicorn main:app --port 8000
```
> Running on `http://localhost:8000` (Health check: `http://localhost:8000/health`)

### 3. Start Node.js Real-time Backend
Open a second terminal:
```bash
cd apps/backend
npm install
npm run dev
```
> Running on `http://localhost:5000`

### 4. Start React Command Center Frontend
Open a third terminal:
```bash
cd apps/frontend
npm install
npm run dev
```
> Dashboard available at **`http://localhost:3000`**

### 5. Launch Telemetry Stream Generator
Open a fourth terminal:
```bash
npm run simulate
```

---

## 📊 Live Sample Data Simulation

When running `npm run simulate`, the telemetry generator streams events like:

```json
{
  "incidentId": "INC-PAK-8912",
  "title": "Commercial Building Fire - Jinnah Avenue Islamabad",
  "rawPayload": "CRITICAL: Heavy smoke emitting from 3rd floor plaza. Rescue 1122 fire tender dispatched.",
  "coordinates": [73.0551, 33.7088],
  "category": "FIRE",
  "severity": "CRITICAL",
  "aiAnalysis": {
    "suggestedUnits": [
      { "name": "Rescue 1122 Fire Tender 101", "etaMinutes": 3, "status": "AVAILABLE" },
      { "name": "Rescue 1122 Ambulance 204", "etaMinutes": 5, "status": "AVAILABLE" }
    ],
    "actionPlan": [
      { "stepNumber": 1, "action": "Dispatch Rescue 1122 Fire Tender 101 under sirens.", "priority": "URGENT", "assignedRole": "Dispatcher" },
      { "stepNumber": 2, "action": "Establish 200m perimeter on Jinnah Avenue.", "priority": "HIGH", "assignedRole": "On-Scene Commander" }
    ]
  }
}
```

---

## 📁 Repository Structure

```
real-time-ops-center/
├── docker-compose.yml           # Local Redis & MongoDB services
├── package.json                 # Root monorepo configuration
├── README.md                    # Project documentation
├── scripts/
│   └── simulate-stream.ts       # High-velocity emergency event stream generator
└── apps/
    ├── ai-service/              # Python FastAPI + LangGraph AI Microservice
    ├── backend/                 # Node.js + Express + Socket.io + BullMQ
    └── frontend/                # React 18 + Vite + Tailwind CSS + Leaflet
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
