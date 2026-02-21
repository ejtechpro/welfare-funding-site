USE tns_db;
-- Ensure uniqueness (important for concurrency)
ALTER TABLE member_balances
ADD UNIQUE KEY uniq_member_balance (memberId);

-- Monthly billing procedure
DROP PROCEDURE IF EXISTS apply_monthly_charge;
DELIMITER $$
CREATE PROCEDURE apply_monthly_charge()
BEGIN
  UPDATE member_balances
  SET due = due + 100;
END $$
DELIMITER ;

-- Payment procedure
DROP PROCEDURE IF EXISTS record_payment;
DELIMITER $$
CREATE PROCEDURE record_payment(
    IN p_memberId VARCHAR(50),
    IN p_amount DECIMAL(10,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment amount must be greater than 0';
    END IF;

    START TRANSACTION;

    INSERT IGNORE INTO member_balances (memberId, due, prepaid)
    VALUES (p_memberId, 0, 0);

    UPDATE member_balances
    SET 
      due = CASE 
              WHEN p_amount >= due THEN 0
              ELSE due - p_amount
            END,
      prepaid = CASE 
                  WHEN p_amount >= due THEN prepaid + (p_amount - due)
                  ELSE prepaid
                END
    WHERE memberId = p_memberId;

    COMMIT;
END $$
DELIMITER ;

-- Optional: monthly scheduler
DROP EVENT IF EXISTS monthly_billing;
DELIMITER $$
CREATE EVENT monthly_billing
ON SCHEDULE EVERY 1 MONTH
DO
  CALL apply_monthly_charge();
$$
DELIMITER ;