-- Create admin user directly in Supabase auth and profiles table
-- This script creates the admin user with username: Admin, password: Happy@152624

-- First, let's check if admin user already exists
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@maiplatform.com';
    admin_username text := 'Admin';
BEGIN
    -- Check if user already exists in profiles
    SELECT id INTO admin_user_id FROM profiles WHERE username = admin_username OR email = admin_email;
    
    IF admin_user_id IS NULL THEN
        -- Generate a UUID for the admin user
        admin_user_id := gen_random_uuid();
        
        -- Insert into auth.users table (this is the Supabase auth table)
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
            admin_user_id,
            admin_email,
            crypt('Happy@152624', gen_salt('bf')), -- Hash the password
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"username": "Admin", "first_name": "Admin", "last_name": "App"}',
            false,
            'authenticated'
        );
        
        -- Insert into profiles table
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
            admin_user_id,
            admin_email,
            admin_username,
            'Admin',
            'App',
            'Admin App',
            true,
            '+1234567890',
            '123 Admin Street',
            'Building 1',
            'Admin City',
            'Admin State',
            'Admin Country',
            'Admin County',
            '12345',
            now(),
            now()
        );
        
        RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
END $$;

-- Verify the admin user was created
SELECT 
    p.id,
    p.username,
    p.email,
    p.first_name,
    p.last_name,
    p.is_admin,
    p.created_at
FROM profiles p 
WHERE p.username = 'Admin' OR p.email = 'admin@maiplatform.com';
