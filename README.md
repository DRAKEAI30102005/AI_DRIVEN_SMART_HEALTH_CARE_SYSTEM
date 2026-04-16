# AI Driven Smart Health Care System 🩺

An AI-powered patient care platform for smart health monitoring, doctor discovery, local AI assistance, and medical image screening.

## 🧠 Problem Statement

Healthcare systems often struggle to give patients one connected experience for daily monitoring, doctor access, image-based screening, and intelligent assistance. Many solutions are fragmented, hard to use, or unavailable in low-resource workflows.

This project aims to bring those pieces together into one modern healthcare interface that supports patients with monitoring, reporting, AI-guided support, and future-ready diagnostic workflows.

## 🎯 Features

- Simple patient login flow for quick app access
- Futuristic healthcare dashboard for core patient actions
- Doctor discovery and appointment booking workflow
- Daily health monitoring with risk-oriented analysis flow
- Care team dashboard and shared patient report support
- Local Ollama-powered AI assistant inside the app
- AI scan screen for skin and dental image workflows
- YOLO-based training pipeline setup for skin and dental screening models
- Dental annotation guide and dataset validation pipeline

## 🏗️ System Architecture / How It Works

### Core App Flow

Patient Login → Dashboard → Monitoring / Doctors / AI Scan / AI Assistant → Analysis → Shared Reports / Follow-up Care

### AI Assistant Flow

User Question → HealthPulse AI UI → Local Ollama API → Response Returned Inside App

### Medical Image Workflow

Upload Image → YOLO Service → Detection / Screening Output → Annotated Result → Stored Scan Record

### Dental AI Training Pipeline

Dental Image Dataset → YOLO Labels → Dataset Validation → Data Augmentation → YOLO Training → Local Inference Service → App Integration

## ⚙️ Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- UI / Motion: Lucide React, Motion
- Routing: React Router
- Authentication / Data: Firebase
- AI Assistant: Local Ollama
- AI/ML Services: Google GenAI integration, YOLO training/inference pipeline
- ML Tooling: Python, Ultralytics YOLO, Pillow
- Utilities: date-fns, clsx, tailwind-merge

## 📂 Project Structure

```text
AI_DRIVEN_SMART_HEALTH_CARE_SYSTEM/
│── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── services/
│   ├── App.tsx
│   ├── firebase.ts
│   ├── index.css
│   └── main.tsx
│── ml/
│   ├── train_yolo.py
│   ├── yolo_service.py
│   ├── validate_yolo_dataset.py
│   ├── augment_yolo_dataset.py
│   ├── dental_annotation_guide.md
│   └── README.md
│── datasets/
│   ├── dental/
│   └── skin/
│── storyboard/
│── package.json
│── firestore.rules
│── vite.config.ts
│── tsconfig.json
│── README.md
```

## 🚀 Installation & Setup

### 1. Clone the repository

```powershell
git clone https://github.com/DRAKEAI30102005/AI_DRIVEN_SMART_HEALTH_CARE_SYSTEM.git
cd AI_DRIVEN_SMART_HEALTH_CARE_SYSTEM
```

### 2. Install frontend dependencies

```powershell
npm install
```

### 3. Run the app

```powershell
npm run dev
```

The app runs on:

- `http://localhost:3000`

### 4. Demo login

Use these credentials inside the app:

- Username: `admin`
- Password: `admin123`

### 5. Optional: run the YOLO local inference service

```powershell
npm run yolo:serve
```

### 6. Optional: validate and prepare the dataset

```powershell
npm run yolo:validate:skin
npm run yolo:validate:dental
npm run yolo:augment:skin
npm run yolo:augment:dental
```

### 7. Optional: train the YOLO models

```powershell
python ml/train_yolo.py --scan-type skin --data datasets/skin/data.yaml --epochs 80
python ml/train_yolo.py --scan-type dental --data datasets/dental/dental.yaml --epochs 80
```

## 📊 Results / Output

The project currently delivers:

- A futuristic patient-facing web app
- Local AI assistant chat powered by Ollama
- Daily health monitoring analysis workflow
- Doctor booking and appointment experience
- Shared patient report support
- YOLO-ready medical image training and inference pipeline

Recommended hackathon demo outputs:

- Login screen screenshot
- Dashboard screenshot
- AI assistant screenshot
- Daily monitoring analysis screenshot
- Doctor booking screenshot
- YOLO scan result screenshot after model training

## ⚠️ Challenges Faced

- Replacing incomplete cloud-auth flows with a simpler local login flow
- Designing a modern healthcare UI while keeping it usable
- Integrating local Ollama without opening the Ollama UI itself
- Building a truthful YOLO workflow without pretending a model was trained without data
- Structuring skin and dental datasets for real future training
- Separating descriptive medical knowledge from actual trainable labeled image data

## 🔮 Future Scope

- Add real labeled skin and dental datasets and train stronger YOLO weights
- Expand from detection to segmentation and multi-label tooth analysis
- Add full AI dental report generation per tooth
- Add wearable / IoT health device integration
- Add alerting for danger thresholds in daily monitoring
- Add teleconsultation and live doctor/caregiver view
- Add offline and low-bandwidth support for rural healthcare use cases
- Add exportable EHR-style patient summaries

## 🤝 Contributors

- Aritra Ghosh
- Codex AI collaboration support

## 📜 License

This project currently does not include a formal open-source license.

If you plan to publish it for reuse, adding an MIT License is a good next step.
