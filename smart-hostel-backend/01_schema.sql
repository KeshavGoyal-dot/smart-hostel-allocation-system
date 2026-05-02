-- ============================================================
-- Smart Hostel Allocation System
-- 01_schema.sql — DDL: Table Creation (3NF/BCNF Normalized)
-- Course: UCS310 | Thapar Institute of Engineering & Technology
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_hostel;
USE smart_hostel;

-- ─────────────────────────────────────────────
-- STUDENT
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS STUDENT (
    StudentID   VARCHAR(15)  PRIMARY KEY,
    Name        VARCHAR(100) NOT NULL,
    Branch      VARCHAR(50)  NOT NULL,
    Year        TINYINT      NOT NULL CHECK (Year BETWEEN 1 AND 5),
    Gender      ENUM('Male','Female','Other') NOT NULL,
    Category    ENUM('General','OBC','SC','ST','EWS') NOT NULL DEFAULT 'General',
    Email       VARCHAR(100) UNIQUE NOT NULL,
    Phone       VARCHAR(15),
    CreatedAt   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- HOSTEL
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS HOSTEL (
    HostelID    INT          AUTO_INCREMENT PRIMARY KEY,
    HostelName  VARCHAR(100) NOT NULL UNIQUE,
    Type        ENUM('Boys','Girls','Mixed') NOT NULL,
    TotalBlocks INT          NOT NULL DEFAULT 1
);

-- ─────────────────────────────────────────────
-- BLOCK
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS BLOCK (
    BlockID     INT          AUTO_INCREMENT PRIMARY KEY,
    HostelID    INT          NOT NULL,
    BlockName   VARCHAR(50)  NOT NULL,
    FOREIGN KEY (HostelID) REFERENCES HOSTEL(HostelID) ON DELETE CASCADE,
    UNIQUE (HostelID, BlockName)
);

-- ─────────────────────────────────────────────
-- ROOM
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ROOM (
    RoomID          INT          AUTO_INCREMENT PRIMARY KEY,
    BlockID         INT          NOT NULL,
    RoomNo          VARCHAR(10)  NOT NULL,
    Capacity        TINYINT      NOT NULL DEFAULT 2,
    RoomType        ENUM('Single','Double','Triple') NOT NULL DEFAULT 'Double',
    OccupiedSeats   TINYINT      NOT NULL DEFAULT 0,
    FOREIGN KEY (BlockID) REFERENCES BLOCK(BlockID) ON DELETE CASCADE,
    UNIQUE (BlockID, RoomNo),
    CHECK (OccupiedSeats <= Capacity)
);

-- ─────────────────────────────────────────────
-- ALLOCATION
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ALLOCATION (
    AllocID     INT          AUTO_INCREMENT PRIMARY KEY,
    StudentID   VARCHAR(15)  NOT NULL,
    RoomID      INT          NOT NULL,
    AllocDate   DATE         NOT NULL DEFAULT (CURRENT_DATE),
    Status      ENUM('Active','Vacated','Transferred') NOT NULL DEFAULT 'Active',
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (RoomID)    REFERENCES ROOM(RoomID)       ON DELETE RESTRICT,
    UNIQUE (StudentID, Status)   -- one active allocation per student enforced via app logic
);

-- ─────────────────────────────────────────────
-- WAITING LIST
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS WAITING_LIST (
    WL_ID       INT          AUTO_INCREMENT PRIMARY KEY,
    StudentID   VARCHAR(15)  NOT NULL UNIQUE,
    RequestDate DATE         NOT NULL DEFAULT (CURRENT_DATE),
    Priority    INT          NOT NULL DEFAULT 0,  -- higher = more priority
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- PAYMENT (optional module)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS PAYMENT (
    PayID           INT          AUTO_INCREMENT PRIMARY KEY,
    StudentID       VARCHAR(15)  NOT NULL,
    Amount          DECIMAL(10,2) NOT NULL,
    PaymentDate     DATE         NOT NULL DEFAULT (CURRENT_DATE),
    Status          ENUM('Paid','Unpaid','Pending') NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- STAFF
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS STAFF (
    StaffID     INT          AUTO_INCREMENT PRIMARY KEY,
    StaffName   VARCHAR(100) NOT NULL,
    Role        ENUM('Admin','Warden','Staff') NOT NULL DEFAULT 'Staff',
    Email       VARCHAR(100) UNIQUE NOT NULL,
    Username    VARCHAR(50)  UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    DOB         DATE,
    Gender      ENUM('Male','Female','Other'),
    Phone       VARCHAR(15),
    HostelID    INT,
    FOREIGN KEY (HostelID) REFERENCES HOSTEL(HostelID) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- ALLOCATION AUDIT LOG
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ALLOC_LOG (
    LogID       INT          AUTO_INCREMENT PRIMARY KEY,
    AllocID     INT,
    StudentID   VARCHAR(15),
    RoomID      INT,
    Action      VARCHAR(50)  NOT NULL,
    ActionTime  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PerformedBy VARCHAR(50)  DEFAULT 'SYSTEM'
);
