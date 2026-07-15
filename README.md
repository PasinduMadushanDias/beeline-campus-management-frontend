# Beeline SMS — Frontend

React SPA for the Beeline Advanced Diploma in English school management system ("SMS" = Student Management System, not text messaging). Provides four role-based dashboards — **Admin**, **Teacher**, **Staff**, **Student** — covering student/staff/branch administration, attendance (manual and QR-code based), homework tracking, announcements, and fee status.

## Tech Stack

- **React 19** — functional components, hooks only
- **Vite 8** — dev server and build tool
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — CSS-based config, no `tailwind.config.js`
- **lucide-react** — icon set
- **html5-qrcode** — camera-based QR scanning (attendance check-in)
- **qrcode.react** — QR "sticker" generation for students
- **oxlint** — linting (Rust-based, replaces ESLint)
- No router library — navigation is handled via local component state (`activeNav`), persisted to `localStorage`
- No state-management library — global state via React Context (`AuthContext`, `AppContext`)
- No axios/react-query — plain `fetch` calls made inline per page

## Project Structure

```
sms-app/
├── index.html                # Vite entry HTML
├── vite.config.js            # Vite + Tailwind + basic-ssl plugin config
├── .oxlintrc.json             # Linter rules
├── .certs/                    # Local HTTPS dev certs (for LAN/mobile QR testing)
├── public/                    # Static assets
└── src/
    ├── main.jsx                # ReactDOM root
    ├── App.jsx                 # Auth gate + role-based router
    ├── index.css                # Tailwind entry
    ├── assets/                  # Images
    ├── components/
    │   ├── layout/               # Header, Sidebar
    │   └── shared/                # Reusable UI: Card, MetricCard, StatusBadge,
    │                              # BranchBadge, InputField, SelectField, EmptyState,
    │                              # SuccessToast, QRAttendanceScanner, QRStickerModal
    ├── constants/                # Mock data, sidebar nav per role, roles/icons
    ├── context/
    │   ├── AuthContext.jsx        # Login/logout, session persisted in localStorage
    │   └── AppContext.jsx         # Shared data fetching (students/staff/branches/etc.)
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── admin/                 # Dashboard, Students, Staff, Branches, Homework
    │   ├── teacher/                # Dashboard, Announcements, Schedule
    │   ├── staff/                  # Dashboard, Homework verification, Attendance
    │   └── student/                # Dashboard, Profile, Attendance, Assignments, Fees
    └── utils/
        ├── formatters.js
        └── qrPayload.js            # QR payload encode/decode helpers
```

## Features

- **Role-based dashboards** for Admin, Teacher, Staff, and Student, each with its own navigation and pages
- **Student management** — CRUD, search, auto-generated per-branch student IDs
- **Staff management** — CRUD, toggling attendance-marking permission
- **Branch management** — multi-branch support (fees, schedules, duration)
- **Attendance** — mark by student ID or by scanning a student's QR code; students view their own attendance history
- **Homework** — assign tasks per branch/date, verify/grade submissions, students view assignments
- **Announcements** — teachers post branch-targeted or school-wide announcements
- **Fee tracking** — students view fee/installment status
- **QR attendance system** — staff can generate/print a QR "sticker" per student and scan it via device camera to mark attendance

## Setup & Running

### Prerequisites
- Node.js and npm
- The [backend API](../beeline-sms-api) running and reachable at `http://localhost:8080` (the API base URL is currently hardcoded in source, not environment-configurable)

### Install & run
```bash
npm install
npm run dev       # start Vite dev server (HTTPS, exposed on LAN for mobile QR testing)
npm run build      # production build -> dist/
npm run preview    # preview the production build locally
npm run lint       # run oxlint
```

The dev server runs over HTTPS via `@vitejs/plugin-basic-ssl` and binds to all network interfaces (`host: true`) so the QR scanner can be tested from a phone on the same network. No test runner is currently configured.

## API Integration

The frontend calls the backend's `/api/v1/*` REST endpoints directly via `fetch`, with the base URL (`http://localhost:8080/api/v1`) hardcoded per page rather than centralized or environment-driven. Key endpoint groups:

- `POST /api/v1/auth/login`
- `/api/v1/admin/*` — students, staff, branches (CRUD)
- `/api/v1/attendance/*` — mark by ID/QR, list, per-student
- `/api/v1/homework/*` — assign, list, submission status
- `/api/v1/student/*` — profile, fees

## Authentication

Login posts credentials to `/api/v1/auth/login` and receives a user profile (no token). This user object is stored in `localStorage` (`beeline_auth_user`) and used to gate the app and drive role-based UI. Subsequent API calls do **not** attach an auth token/header — access control is enforced client-side only by which pages/nav items render for a given role. This is a known limitation suited to prototype/dev use, not production security.
