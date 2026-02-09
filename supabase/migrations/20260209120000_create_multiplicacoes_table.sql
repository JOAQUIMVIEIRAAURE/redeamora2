CREATE TABLE IF NOT EXISTS public.multiplicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_origem_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  celula_destino_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  data_multiplicacao DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(celula_destino_id)
);

-- Habilitar segurança (RLS)
ALTER TABLE public.multiplicacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Enable read access for authenticated users"
ON public.multiplicacoes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON public.multiplicacoes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON public.multiplicacoes FOR DELETE TO authenticated USING (true);
