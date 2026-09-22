USE biomed_risk;

ALTER TABLE patients
  MODIFY date_of_birth TEXT NULL,
  MODIFY phone TEXT NULL;

ALTER TABLE predictions
  MODIFY input_data TEXT NOT NULL;

ALTER TABLE audit_logs
  MODIFY user_id INT UNSIGNED NULL;

ALTER TABLE audit_logs
  DROP FOREIGN KEY fk_audit_user,
  ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Existing date_of_birth, phone, and input_data values were plaintext/JSON.
-- Reset this development data before using the encrypted application:
-- DELETE FROM predictions;
-- UPDATE patients SET date_of_birth = NULL, phone = NULL;