-- Create the default admin user with the specified credentials
-- First, we need to create the auth user, then the profile

-- Insert into auth.users (this requires service role key)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@maiplatform.com',
  crypt('Happy@152624', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "Admin", "first_name": "Admin", "last_name": "App"}',
  false,
  'authenticated'
);

-- Insert the profile for the admin user
INSERT INTO public.profiles (
  id,
  email,
  username,
  first_name,
  last_name,
  full_name,
  is_admin,
  mobile_number,
  street_address,
  building_number,
  city,
  state,
  country,
  county,
  zipcode,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@maiplatform.com'),
  'admin@maiplatform.com',
  'Admin',
  'Admin',
  'App',
  'Admin App',
  true,
  '+1234567890',
  'Admin Street',
  '1',
  'Admin City',
  'Admin State',
  'Admin Country',
  'Admin County',
  '12345',
  now(),
  now()
);
