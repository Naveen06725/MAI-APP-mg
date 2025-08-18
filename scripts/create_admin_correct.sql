-- Create admin user in profiles table with correct column names
INSERT INTO profiles (
    id,
    username,
    email,
    first_name,
    last_name,
    full_name,
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
) VALUES (
    gen_random_uuid(),
    'Admin',
    'admin@maiplatform.com',
    'Admin',
    'App',
    'Admin App',
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
) ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    is_admin = EXCLUDED.is_admin,
    updated_at = now();

-- Verify the admin user was created
SELECT 
    username,
    email,
    first_name,
    last_name,
    is_admin,
    created_at
FROM profiles 
WHERE username = 'Admin';
