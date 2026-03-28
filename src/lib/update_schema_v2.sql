-- Add advanced cargo fields to shipments table
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS weight NUMERIC;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS dimensions TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS cargo_type TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Standard';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS hazardous BOOLEAN DEFAULT FALSE;
