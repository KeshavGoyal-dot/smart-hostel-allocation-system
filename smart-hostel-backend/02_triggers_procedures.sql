-- ============================================================
-- Smart Hostel Allocation System
-- 02_triggers_procedures.sql — MySQL Triggers & Stored Procedures
-- ============================================================

USE smart_hostel;

DELIMITER $$

-- ─────────────────────────────────────────────────────────────
-- TRIGGER 1: Prevent over-allocation beyond room capacity
-- Fires BEFORE INSERT on ALLOCATION
-- ─────────────────────────────────────────────────────────────
CREATE TRIGGER trg_check_capacity
BEFORE INSERT ON ALLOCATION
FOR EACH ROW
BEGIN
    DECLARE v_occupied  TINYINT;
    DECLARE v_capacity  TINYINT;

    SELECT OccupiedSeats, Capacity
      INTO v_occupied, v_capacity
      FROM ROOM
     WHERE RoomID = NEW.RoomID;

    IF v_occupied >= v_capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room is full. Cannot allocate.';
    END IF;
END$$

-- ─────────────────────────────────────────────────────────────
-- TRIGGER 2: Increment OccupiedSeats after successful allocation
-- Fires AFTER INSERT on ALLOCATION
-- ─────────────────────────────────────────────────────────────
CREATE TRIGGER trg_increment_occupied
AFTER INSERT ON ALLOCATION
FOR EACH ROW
BEGIN
    UPDATE ROOM
       SET OccupiedSeats = OccupiedSeats + 1
     WHERE RoomID = NEW.RoomID;

    -- Log the allocation
    INSERT INTO ALLOC_LOG(AllocID, StudentID, RoomID, Action)
    VALUES (NEW.AllocID, NEW.StudentID, NEW.RoomID, 'ALLOCATED');
END$$

-- ─────────────────────────────────────────────────────────────
-- TRIGGER 3: Decrement OccupiedSeats on vacate/transfer
-- Fires AFTER UPDATE on ALLOCATION
-- ─────────────────────────────────────────────────────────────
CREATE TRIGGER trg_decrement_on_vacate
AFTER UPDATE ON ALLOCATION
FOR EACH ROW
BEGIN
    IF OLD.Status = 'Active' AND NEW.Status IN ('Vacated','Transferred') THEN
        UPDATE ROOM
           SET OccupiedSeats = OccupiedSeats - 1
         WHERE RoomID = NEW.RoomID;

        INSERT INTO ALLOC_LOG(AllocID, StudentID, RoomID, Action)
        VALUES (NEW.AllocID, NEW.StudentID, NEW.RoomID, NEW.Status);
    END IF;
END$$

