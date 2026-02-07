-- Criar tabela de casais de liderança
CREATE TABLE public.leadership_couples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spouse1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  spouse2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_spouses CHECK (spouse1_id != spouse2_id)
);

-- Adicionar coluna de casal de liderança nas tabelas existentes
ALTER TABLE public.redes 
  ADD COLUMN leadership_couple_id UUID REFERENCES public.leadership_couples(id) ON DELETE SET NULL;

ALTER TABLE public.coordenacoes 
  ADD COLUMN leadership_couple_id UUID REFERENCES public.leadership_couples(id) ON DELETE SET NULL;

ALTER TABLE public.celulas 
  ADD COLUMN leadership_couple_id UUID REFERENCES public.leadership_couples(id) ON DELETE SET NULL;

-- Habilitar RLS
ALTER TABLE public.leadership_couples ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (seguindo o modelo existente do projeto)
CREATE POLICY "Leadership couples are viewable by everyone"
ON public.leadership_couples
FOR SELECT
USING (true);

CREATE POLICY "Anyone can manage leadership couples"
ON public.leadership_couples
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leadership_couples_updated_at
BEFORE UPDATE ON public.leadership_couples
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para verificar se um profile é líder (de qualquer nível)
CREATE OR REPLACE FUNCTION public.is_leadership_couple_member(_profile_id UUID, _couple_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leadership_couples
    WHERE id = _couple_id
    AND (spouse1_id = _profile_id OR spouse2_id = _profile_id)
  )
$$;