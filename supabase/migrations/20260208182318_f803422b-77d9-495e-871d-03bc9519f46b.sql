-- Add photo_url column to casais table
ALTER TABLE public.casais ADD COLUMN photo_url TEXT DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.casais.photo_url IS 'URL da foto do casal';

-- Create storage bucket for couple photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('casais-photos', 'casais-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for casais-photos bucket
CREATE POLICY "Couple photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'casais-photos');

CREATE POLICY "Anyone can upload couple photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'casais-photos');

CREATE POLICY "Anyone can update couple photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'casais-photos');

CREATE POLICY "Anyone can delete couple photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'casais-photos');