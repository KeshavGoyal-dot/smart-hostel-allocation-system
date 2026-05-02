# 🏨 Smart Hostel Allocation System — Frontend

**Course:** UCS310 – Database Management Systems  
**Institute:** Thapar Institute of Engineering & Technology  
**Team:** Keshav Goyal · Shubh Mittal · Rishi Vikram Singh

---

## 📁 Project Structure

```
smart-hostel-frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js                        ← Root router (React Router v6)
│   ├── index.js                      ← React entry point
│   ├── index.css                     ← Global styles + Google Font
│   │
│   ├── context/
│   │   └── AuthContext.js            ← JWT auth state (login/logout)
│   │
│   ├── services/
│   │   └── api.js                    ← Axios instance + all API helpers
│   │
│   ├── hooks/
│   │   └── useFetch.js               ← Generic data-fetching hook
│   │
│   ├── components/
│   │   ├── Layout.js                 ← Sidebar, Topbar, PageLayout, ProtectedRoute
│   │   └── UI.js                     ← Spinner, Alert, Badge, Modal, Btn,
│   │                                    FormField, StatCard, Card, DataTable,
│   │                                    ProgressBar, inputStyle
│   │
│   └── pages/
│       ├── LandingPage.js            ← Public home with CTA
│       ├── AuthPages.js              ← Admin login + Student login (/:type)
│       ├── DashboardPage.js          ← Admin overview with stat cards + charts
│       ├── StudentsPage.js           ← CRUD table + Add/Edit modals
│       ├── HostelsPage.js            ← Hostel cards + room viewer + add hostel/room
│       ├── AllocationsPage.js        ← Active allocations + Allocate/Vacate modals
│       ├── WaitlistPage.js           ← Priority-sorted waitlist + remove
│       ├── ReportsPage.js            ← 5-tab report dashboard with Recharts
│       └── StudentDashboardPage.js   ← Student: profile, apply, room status, history
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:5000`

### 1. Install dependencies
```bash
cd smart-hostel-frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env if your backend runs on a different port
```

### 3. Start dev server
```bash
npm start
# Opens http://localhost:3000
```

### 4. Build for production
```bash
npm run build
```

---

## 🔌 API Connection

All API calls live in `src/services/api.js`.  
The Axios instance auto-attaches the JWT token from `localStorage`.

```js
// Example: allocate a room
import { allocateRoom } from "./services/api";
const res = await allocateRoom("102417031");
```

The `proxy` field in `package.json` forwards `/api` requests to `http://localhost:5000` during development, so CORS isn't an issue.

---

## 🔒 Authentication Flow

```
Landing Page
  ├── /login/admin   → POST /api/auth/login       → JWT stored → /dashboard
  └── /login/student → POST /api/auth/student-login → JWT stored → /my-dashboard
```

Token stored in `localStorage` as `hostel_token`.  
All protected routes check `AuthContext` and redirect unauthenticated users to `/`.

---

## 🗺️ Route Map

| Path             | Component              | Roles            |
|------------------|------------------------|------------------|
| `/`              | LandingPage            | Public           |
| `/login/:type`   | AuthPage               | Public           |
| `/dashboard`     | DashboardPage          | Admin, Warden    |
| `/students`      | StudentsPage           | Admin, Warden    |
| `/hostels`       | HostelsPage            | Admin, Warden    |
| `/allocations`   | AllocationsPage        | Admin, Warden    |
| `/waitlist`      | WaitlistPage           | Admin, Warden    |
| `/reports`       | ReportsPage            | Admin, Warden    |
| `/my-dashboard`  | StudentDashboardPage   | Student          |
| `/my-room`       | StudentDashboardPage   | Student          |

---

## 🎨 Design System

| Token     | Value      | Usage                    |
|-----------|------------|--------------------------|
| Primary   | `#1D9E75`  | Buttons, active nav, CTA |
| Info      | `#378ADD`  | Secondary actions, links |
| Danger    | `#E24B4A`  | Delete, vacate           |
| Amber     | `#BA7517`  | Waitlist, warnings       |
| Dark BG   | `#0F2027`  | Sidebar                  |
| Page BG   | `#F4F6F9`  | Content area             |
| Card BG   | `#FFFFFF`  | Cards and tables         |
| Font      | DM Sans    | All text                 |

---

## 📦 Dependencies

| Package           | Version   | Purpose                         |
|-------------------|-----------|---------------------------------|
| react             | 18.x      | UI framework                    |
| react-router-dom  | 6.x       | Client-side routing             |
| axios             | 1.x       | HTTP client + interceptors      |
| recharts          | 2.x       | Bar, Pie charts in Reports page |
| react-scripts     | 5.x       | CRA build toolchain             |

---

## 🐛 Known Backend Bugs (Fixed in Frontend)

1. `reports.js` — `/reports//payments` has double slash → corrected to `/reports/payments` in `api.js`
2. `reports.js` — missing comma before `ROUND(...)` in occupancy SQL → handle missing `OccupancyPercent` gracefully
3. `auth.js` — references `user.Password` but column is `PasswordHash` in schema → login handled, backend fix needed
4. `allocations.js` — `isNaN(studentID)` check fails for string IDs like `102417031` → fixed in UI by not relying on numeric check

---

## 🚀 Scalability Suggestions

1. **Pagination** — Add `?page=` & `?limit=` query params to `/students` and `/allocations`
2. **React Query** — Replace `useEffect` + `useState` pattern with `@tanstack/react-query` for caching & background refresh
3. **Toast Notifications** — Add `react-hot-toast` for non-blocking success/error feedback
4. **Dark Mode** — CSS variables already structured for easy theming
5. **Role: Warden** — Scope warden to their assigned `HostelID` (backend already has `HostelID` on STAFF)
6. **Password Reset** — Add `/auth/forgot-password` flow
7. **Export** — Add CSV/PDF export buttons on Reports page using `xlsx` or `jsPDF`
