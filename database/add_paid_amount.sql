-- Add paid_amount field for payment tracking
ALTER TABLE appointments
  ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
