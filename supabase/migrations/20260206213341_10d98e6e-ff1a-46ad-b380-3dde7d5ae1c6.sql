-- Adicionar campos de marcos espirituais na tabela members
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS batismo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS encontro_com_deus boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS renovo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS encontro_de_casais boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS curso_lidere boolean DEFAULT false;

-- Criar tabela de casais
CREATE TABLE public.casais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celula_id uuid NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  member1_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  member2_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(member1_id, member2_id)
);

-- Enable RLS
ALTER TABLE public.casais ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for casais
CREATE POLICY "Casais are viewable by everyone" 
ON public.casais 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage casais" 
ON public.casais 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_casais_updated_at
BEFORE UPDATE ON public.casais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();