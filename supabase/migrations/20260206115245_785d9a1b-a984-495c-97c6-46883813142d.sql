-- Create weekly_reports table for cell leaders to fill in weekly data
CREATE TABLE public.weekly_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id uuid NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  members_present integer NOT NULL DEFAULT 0,
  leaders_in_training integer NOT NULL DEFAULT 0,
  discipleships integer NOT NULL DEFAULT 0,
  visitors integer NOT NULL DEFAULT 0,
  children integer NOT NULL DEFAULT 0,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(celula_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Weekly reports are viewable by authenticated users"
ON public.weekly_reports
FOR SELECT
USING (true);

CREATE POLICY "Cell leaders can create weekly reports"
ON public.weekly_reports
FOR INSERT
WITH CHECK (can_manage_celula(auth.uid(), celula_id));

CREATE POLICY "Cell leaders can update their reports"
ON public.weekly_reports
FOR UPDATE
USING (can_manage_celula(auth.uid(), celula_id));

CREATE POLICY "Cell leaders can delete their reports"
ON public.weekly_reports
FOR DELETE
USING (can_manage_celula(auth.uid(), celula_id));

-- Add trigger for updated_at
CREATE TRIGGER update_weekly_reports_updated_at
BEFORE UPDATE ON public.weekly_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for Rede Amor a 2
INSERT INTO public.redes (name) VALUES ('Rede Amor a 2');

-- Get the rede id and create 5 coordenações
DO $$
DECLARE
  rede_id uuid;
  coord_id uuid;
  coord_names text[] := ARRAY['Coordenação Alpha', 'Coordenação Beta', 'Coordenação Gamma', 'Coordenação Delta', 'Coordenação Epsilon'];
  coord_name text;
  i integer;
  j integer;
BEGIN
  SELECT id INTO rede_id FROM public.redes WHERE name = 'Rede Amor a 2' LIMIT 1;
  
  FOREACH coord_name IN ARRAY coord_names
  LOOP
    INSERT INTO public.coordenacoes (name, rede_id) VALUES (coord_name, rede_id) RETURNING id INTO coord_id;
    
    -- Create 13 células for each coordenação
    FOR j IN 1..13 LOOP
      INSERT INTO public.celulas (name, coordenacao_id, meeting_day, meeting_time, address)
      VALUES (
        'Célula ' || coord_name || ' ' || j,
        coord_id,
        CASE (j % 7) 
          WHEN 0 THEN 'Segunda'
          WHEN 1 THEN 'Terça'
          WHEN 2 THEN 'Quarta'
          WHEN 3 THEN 'Quinta'
          WHEN 4 THEN 'Sexta'
          WHEN 5 THEN 'Sábado'
          ELSE 'Domingo'
        END,
        '19:30',
        'Endereço ' || j
      );
    END LOOP;
  END LOOP;
END $$;