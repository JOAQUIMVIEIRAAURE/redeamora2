-- Add birth_date column to profiles table
ALTER TABLE public.profiles
ADD COLUMN birth_date date;

-- Create index for efficient birthday queries
CREATE INDEX idx_profiles_birth_date ON public.profiles(birth_date);