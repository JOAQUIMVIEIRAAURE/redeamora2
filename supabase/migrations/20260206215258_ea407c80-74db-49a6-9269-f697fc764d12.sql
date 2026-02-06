-- Remover a foreign key que liga profiles a auth.users
-- Isso permite criar perfis para membros sem precisar de usuário autenticado
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;