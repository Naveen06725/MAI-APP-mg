-- Create admin user directly in profiles table
-- This bypasses Supabase Auth and creates the profile record needed for login

DO $$
BEGIN
    -- First, check if admin user already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'Admin') THEN
        -- Insert admin user profile
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
            gen_random_uuid(),
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
        );
        
        RAISE NOTICE 'Admin user created successfully with username: Admin';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
    
    -- Verify the admin user was created
    IF EXISTS (SELECT 1 FROM profiles WHERE username = 'Admin' AND is_admin = true) THEN
        RAISE NOTICE 'Admin user verification: SUCCESS - Admin user found with admin privileges';
    ELSE
        RAISE NOTICE 'Admin user verification: FAILED - Admin user not found or missing admin privileges';
    END IF;
END $$;

-- Display the created admin user details
SELECT 
    username,
    email,
    first_name,
    last_name,
    is_admin,
    is_verified,
    created_at
FROM profiles 
WHERE username = 'Admin';
