-- Remover políticas antigas restritivas
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Criar políticas públicas para ambiente controlado (como outras tabelas)
CREATE POLICY "User roles are viewable by everyone" 
ON public.user_roles FOR SELECT USING (true);

CREATE POLICY "Anyone can manage user roles" 
ON public.user_roles FOR ALL USING (true) WITH CHECK (true);