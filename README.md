# CT University Task Assignment, Monitoring & Faculty Workflow System

Production-quality cross-platform task assignment and monitoring system built with a single **Flutter** mobile application (Android & iOS) and a modular **NestJS (TypeScript)** backend backed by **PostgreSQL** and **Redis + BullMQ**.

---

## 📁 Repository Structure

```
task assignement/
├── backend/                  # NestJS + TypeScript Enterprise API
│   ├── src/
│   │   ├── common/           # Decorators, Guards, Interceptors, Filters
│   │   ├── config/           # Environment configuration service
│   │   └── modules/          # Auth, Users, Tasks, Extensions, Chat, Reports, Audit...
│   ├── prisma/               # PostgreSQL Database Schema & Config
│   └── .env.example
├── mobile/                   # Flutter Cross-Platform Mobile Application
│   ├── lib/
│   │   ├── app/              # App router & Theme tokens
│   │   ├── core/             # Api client, Secure storage, Environment config
│   │   └── features/         # Feature-first modules (Auth, Tasks, Extensions, Reports...)
│   └── pubspec.yaml
├── docs/                     # Architecture & Checkpoint Documentation
│   └── MASTER_IMPLEMENTATION_PLAN.md
├── docker-compose.yml        # Local PostgreSQL 16 & Redis 7 development containers
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

- **Mobile Client**: Flutter 3.x, Dart, Riverpod (v2.x), GoRouter, Dio, FlutterSecureStorage.
- **Backend API**: NestJS (TypeScript), Swagger/OpenAPI (`/api/v1/docs`), ValidationPipe, Global Exception Filters.
- **Database & ORM**: PostgreSQL 16 + Prisma ORM.
- **Queue & Cache**: Redis 7 + BullMQ.
- **Real-Time Communication**: Socket.io WebSockets.

---

## 🚀 Quick Start Guide

### 1. Local Database & Redis Containers
```bash
# Start PostgreSQL (port 5432) and Redis (port 6379)
docker-compose up -d
```

### 2. Backend Setup & Startup
```bash
cd backend

# Install dependencies
npm install

# Validate Prisma schema
npx prisma validate

# Run backend development server
npm run start:dev
```
- API Base URL: `http://localhost:3000/api/v1`
- Health Endpoint: `http://localhost:3000/api/v1/health`
- Swagger Documentation: `http://localhost:3000/api/v1/docs`

### 3. Mobile Setup & Startup
```bash
cd mobile

# Fetch Flutter dependencies
flutter pub get

# Run Flutter application
flutter run
```

---

## ⚙️ Configurable Business Rules (Non-Hardcoded)

As specified in the system architecture, critical workflow thresholds are configurable via backend environment variables or system configuration database records:

- `IDLE_THRESHOLD_DAYS`: Default = `3` (Days without progress before task is flagged idle).
- `REMINDER_FREQUENCY_DAYS`: Default = `3` (Interval between automated reminder notifications).
- `REMINDER_WINDOW_START_DAYS`: Default = `30` (Start of reminder window prior to deadline).
- `REMINDER_WINDOW_END_DAYS`: Default = `15` (End of reminder window prior to deadline).

---

## 🧪 Validation & Lint Commands

### Backend Validation
```bash
cd backend
npx tsc --noEmit        # Type check
npm run lint            # ESLint check
npx prisma validate     # Schema validation
```

### Mobile Validation
```bash
cd mobile
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
```
