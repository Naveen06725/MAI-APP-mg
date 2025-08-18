-- Create admin user in Supabase auth and profiles table
-- This script creates the default admin user with proper foreign key relationships

DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'admin@maiplatform.com';
    admin_username TEXT := 'Admin';
    admin_password TEXT := 'Happy@152624';
BEGIN
    -- Generate a UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users table (this requires superuser privileges)
    -- Note: In production, this should be done through Supabase Auth API
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
        recovery_token
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Insert into profiles table
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        username,
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
        admin_user_id,
        admin_email,
        'Admin',
        'App',
        admin_username,
        '+1234567890',
        '123 Admin Street',
        'Building 1',
        'Admin City',
        'Admin State',
        'Admin Country',
        'Admin County',
        '12345',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        is_admin = EXCLUDED.is_admin,
        updated_at = NOW();
    
    -- Verify the admin user was created
    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
    RAISE NOTICE 'Admin email: %', admin_email;
    RAISE NOTICE 'Admin username: %', admin_username;
    
END $$;

-- Verify the admin user exists
SELECT 
    id,
    email,
    username,
    first_name,
    last_name,
    is_admin,
    created_at
FROM profiles 
WHERE username = 'Admin' OR email = 'admin@maiplatform.com';
