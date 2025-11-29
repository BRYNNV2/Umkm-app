-- Create a new storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-images' );

-- Policy to allow ONLY ADMINS to upload images
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images' AND
  (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'admin'
);

-- Policy to allow ONLY ADMINS to update images
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-images' AND
  (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'admin'
);

-- Policy to allow ONLY ADMINS to delete images
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images' AND
  (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'admin'
);
