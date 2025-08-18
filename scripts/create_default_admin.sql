-- Create default admin user with specified credentials
-- First, we need to create the auth user, then the profile
-- Note: This requires manual setup in Supabase Auth dashboard or via API
-- For now, we'll create a profile entry that can be linked to an auth user

INSERT INTO profiles (
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
  gen_random_uuid(),
  'admin@maiplatform.com',
  'Admin',
  'Admin',
  'App',
  'Admin App',
  true,
  '+1234567890',
  'Main Street',
  '123',
  'Tech City',
  'California',
  'United States',
  'Silicon County',
  '90210',
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;
