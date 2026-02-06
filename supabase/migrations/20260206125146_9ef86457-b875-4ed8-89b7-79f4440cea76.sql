-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a more comprehensive policy that allows:
-- 1. Users to see their own profile
-- 2. Admins to see all profiles  
-- 3. Users to see profiles of leaders (for display in cells, coordinations, networks)
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
USING (
  -- Own profile
  user_id = auth.uid()
  -- OR is admin
  OR is_admin(auth.uid())
  -- OR profile is a leader of a rede
  OR id IN (SELECT leader_id FROM redes WHERE leader_id IS NOT NULL)
  -- OR profile is a leader of a coordenacao
  OR id IN (SELECT leader_id FROM coordenacoes WHERE leader_id IS NOT NULL)
  -- OR profile is a leader of a celula
  OR id IN (SELECT leader_id FROM celulas WHERE leader_id IS NOT NULL)
);