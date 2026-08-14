# 🚨 Real-Time Incident & Ops Center (Multi-Agent & Event-Driven)

[![Vercel Deployment](https://img.shields.io/badge/Production-Live_on_Vercel-000000?logo=vercel&logoColor=white)](https://real-time-ops-center-shammazfarees-projects.vercel.app)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Upstash Redis](https://img.shields.io/badge/Queue-Upstash_Redis-00E599?logo=redis&logoColor=white)](https://upstash.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/AI_Orchestration-LangGraph-FF6F00?logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> An enterprise-grade, event-driven **Emergency Dispatch & Ops Center** powered by a **Domain-Strict Multi-Agent AI Pipeline** (LangGraph), MongoDB Atlas GeoJSON 2dsphere indexing, Upstash Redis queues, and a sleek dark-mode geospatial Leaflet map centered on Pakistan (Islamabad / Rawalpindi).

👉 **Live Demo**: **[https://real-time-ops-center-shammazfarees-projects.vercel.app](https://real-time-ops-center-shammazfarees-projects.vercel.app)**

---

## 📺 Live Operational Architecture

```
 ┌───────────────────────────┐      ┌──────────────────────────────┐      ┌─────────────────────────────┐
 │    Emergency Telemetry    │ ───► │  Vercel Serverless Express   │ ───► │   MongoDB Atlas (Database)  │
 │  Streamer (Pakistan Grid) │      │  Backend & Queue Gateway     │      │   & Upstash Redis (Queue)   │
 └───────────────────────────┘      └──────────────┬───────────────┘      └─────────────────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │   Multi-Agent AI Pipeline    │
                                    │   (LangGraph Orchestration)  │
                                    └──────────────┬───────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │   React Command Center UI    │
                                    │   (Feed + Map + Inspector)   │
                                    └──────────────────────────────┘
```

### 🤖 Multi-Agent AI Evaluation Flow

1. **Agent 1 (Triage & Classifier)**: Analyzes incoming distress telemetry text in real time, determines domain (`FIRE`, `MEDICAL`, `SECURITY`, `NATURAL_HAZARD`), and assigns severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with a confidence metric.
2. **Agent 2 (Geospatial & Route Optimizer)**: Takes exact GPS coordinates `[lng, lat]`, applies strict domain compatibility filtering (e.g. Police Eagle Squads for robberies, Rescue 1122 Ambulances / Edhi for medical calls, Rescue 1122 Fire Tenders for fires), and runs spatial Haversine distance calculations to compute travel ETAs.
3. **Agent 3 (Summarizer & Action Planner)**: Synthesizes findings, assigns the primary lead unit to Step 1, generates a domain-tailored 4-step tactical checklist with assigned operational roles (*Dispatcher, On-Scene Commander, Intel Analyst, Triage Nurse*), and drafts an emergency broadcast alert.

---

## ✨ Key Features

- 🇵🇰 **Pakistan Location Native**: Pre-configured with Islamabad and Rawalpindi emergency locations (*Jinnah Avenue, Blue Area, F-6 Markaz, Nullah Lai, Saddar Rawalpindi*).
- 🚒 **Domain-Strict Emergency Units**: Integrates real Pakistan emergency responder services (**Rescue 1122 Fire Tenders**, **Rescue 1122 Ambulances**, **Edhi Foundation Ambulance 115**, **Islamabad Police Eagle Squad**, **Punjab Police Patrol**).
- 🗺️ **Sleek Dark Geospatial Map**: Leaflet map with Carto Dark tiles, pulsing radar markers, and automatic camera fly-to animations on incident selection.
- ⚡ **Interactive Dispatcher Controls**: One-click responder unit dispatching, live status state updates (`OPEN` ➔ `IN_PROGRESS`), and interactive checklist completion checkmarks.
- 🛡️ **Cloud Production Stack**: Single-repo Serverless Node.js Express backend and Vite React frontend deployed on **Vercel** with **MongoDB Atlas** and **Upstash Redis**.

---

## 📊 Live Sample Data Payload

```json
{
  "incidentId": "INC-PAK-1311",
  "title": "Armed Robbery Security Alert - Blue Area Islamabad",
  "rawPayload": "CRITICAL SECURITY: Silent panic alarm triggered at retail bank branch in Blue Area. Armed perpetrators fled on motorcycle toward Khyaban-e-Iqbal.",
  "category": "SECURITY",
  "severity": "CRITICAL",
  "location": { "type": "Point", "coordinates": [73.0612, 33.7112] },
  "aiAnalysis": {
    "category": "SECURITY",
    "severity": "CRITICAL",
    "confidence": 0.94,
    "suggestedUnits": [
      { "name": "Islamabad Police Mobile 309", "unitType": "Police Eagle Squad", "distanceKm": 0.91, "etaMinutes": 2, "status": "AVAILABLE" },
      { "name": "Punjab Police Patrol 402", "unitType": "Armed Response Vehicle", "distanceKm": 1.05, "etaMinutes": 2, "status": "AVAILABLE" }
    ],
    "actionPlan": [
      { "stepNumber": 1, "action": "Dispatch Islamabad Police Mobile 309 immediately to establish security perimeter.", "priority": "URGENT", "assignedRole": "Police Dispatcher" },
      { "stepNumber": 2, "action": "Issue tactical alert to nearby police patrol units for suspect vehicle interception.", "priority": "HIGH", "assignedRole": "Duty Sergeant" },
      { "stepNumber": 3, "action": "Review live SafeCity CCTV feeds along escape route.", "priority": "HIGH", "assignedRole": "Intel Analyst" },
      { "stepNumber": 4, "action": "Log armed robbery report in central police CAD system.", "priority": "ROUTINE", "assignedRole": "Records Officer" }
    ],
    "broadcastMessage": "FLASH ALERT [CRITICAL] - SECURITY INCIDENT DETECTED AT [33.7112, 73.0612]. ASSIGNED PRIMARY: Islamabad Police Mobile 309."
  }
}
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ShammazFarees/real-time-ops-center.git
cd real-time-ops-center
```

### 2. Start Python AI Microservice
```bash
cd apps/ai-service
py -m pip install -r requirements.txt
py main.py
```
> Running on `http://localhost:8000`

### 3. Start Node.js Backend API
Open a second terminal:
```bash
cd apps/backend
npm install
npm run dev
```
> Running on `http://localhost:5000`

### 4. Start React Frontend Dashboard
Open a third terminal:
```bash
cd apps/frontend
npm install
npm run dev
```
> Running on `http://localhost:3000`

### 5. Launch Telemetry Stream Generator
Open a fourth terminal:
```bash
npm run simulate
```

---

## 📁 Repository Structure

```
real-time-ops-center/
├── api/                         # Vercel Serverless Express API Entrypoint
├── docker-compose.yml           # Local Redis & MongoDB services
├── vercel.json                  # Vercel Monorepo Serverless Configuration
├── README.md                    # Project Documentation
├── scripts/
│   └── simulate-stream.ts       # High-Velocity Telemetry Stream Generator
└── apps/
    ├── ai-service/              # Python FastAPI + LangGraph AI Microservice
    ├── backend/                 # Node.js + Express + Mongoose + Socket.io
    └── frontend/                # React 18 + Vite + Tailwind CSS + Leaflet
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
