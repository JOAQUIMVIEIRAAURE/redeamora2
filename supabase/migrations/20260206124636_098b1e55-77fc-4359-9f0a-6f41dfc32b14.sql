-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (is_admin(auth.uid()));