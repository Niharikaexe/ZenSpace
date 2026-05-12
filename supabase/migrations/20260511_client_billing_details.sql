-- ============================================================
-- Client billing details (for Razorpay invoices + receipts)
-- ============================================================

ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS billing_name TEXT,
  ADD COLUMN IF NOT EXISTS billing_phone TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS billing_city TEXT,
  ADD COLUMN IF NOT EXISTS billing_state TEXT,
  ADD COLUMN IF NOT EXISTS billing_pincode TEXT,
  ADD COLUMN IF NOT EXISTS billing_gstin TEXT;
