-- Adding OTP verification table and updating profiles table
-- Add email_verified column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- Ensure admin user exists with verified email
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
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "Admin"}',
    false,
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert admin profile
INSERT INTO profiles (
    id,
    email,
    username,
    first_name,
    last_name,
    full_name,
    is_admin,
    email_verified,
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
    true,
    '+1234567890',
    'Admin Street',
    '1',
    'Admin City',
    'Admin State',
    'Admin Country',
    'Admin County',
    '12345',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_admin = EXCLUDED.is_admin,
    email_verified = EXCLUDED.email_verified;
