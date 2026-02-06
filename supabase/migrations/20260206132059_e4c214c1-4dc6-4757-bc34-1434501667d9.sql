-- Drop existing restrictive policies and create public access policies for controlled environment
-- This allows the system to work without authentication

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create public read access for profiles (controlled environment)
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Allow insert/update for everyone in controlled environment
CREATE POLICY "Anyone can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update profiles"
ON public.profiles
FOR UPDATE
USING (true);

-- Drop existing policies on redes
DROP POLICY IF EXISTS "Admins and rede leaders can manage redes" ON public.redes;
DROP POLICY IF EXISTS "Redes are viewable by authenticated users" ON public.redes;

-- Create public access for redes
CREATE POLICY "Redes are viewable by everyone"
ON public.redes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage redes"
ON public.redes
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies on coordenacoes
DROP POLICY IF EXISTS "Admins and rede leaders can insert coordenacoes" ON public.coordenacoes;
DROP POLICY IF EXISTS "Coordenacoes are viewable by authenticated users" ON public.coordenacoes;
DROP POLICY IF EXISTS "Users with permission can manage coordenacoes" ON public.coordenacoes;

-- Create public access for coordenacoes
CREATE POLICY "Coordenacoes are viewable by everyone"
ON public.coordenacoes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage coordenacoes"
ON public.coordenacoes
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies on celulas
DROP POLICY IF EXISTS "Celulas are viewable by authenticated users" ON public.celulas;
DROP POLICY IF EXISTS "Users with permission can insert celulas" ON public.celulas;
DROP POLICY IF EXISTS "Users with permission can manage celulas" ON public.celulas;

-- Create public access for celulas
CREATE POLICY "Celulas are viewable by everyone"
ON public.celulas
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage celulas"
ON public.celulas
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies on members
DROP POLICY IF EXISTS "Members are viewable by authenticated users" ON public.members;
DROP POLICY IF EXISTS "Users with permission can manage members" ON public.members;

-- Create public access for members
CREATE POLICY "Members are viewable by everyone"
ON public.members
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage members"
ON public.members
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies on meetings
DROP POLICY IF EXISTS "Meetings are viewable by authenticated users" ON public.meetings;
DROP POLICY IF EXISTS "Users with permission can manage meetings" ON public.meetings;

-- Create public access for meetings
CREATE POLICY "Meetings are viewable by everyone"
ON public.meetings
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage meetings"
ON public.meetings
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies on attendances
DROP POLICY IF EXISTS "Attendances are viewable by authenticated users" ON public.attendances;
DROP POLICY IF EXISTS "Users with permission can manage attendances" ON public.attendances;

-- Create public access for attendances
CREATE POLICY "Attendances are viewable by everyone"
ON public.attendances
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage attendances"
ON public.attendances
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies on visitors
DROP POLICY IF EXISTS "Visitors are viewable by authenticated users" ON public.visitors;
DROP POLICY IF EXISTS "Users with permission can manage visitors" ON public.visitors;

-- Create public access for visitors
CREATE POLICY "Visitors are viewable by everyone"
ON public.visitors
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage visitors"
ON public.visitors
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies on weekly_reports
DROP POLICY IF EXISTS "Authenticated users can create weekly reports" ON public.weekly_reports;
DROP POLICY IF EXISTS "Users can delete weekly reports" ON public.weekly_reports;
DROP POLICY IF EXISTS "Users can update weekly reports" ON public.weekly_reports;
DROP POLICY IF EXISTS "Weekly reports are viewable by authenticated users" ON public.weekly_reports;

-- Create public access for weekly_reports
CREATE POLICY "Weekly reports are viewable by everyone"
ON public.weekly_reports
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage weekly reports"
ON public.weekly_reports
FOR ALL
USING (true)
WITH CHECK (true);

-- Add unique constraint for upsert on weekly_reports if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'weekly_reports_celula_id_week_start_key'
  ) THEN
    ALTER TABLE public.weekly_reports ADD CONSTRAINT weekly_reports_celula_id_week_start_key UNIQUE (celula_id, week_start);
  END IF;
END $$;