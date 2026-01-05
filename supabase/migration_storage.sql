-- Create 'products' storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Give public access to view images (Specific to products to avoid name collision)
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
CREATE POLICY "Public Access Products" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'products' );

-- Policy: Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload products" ON storage.objects;
CREATE POLICY "Authenticated users can upload products" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'products' );

-- Policy: Allow users to update their own images
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
CREATE POLICY "Users can update own product images" 
ON storage.objects FOR UPDATE
TO authenticated 
USING ( bucket_id = 'products' AND owner = auth.uid() );

-- Policy: Allow users to delete their own images
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
CREATE POLICY "Users can delete own product images" 
ON storage.objects FOR DELETE
TO authenticated 
USING ( bucket_id = 'products' AND owner = auth.uid() );
