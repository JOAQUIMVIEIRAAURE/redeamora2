-- Add joined_church_at column to profiles table for tracking church membership duration
ALTER TABLE public.profiles
ADD COLUMN joined_church_at date;

-- Create index for efficient queries
CREATE INDEX idx_profiles_joined_church_at ON public.profiles(joined_church_at);