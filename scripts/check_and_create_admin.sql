-- Check if admin user exists and create if not
DO $$
BEGIN
  -- First check if admin user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@maiplatform.com') THEN
    -- Create admin user in auth.users table
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
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@maiplatform.com',
      crypt('Happy@152624', gen_salt('bf')),
      now(),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    
    -- Get the created user ID
    DECLARE admin_user_id uuid;
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@maiplatform.com';
    
    -- Create profile for admin user
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
      admin_user_id,
      'admin@maiplatform.com',
      'Admin',
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
    
    RAISE NOTICE 'Admin user created successfully';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;
