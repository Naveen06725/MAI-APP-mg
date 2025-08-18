-- Insert admin user directly into profiles table
INSERT INTO profiles (
    id,
    email,
    full_name,
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
) VALUES (
    gen_random_uuid(),
    'admin@maiplatform.com',
    'Admin App',
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
);

-- Verify the admin user was created
SELECT 
    username,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles 
WHERE username = 'Admin' OR email = 'admin@maiplatform.com';
