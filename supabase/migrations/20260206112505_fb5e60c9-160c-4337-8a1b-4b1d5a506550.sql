-- Enum para os papéis do sistema
CREATE TYPE public.app_role AS ENUM ('admin', 'rede_leader', 'coordenador', 'celula_leader');

-- Tabela de papéis dos usuários (separada para segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Tabela de perfis
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de redes
CREATE TABLE public.redes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    leader_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de coordenações
CREATE TABLE public.coordenacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rede_id UUID REFERENCES public.redes(id) ON DELETE CASCADE NOT NULL,
    leader_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de células
CREATE TABLE public.celulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    meeting_day TEXT,
    meeting_time TIME,
    coordenacao_id UUID REFERENCES public.coordenacoes(id) ON DELETE CASCADE NOT NULL,
    leader_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros (vinculados a células)
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    celula_id UUID REFERENCES public.celulas(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (profile_id, celula_id)
);

-- Tabela de reuniões
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    celula_id UUID REFERENCES public.celulas(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de presenças
CREATE TABLE public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    present BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (meeting_id, member_id)
);

-- Tabela de visitantes
CREATE TABLE public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordenacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem um papel específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Função para obter profile_id do usuário
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Função para verificar se pode gerenciar célula
CREATE OR REPLACE FUNCTION public.can_manage_celula(_user_id UUID, _celula_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- É admin
    SELECT 1 WHERE public.is_admin(_user_id)
    UNION
    -- É líder de rede da rede que contém essa célula
    SELECT 1 FROM public.celulas c
    JOIN public.coordenacoes co ON c.coordenacao_id = co.id
    JOIN public.redes r ON co.rede_id = r.id
    WHERE c.id = _celula_id AND r.leader_id = public.get_profile_id(_user_id)
    UNION
    -- É coordenador da coordenação que contém essa célula
    SELECT 1 FROM public.celulas c
    JOIN public.coordenacoes co ON c.coordenacao_id = co.id
    WHERE c.id = _celula_id AND co.leader_id = public.get_profile_id(_user_id)
    UNION
    -- É líder dessa célula
    SELECT 1 FROM public.celulas c
    WHERE c.id = _celula_id AND c.leader_id = public.get_profile_id(_user_id)
  )
$$;

-- Função para verificar se pode gerenciar coordenação
CREATE OR REPLACE FUNCTION public.can_manage_coordenacao(_user_id UUID, _coordenacao_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- É admin
    SELECT 1 WHERE public.is_admin(_user_id)
    UNION
    -- É líder de rede da rede que contém essa coordenação
    SELECT 1 FROM public.coordenacoes co
    JOIN public.redes r ON co.rede_id = r.id
    WHERE co.id = _coordenacao_id AND r.leader_id = public.get_profile_id(_user_id)
    UNION
    -- É coordenador dessa coordenação
    SELECT 1 FROM public.coordenacoes co
    WHERE co.id = _coordenacao_id AND co.leader_id = public.get_profile_id(_user_id)
  )
$$;

-- Função para verificar se pode gerenciar rede
CREATE OR REPLACE FUNCTION public.can_manage_rede(_user_id UUID, _rede_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- É admin
    SELECT 1 WHERE public.is_admin(_user_id)
    UNION
    -- É líder dessa rede
    SELECT 1 FROM public.redes r
    WHERE r.id = _rede_id AND r.leader_id = public.get_profile_id(_user_id)
  )
$$;

-- Políticas para user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas para profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para redes
CREATE POLICY "Redes are viewable by authenticated users" ON public.redes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and rede leaders can manage redes" ON public.redes
  FOR ALL USING (public.is_admin(auth.uid()) OR leader_id = public.get_profile_id(auth.uid()));

-- Políticas para coordenacoes
CREATE POLICY "Coordenacoes are viewable by authenticated users" ON public.coordenacoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with permission can manage coordenacoes" ON public.coordenacoes
  FOR ALL USING (public.can_manage_coordenacao(auth.uid(), id));

CREATE POLICY "Admins and rede leaders can insert coordenacoes" ON public.coordenacoes
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.redes r 
      WHERE r.id = rede_id AND r.leader_id = public.get_profile_id(auth.uid())
    )
  );

-- Políticas para celulas
CREATE POLICY "Celulas are viewable by authenticated users" ON public.celulas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with permission can manage celulas" ON public.celulas
  FOR ALL USING (public.can_manage_celula(auth.uid(), id));

CREATE POLICY "Users with permission can insert celulas" ON public.celulas
  FOR INSERT WITH CHECK (public.can_manage_coordenacao(auth.uid(), coordenacao_id));

-- Políticas para members
CREATE POLICY "Members are viewable by authenticated users" ON public.members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with permission can manage members" ON public.members
  FOR ALL USING (public.can_manage_celula(auth.uid(), celula_id));

-- Políticas para meetings
CREATE POLICY "Meetings are viewable by authenticated users" ON public.meetings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with permission can manage meetings" ON public.meetings
  FOR ALL USING (public.can_manage_celula(auth.uid(), celula_id));

-- Políticas para attendances
CREATE POLICY "Attendances are viewable by authenticated users" ON public.attendances
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with permission can manage attendances" ON public.attendances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meetings m 
      WHERE m.id = meeting_id AND public.can_manage_celula(auth.uid(), m.celula_id)
    )
  );

-- Políticas para visitors
CREATE POLICY "Visitors are viewable by authenticated users" ON public.visitors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with permission can manage visitors" ON public.visitors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meetings m 
      WHERE m.id = meeting_id AND public.can_manage_celula(auth.uid(), m.celula_id)
    )
  );

-- Trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redes_updated_at
  BEFORE UPDATE ON public.redes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coordenacoes_updated_at
  BEFORE UPDATE ON public.coordenacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_celulas_updated_at
  BEFORE UPDATE ON public.celulas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();