-- ─────────────────────────────────────────────────────────────
-- FUNCTION: Calculate student priority score
-- Based on Year (senior = higher priority) + Category bonus
-- ─────────────────────────────────────────────────────────────
CREATE FUNCTION fn_priority_score(
    p_year     TINYINT,
    p_category VARCHAR(10)
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE score INT DEFAULT 0;

    -- Year-based priority (4th year gets highest, 1st year lowest)
    SET score = p_year * 10;

    -- Category reservation bonus
    IF p_category = 'SC'  THEN SET score = score + 15; END IF;
    IF p_category = 'ST'  THEN SET score = score + 15; END IF;
    IF p_category = 'OBC' THEN SET score = score + 10; END IF;
    IF p_category = 'EWS' THEN SET score = score + 12; END IF;

    RETURN score;
END$$

-- ─────────────────────────────────────────────────────────────
-- PROCEDURE: Allocate room to a student
-- Finds first available room matching gender constraint, assigns it.
-- If no room, adds student to waiting list.
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_allocate_room(
    IN  p_studentID  VARCHAR(15),
    OUT p_result     VARCHAR(200)
)
BEGIN
    DECLARE v_roomID    INT DEFAULT NULL;
    DECLARE v_gender    VARCHAR(10);
    DECLARE v_year      TINYINT;
    DECLARE v_category  VARCHAR(10);
    DECLARE v_priority  INT;
    DECLARE v_hostType  ENUM('Boys','Girls','Mixed');

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'ERROR: Allocation failed due to an unexpected error.';
    END;

    -- Check student exists
    SELECT Gender, Year, Category
      INTO v_gender, v_year, v_category
      FROM STUDENT
     WHERE StudentID = p_studentID;

    IF v_gender IS NULL THEN
        SET p_result = 'ERROR: Student not found.';
        LEAVE sp_allocate_room;
    END IF;

    -- Check if student already has active allocation
    IF EXISTS (
        SELECT 1 FROM ALLOCATION
         WHERE StudentID = p_studentID AND Status = 'Active'
    ) THEN
        SET p_result = 'ERROR: Student already has an active room allocation.';
        LEAVE sp_allocate_room;
    END IF;

    -- Determine hostel type filter
    SET v_hostType = IF(v_gender = 'Male', 'Boys', 'Girls');

    -- Find an available room (capacity not full, matching hostel gender type)
    SELECT R.RoomID INTO v_roomID
      FROM ROOM R
      JOIN BLOCK B  ON R.BlockID  = B.BlockID
      JOIN HOSTEL H ON B.HostelID = H.HostelID
     WHERE R.OccupiedSeats < R.Capacity
       AND H.Type IN (v_hostType, 'Mixed')
     ORDER BY (R.Capacity - R.OccupiedSeats) DESC, R.RoomID ASC
     LIMIT 1;

    START TRANSACTION;

    IF v_roomID IS NOT NULL THEN
        -- Allocate the room
        INSERT INTO ALLOCATION(StudentID, RoomID, AllocDate, Status)
        VALUES (p_studentID, v_roomID, CURDATE(), 'Active');

        -- Remove from waiting list if present
        DELETE FROM WAITING_LIST WHERE StudentID = p_studentID;

        COMMIT;
        SET p_result = CONCAT('SUCCESS: Room ', v_roomID, ' allocated to student ', p_studentID);
    ELSE
        -- Add to waiting list with priority score
        SET v_priority = fn_priority_score(v_year, v_category);

        INSERT INTO WAITING_LIST(StudentID, RequestDate, Priority)
        VALUES (p_studentID, CURDATE(), v_priority)
        ON DUPLICATE KEY UPDATE Priority = v_priority, RequestDate = CURDATE();

        COMMIT;
        SET p_result = CONCAT('WAITLISTED: No rooms available. Student ', p_studentID, ' added to waiting list with priority ', v_priority);
    END IF;
END$$

-- ─────────────────────────────────────────────────────────────
-- PROCEDURE: Vacate a room (student checkout)
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_vacate_room(
    IN  p_studentID VARCHAR(15),
    OUT p_result    VARCHAR(200)
)
BEGIN
    DECLARE v_allocID INT DEFAULT NULL;

    SELECT AllocID INTO v_allocID
      FROM ALLOCATION
     WHERE StudentID = p_studentID AND Status = 'Active'
     LIMIT 1;

    IF v_allocID IS NULL THEN
        SET p_result = 'ERROR: No active allocation found for this student.';
    ELSE
        UPDATE ALLOCATION
           SET Status = 'Vacated'
         WHERE AllocID = v_allocID;

        SET p_result = CONCAT('SUCCESS: Student ', p_studentID, ' has vacated the room.');
    END IF;
END$$

-- ─────────────────────────────────────────────────────────────
-- PROCEDURE: Process waiting list — try allocating top-priority
-- students whenever a room becomes available
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_process_waitlist()
BEGIN
    DECLARE done       INT DEFAULT 0;
    DECLARE v_studentID VARCHAR(15);
    DECLARE v_result    VARCHAR(200);

    DECLARE cur_waitlist CURSOR FOR
        SELECT StudentID
          FROM WAITING_LIST
         ORDER BY Priority DESC, RequestDate ASC;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur_waitlist;

    wl_loop: LOOP
        FETCH cur_waitlist INTO v_studentID;
        IF done THEN LEAVE wl_loop; END IF;

        CALL sp_allocate_room(v_studentID, v_result);

        -- Stop if no more rooms
        IF v_result LIKE 'WAITLISTED%' THEN LEAVE wl_loop; END IF;
    END LOOP;

    CLOSE cur_waitlist;
END$$

DELIMITER ;
