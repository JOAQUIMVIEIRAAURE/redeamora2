-- Add meeting_date column to weekly_reports for the exact date the cell meeting was held
ALTER TABLE public.weekly_reports ADD COLUMN meeting_date DATE;

-- Update existing records to use week_start as meeting_date if not set
UPDATE public.weekly_reports SET meeting_date = week_start WHERE meeting_date IS NULL;