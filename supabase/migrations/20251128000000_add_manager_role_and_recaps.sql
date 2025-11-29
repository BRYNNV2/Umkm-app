/*
  # Add Manager Role and Recaps Table

  ## Changes
  1. Update `admin_users` table:
     - Add `role` column (text, check constraint: 'admin' or 'manager')
  
  2. Create `recaps` table:
     - `id` (uuid, primary key)
     - `period_start` (date)
     - `period_end` (date)
     - `total_revenue` (bigint)
     - `total_orders` (integer)
     - `status` (text: 'pending', 'approved', 'rejected')
     - `created_by` (uuid, fk to auth.users)
     - `approved_by` (uuid, fk to auth.users, nullable)
     - `notes` (text, nullable)
     - `created_at` (timestamptz)

  ## Security
  - Enable RLS on `recaps`
  - Policies for `recaps`:
    - Admins can insert (create requests)
    - Admins can view their own requests (or all? usually all admins share dashboard, but let's say all authenticated admins/managers can view)
    - Managers can update status (approve/reject)
*/

-- Add role to admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager'));

-- Create recaps table
CREATE TABLE IF NOT EXISTS recaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_revenue bigint NOT NULL CHECK (total_revenue >= 0),
  total_orders integer NOT NULL CHECK (total_orders >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recaps ENABLE ROW LEVEL SECURITY;

-- Policies for recaps

-- View: Everyone (Admins and Managers) can view recaps
CREATE POLICY "Authenticated users can view recaps"
  ON recaps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Insert: Only Admins can create recap requests
CREATE POLICY "Admins can create recap requests"
  ON recaps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );

-- Update: Managers can update status (approve/reject), Admins might update notes? 
-- For now, let's say Managers can update any field (mostly status and approved_by)
CREATE POLICY "Managers can update recaps"
  ON recaps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'manager'
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recaps_created_at ON recaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recaps_status ON recaps(status);
