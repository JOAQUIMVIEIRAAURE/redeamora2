-- Adicionar 'supervisor' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supervisor';

-- Tabela de supervisores vinculados a coordenações
CREATE TABLE public.supervisores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coordenacao_id uuid NOT NULL REFERENCES public.coordenacoes(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(profile_id, coordenacao_id)
);

-- Tabela de supervisões de células
CREATE TABLE public.supervisoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celula_id uuid NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  supervisor_id uuid NOT NULL REFERENCES public.supervisores(id) ON DELETE CASCADE,
  data_supervisao date NOT NULL,
  horario_inicio time NOT NULL,
  horario_termino time NOT NULL,
  
  -- Célula aconteceu ou não
  celula_realizada boolean NOT NULL DEFAULT true,
  motivo_cancelamento text,
  
  -- Roteiro da célula (checklist)
  oracao_inicial boolean DEFAULT false,
  louvor boolean DEFAULT false,
  apresentacao_visitantes boolean DEFAULT false,
  momento_visao_triade boolean DEFAULT false,
  avisos boolean DEFAULT false,
  quebra_gelo boolean DEFAULT false,
  licao boolean DEFAULT false,
  cadeira_amor boolean DEFAULT false,
  oracao_final boolean DEFAULT false,
  selfie boolean DEFAULT false,
  comunhao boolean DEFAULT false,
  
  -- Avaliação geral
  pontualidade boolean DEFAULT false,
  dinamica boolean DEFAULT false,
  organizacao boolean DEFAULT false,
  interatividade boolean DEFAULT false,
  
  -- Observações
  pontos_alinhar text,
  pontos_positivos text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supervisores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisoes ENABLE ROW LEVEL SECURITY;

-- RLS policies para supervisores (acesso público como outras tabelas)
CREATE POLICY "Supervisores are viewable by everyone" 
ON public.supervisores FOR SELECT USING (true);

CREATE POLICY "Anyone can manage supervisores" 
ON public.supervisores FOR ALL USING (true) WITH CHECK (true);

-- RLS policies para supervisoes
CREATE POLICY "Supervisoes are viewable by everyone" 
ON public.supervisoes FOR SELECT USING (true);

CREATE POLICY "Anyone can manage supervisoes" 
ON public.supervisoes FOR ALL USING (true) WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_supervisores_updated_at
BEFORE UPDATE ON public.supervisores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supervisoes_updated_at
BEFORE UPDATE ON public.supervisoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();