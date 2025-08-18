-- Clean up any remaining OTP data from admin_stats table
DELETE FROM admin_stats WHERE stat_type = 'otp_verification';

-- Clean up any other OTP-related data
DELETE FROM admin_stats WHERE stat_type LIKE '%otp%';
