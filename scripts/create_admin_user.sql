-- Create default admin user with credentials: Admin / Happy@152624
-- This script creates both the auth user and profile record

-- First, insert into auth.users (Supabase's authentication table)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@maiplatform.com',
  crypt('Happy@152624', gen_salt('bf')), -- Hash the password
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated',
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "Admin", "first_name": "Admin", "last_name": "App"}',
  false,
  NOW(),
  null,
  null,
  '',
  '',
  '',
  0,
  null,
  '',
  null,
  false,
  null
) ON CONFLICT (email) DO NOTHING;

-- Then insert into profiles table
INSERT INTO profiles (
  id,
  email,
  username,
  first_name,
  last_name,
  mobile_number,
  street,
  building_no,
  city,
  state,
  country,
  county,
  zipcode,
  is_admin,
  is_verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@maiplatform.com'),
  'admin@maiplatform.com',
  'Admin',
  'Admin',
  'App',
  '+1234567890',
  'Admin Street',
  '1',
  'Admin City',
  'Admin State',
  'Admin Country',
  'Admin County',
  '12345',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_admin = EXCLUDED.is_admin,
  is_verified = EXCLUDED.is_verified;

-- Verify the admin user was created
SELECT 
  p.username,
  p.email,
  p.first_name,
  p.last_name,
  p.is_admin,
  p.is_verified,
  'Admin user created successfully' as status
FROM profiles p 
WHERE p.username = 'Admin';
