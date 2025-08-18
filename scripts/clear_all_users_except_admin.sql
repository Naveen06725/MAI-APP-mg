-- Clear all non-admin users from profiles and related data
-- This script removes all users except those marked as admin

-- Fixed column references to match actual database schema
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Delete all non-admin profiles and their related data
    FOR user_record IN 
        SELECT id, email FROM profiles WHERE is_admin = false
    LOOP
        -- Clean up any OTP records stored in admin_stats
        DELETE FROM admin_stats 
        WHERE stat_type LIKE 'otp_%' 
        AND stat_value::jsonb->>'email' = user_record.email;
        
        -- Delete the profile
        DELETE FROM profiles WHERE id = user_record.id;
        
        RAISE NOTICE 'Deleted user profile: % (%)', user_record.id, user_record.email;
    END LOOP;
    
    RAISE NOTICE 'All non-admin users have been cleared from the database';
END $$;
