-- Policy to allow authenticated users (Admins and Managers) to delete recaps
CREATE POLICY "Authenticated users can delete recaps"
  ON recaps FOR DELETE
  TO authenticated
  USING (true);
