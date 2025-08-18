-- Check what users exist in the database
SELECT 'Auth Users Count' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Profiles Count' as table_name, COUNT(*) as count FROM profiles;

-- Show all profiles with their key fields
SELECT 
  id,
  username,
  email,
  first_name,
  last_name,
  full_name,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- Check if there's a profile with username 'Naveen'
SELECT 
  'Profile with username Naveen' as check_type,
  CASE WHEN EXISTS (SELECT 1 FROM profiles WHERE username = 'Naveen') 
    THEN 'EXISTS' 
    ELSE 'NOT FOUND' 
  END as result;

-- Check auth users (if accessible)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;
