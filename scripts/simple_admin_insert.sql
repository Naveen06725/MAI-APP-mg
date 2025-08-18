-- Create admin user directly
-- First, let's check if admin already exists
SELECT 'Checking for existing admin user...' as status;

-- Insert into auth.users table
INSERT INTO auth.users (
    id,
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

-- Get the user ID we just created
WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'admin@maiplatform.com' LIMIT 1
)
-- Insert into profiles table
INSERT INTO profiles (
    id,
    email,
    username,
    first_name,
    last_name,
    mobile_number,
    street_address,
    building_number,
    city,
    state,
    country,
    county,
    zipcode,
    is_admin,
    created_at,
    updated_at
)
SELECT 
    admin_user.id,
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
    now(),
    now()
FROM admin_user;

-- Verify the admin user was created
SELECT 'Admin user created successfully!' as status;
SELECT username, email, is_admin FROM profiles WHERE username = 'Admin';
