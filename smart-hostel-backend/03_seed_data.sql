-- ============================================================
-- Smart Hostel Allocation System
-- 03_seed_data.sql — Sample INSERT statements
-- ============================================================

USE smart_hostel;

-- ─── HOSTELS ──────────────────────────────────────────────────
INSERT INTO HOSTEL (HostelName, Type, TotalBlocks) VALUES
('Kailash Boys Hostel',   'Boys',  3),
('Manas Girls Hostel',    'Girls', 2),
('Himadri Boys Hostel',   'Boys',  2),
('Saraswati Girls Hostel','Girls', 2);

-- ─── BLOCKS ───────────────────────────────────────────────────
INSERT INTO BLOCK (HostelID, BlockName) VALUES
(1, 'A'), (1, 'B'), (1, 'C'),
(2, 'A'), (2, 'B'),
(3, 'A'), (3, 'B'),
(4, 'A'), (4, 'B');

-- ─── ROOMS ────────────────────────────────────────────────────
-- Kailash Block A (BlockID=1)
INSERT INTO ROOM (BlockID, RoomNo, Capacity, RoomType, OccupiedSeats) VALUES
(1,'101',2,'Double',0),(1,'102',2,'Double',0),(1,'103',1,'Single',0),
(1,'104',3,'Triple',0),(1,'105',2,'Double',0),
-- Kailash Block B (BlockID=2)
(2,'201',2,'Double',0),(2,'202',2,'Double',0),(2,'203',2,'Double',0),
-- Kailash Block C (BlockID=3)
(3,'301',2,'Double',0),(3,'302',1,'Single',0),
-- Manas Block A (BlockID=4)
(4,'101',2,'Double',0),(4,'102',2,'Double',0),(4,'103',3,'Triple',0),
-- Manas Block B (BlockID=5)
(5,'201',2,'Double',0),(5,'202',2,'Double',0),
-- Himadri Block A (BlockID=6)
(6,'101',2,'Double',0),(6,'102',2,'Double',0),
-- Himadri Block B (BlockID=7)
(7,'201',2,'Double',0),(7,'202',1,'Single',0),
-- Saraswati Block A (BlockID=8)
(8,'101',2,'Double',0),(8,'102',2,'Double',0),
-- Saraswati Block B (BlockID=9)
(9,'201',3,'Triple',0),(9,'202',2,'Double',0);

-- ─── STUDENTS ─────────────────────────────────────────────────
INSERT INTO STUDENT (StudentID, Name, Branch, Year, Gender, Category, Email, Phone) VALUES
('102417031', 'Keshav Goyal',    'CSE', 2, 'Male',   'General', 'keshav@thapar.edu',  '9876543210'),
('102417042', 'Shubh Mittal',    'CSE', 2, 'Male',   'OBC',     'shubh@thapar.edu',   '9876543211'),
('102417041', 'Rishi Vikram',    'CSE', 2, 'Male',   'General', 'rishi@thapar.edu',   '9876543212'),
('102417050', 'Ananya Sharma',   'ECE', 3, 'Female', 'General', 'ananya@thapar.edu',  '9876543213'),
('102417051', 'Priya Nair',      'ME',  4, 'Female', 'SC',      'priya@thapar.edu',   '9876543214'),
('102417052', 'Arjun Singh',     'EE',  1, 'Male',   'ST',      'arjun@thapar.edu',   '9876543215'),
('102417053', 'Meera Patel',     'CSE', 2, 'Female', 'EWS',     'meera@thapar.edu',   '9876543216'),
('102417054', 'Rohit Kumar',     'ME',  3, 'Male',   'OBC',     'rohit@thapar.edu',   '9876543217'),
('102417055', 'Sneha Reddy',     'ECE', 1, 'Female', 'General', 'sneha@thapar.edu',   '9876543218'),
('102417056', 'Vikram Chauhan',  'CSE', 4, 'Male',   'General', 'vikram@thapar.edu',  '9876543219');

-- ─── STAFF ────────────────────────────────────────────────────
-- Passwords are bcrypt hashes of 'Admin@123' and 'Warden@123'
INSERT INTO STAFF (StaffName, Role, Email, Username, PasswordHash, HostelID) VALUES
('Dr. Rajesh Sharma',  'Admin',  'rajesh@thapar.edu',  'admin1',   '$2b$10$examplehashAdmin1', NULL),
('Mrs. Sunita Verma',  'Warden', 'sunita@thapar.edu',  'warden1',  '$2b$10$examplehashWarden1', 1),
('Mr. Harpreet Singh', 'Warden', 'harpreet@thapar.edu','warden2',  '$2b$10$examplehashWarden2', 2);

-- ─── PAYMENTS ─────────────────────────────────────────────────
INSERT INTO PAYMENT (StudentID, Amount, PaymentDate, Status) VALUES
('102417031', 15000.00, '2026-01-15', 'Paid'),
('102417042', 15000.00, '2026-01-16', 'Paid'),
('102417050', 12000.00, '2026-01-17', 'Pending'),
('102417051', 12000.00, '2026-01-10', 'Paid');
