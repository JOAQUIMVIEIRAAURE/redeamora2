-- Adicionar campos de discipulado e líder em treinamento
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS is_discipulado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_lider_em_treinamento boolean DEFAULT false;