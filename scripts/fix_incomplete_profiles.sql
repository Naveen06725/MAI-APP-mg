-- First, let's see what profiles exist and their completeness
SELECT 
  id,
  email,
  username,
  first_name,
  last_name,
  full_name,
  mobile_number,
  is_admin,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- Check auth users vs profiles mismatch
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  au.email_confirmed_at,
  p.id as profile_id,
  p.email as profile_email,
  p.username,
  p.first_name,
  p.last_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Create a function to complete incomplete profiles
CREATE OR REPLACE FUNCTION complete_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run this for email confirmations
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Check if profile exists but is incomplete (missing username)
    UPDATE profiles 
    SET 
      username = COALESCE(username, split_part(NEW.email, '@', 1)),
      first_name = COALESCE(first_name, split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 1)),
      last_name = COALESCE(last_name, split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2)),
      full_name = COALESCE(full_name, NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      updated_at = NOW()
    WHERE id = NEW.id 
    AND (username IS NULL OR username = '');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION complete_user_profile();

-- Fix existing incomplete profiles
UPDATE profiles 
SET 
  username = split_part(email, '@', 1),
  first_name = COALESCE(first_name, split_part(full_name, ' ', 1)),
  last_name = COALESCE(last_name, split_part(full_name, ' ', 2))
WHERE username IS NULL OR username = '';

-- Verify the fixes
SELECT 
  id,
  email,
  username,
  first_name,
  last_name,
  full_name,
  mobile_number,
  is_admin
FROM profiles 
WHERE email LIKE '%isukapatlanaveen8%' OR username LIKE '%Naveen%'
ORDER BY created_at DESC;
