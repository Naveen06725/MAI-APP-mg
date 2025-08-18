-- Adding unique constraints to prevent duplicate usernames, emails, and mobile numbers
ALTER TABLE profiles 
ADD CONSTRAINT unique_username UNIQUE (username),
ADD CONSTRAINT unique_email UNIQUE (email),
ADD CONSTRAINT unique_mobile_number UNIQUE (mobile_number);

-- Create indexes for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile_number ON profiles(mobile_number);
