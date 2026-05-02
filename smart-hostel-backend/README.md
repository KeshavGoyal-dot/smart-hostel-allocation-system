# 🏨 Smart Hostel Allocation System — Backend

**Course:** UCS310 – Database Management Systems  
**Institute:** Thapar Institute of Engineering & Technology  
**Team:** Keshav Goyal · Shubh Mittal · Rishi Vikram Singh

---

## 📁 Project Structure

```
smart-hostel/
├── sql/
│   ├── 01_schema.sql               ← DDL: All table definitions (3NF/BCNF)
│   ├── 02_triggers_procedures.sql  ← Triggers, Stored Procedures, Functions
│   └── 03_seed_data.sql            ← Sample INSERT data
├── src/
│   ├── app.js                      ← Express entry point
│   ├── config/
│   │   └── db.js                   ← MySQL connection pool
│   ├── middleware/
│   │   └── auth.js                 ← JWT authentication middleware
│   └── routes/
│       ├── auth.js                 ← POST /api/auth/login
│       ├── students.js             ← CRUD /api/students
│       ├── hostels.js              ← /api/hostels
│       ├── allocations.js          ← /api/allocations (calls stored procedures)
│       ├── waitlist.js             ← /api/waitlist
│       └── reports.js              ← /api/reports
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MySQL 8.0+

### 2. Clone & Install
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 4. Initialize Database
Run these SQL files **in order** in MySQL Workbench or CLI:
```bash
mysql -u root -p < sql/01_schema.sql
mysql -u root -p < sql/02_triggers_procedures.sql
mysql -u root -p < sql/03_seed_data.sql
```

### 5. Start Server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Server runs at: `http://localhost:5000`

---

## 🔌 API Reference

### Auth
| Method | Endpoint          | Description        | Auth |
|--------|-------------------|--------------------|------|
| POST   | /api/auth/login   | Staff login → JWT  | ❌   |

### Students
| Method | Endpoint              | Description           | Auth  |
|--------|-----------------------|-----------------------|-------|
| GET    | /api/students         | List all students     | ✅    |
| GET    | /api/students/:id     | Get student + room    | ✅    |
| POST   | /api/students         | Register student      | Admin/Warden |
| PUT    | /api/students/:id     | Update student        | Admin/Warden |
| DELETE | /api/students/:id     | Delete student        | Admin |

### Allocations
| Method | Endpoint                          | Description                     | Auth  |
|--------|-----------------------------------|---------------------------------|-------|
| GET    | /api/allocations                  | All active allocations          | ✅    |
| POST   | /api/allocations/allocate         | Allocate room (calls SP)        | Admin/Warden |
| POST   | /api/allocations/vacate           | Vacate room + process waitlist  | Admin/Warden |
| GET    | /api/allocations/student/:id      | Allocation history              | ✅    |

### Hostels
| Method | Endpoint                                      | Description     | Auth  |
|--------|-----------------------------------------------|-----------------|-------|
| GET    | /api/hostels                                  | All hostels     | ✅    |
| GET    | /api/hostels/:id/rooms                        | Rooms in hostel | ✅    |
| POST   | /api/hostels                                  | Add hostel      | Admin |
| POST   | /api/hostels/:hID/blocks/:bID/rooms           | Add room        | Admin/Warden |

### Waiting List
| Method | Endpoint                   | Description           | Auth  |
|--------|----------------------------|-----------------------|-------|
| GET    | /api/waitlist              | All waitlisted        | ✅    |
| DELETE | /api/waitlist/:studentID   | Remove from waitlist  | Admin/Warden |

### Reports
| Method | Endpoint                   | Description                  | Auth |
|--------|----------------------------|------------------------------|------|
| GET    | /api/reports/occupancy     | Hostel-wise occupancy %      | ✅   |
| GET    | /api/reports/by-branch     | Allocations by branch/year   | ✅   |
| GET    | /api/reports/unallocated   | Students without a room      | ✅   |
| GET    | /api/reports/audit-log     | Full allocation audit trail  | ✅   |
| GET    | /api/reports/payments      | Payment status summary       | ✅   |

---

## 🗃️ Database Design Summary

### Tables (3NF/BCNF Normalized)
`STUDENT` · `HOSTEL` · `BLOCK` · `ROOM` · `ALLOCATION` · `WAITING_LIST` · `PAYMENT` · `STAFF` · `ALLOC_LOG`

### Triggers
- `trg_check_capacity` — Prevents allocation if room is full
- `trg_increment_occupied` — Auto-increments OccupiedSeats + logs
- `trg_decrement_on_vacate` — Decrements on vacate/transfer + logs

### Stored Procedures
- `sp_allocate_room(studentID)` — Allocates room or adds to waitlist
- `sp_vacate_room(studentID)` — Marks allocation as vacated
- `sp_process_waitlist()` — Processes waitlist using a cursor

### Function
- `fn_priority_score(year, category)` — Returns numeric priority score

---

## 🔒 Authentication
All protected routes require:  
`Authorization: Bearer <token>`

Token is obtained from `POST /api/auth/login`.

---

## 📌 Sample Login (after seed)
```json
POST /api/auth/login
{ "username": "admin1", "password": "Admin@123" }
```
> Note: Run a one-time bcrypt hash script to set real passwords in STAFF table.
