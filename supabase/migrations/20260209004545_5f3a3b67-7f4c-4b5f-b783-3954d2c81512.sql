-- Create table for tracking cell multiplications (origin -> new cell)
CREATE TABLE public.multiplicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_origem_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  celula_destino_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  data_multiplicacao DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(celula_destino_id)
);

-- Enable RLS
ALTER TABLE public.multiplicacoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Multiplicacoes are viewable by everyone"
ON public.multiplicacoes FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage multiplicacoes"
ON public.multiplicacoes FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_multiplicacoes_updated_at
BEFORE UPDATE ON public.multiplicacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();