# 🗺️ SIH Trip Tracker — Team MapMyWay

A full-stack trip tracking and expense management system built for **Smart India Hackathon (SIH)**. The platform combines GPS trajectory analysis, AI-powered travel classification, OCR-based expense tracking, and a conversational AI assistant into one intelligent travel companion.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🌟 Features

### 🧭 Trip Tracking
- 📍 GPS trajectory analysis using Haversine formula
- 🗂️ Process `.plt` GPS files for journey data
- 📊 Automatic classification — Business or Leisure

### 💸 Expense Management
- 🧾 OCR pipeline to extract amounts from receipts
- 🟢 Safe (under 80%) → 🟡 Warning (80–100%) → 🔴 Exceeded (over 100%)
- 📤 Export data as CSV / JSON

### 🤖 AI Capabilities
- 💬 Conversational assistant powered by **Phi-3 Mini**
- 🧠 Logistic regression model for travel classification
- 🔍 Multi-modal AI integration across three parallel models

### 🔐 Auth & Infrastructure
- 🔑 JWT-based user authentication
- 🐳 Docker deployment support
- 📱 Mobile-responsive React frontend

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, CSS |
| **Backend** | Go, Echo Framework |
| **AI / ML** | Python, Logistic Regression, Phi-3 Mini, OCR |
| **Database** | PostgreSQL / MySQL |
| **Auth** | JWT Tokens |
| **DevOps** | Docker |

---

## 📁 Project Structure

```
SIH-Trip-Tracker/
├── app/          # Mobile application code
├── backend/      # Go REST API (Echo Framework)
├── frontend/     # React + TypeScript web interface
├── models/       # Python ML models and schemas
├── scripts/      # Utility and automation scripts
├── design/       # UI/UX design assets
└── docs/         # Architecture diagrams and flowcharts
```

---

## 🚀 Getting Started

**Prerequisites** — Node.js v18+, Go 1.21+, Python 3.10+, PostgreSQL or MySQL, Docker *(optional)*

### 🖥️ Frontend
```bash
cd frontend
npm install
npm run dev
```

### ⚙️ Backend
```bash
cd backend
go mod tidy
go run main.go
```

### 🧠 ML Models
```bash
cd models
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 🐳 Docker *(optional)*
```bash
docker-compose up --build
```

---

## 👥 Team

Built with ❤️ by **Team MapMyWay** for Smart India Hackathon (SIH).

| Name | GitHub |
|------|--------|
| Harsh Naik | [![GitHub](https://img.shields.io/badge/HrsHnk--56-181717?style=flat-square&logo=github)](https://github.com/HrsHnk-56) |
| Yash Kumar Gupta | [![GitHub](https://img.shields.io/badge/AurReaper-181717?style=flat-square&logo=github)](https://github.com/AurReaper) |
| Kriti Raj | [![GitHub](https://img.shields.io/badge/kriti2110-181717?style=flat-square&logo=github)](https://github.com/kriti2110) |
| Hridambiswas | [![GitHub](https://img.shields.io/badge/Hridambiswas-181717?style=flat-square&logo=github)](https://github.com/Hridambiswas) |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
