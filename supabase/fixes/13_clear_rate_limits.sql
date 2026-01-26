-- ============================================
-- Zikra App - Clear Rate Limits & Verify Premium
-- Run this in Supabase SQL Editor to fix issues
-- ============================================

-- STEP 1: Clear ALL dream rate limit records
DELETE FROM public.rate_limits WHERE key LIKE 'dream:%';

-- STEP 2: Clear ALL dhikr rate limit records  
DELETE FROM public.rate_limits WHERE key LIKE 'dhikr:%';

-- STEP 3: Reset local usage records will happen automatically in app

-- STEP 4: Verify premium users have correct tier
-- Update any premium user without a tier to 'unlimited'
UPDATE public.profiles 
SET premium_tier = 'unlimited' 
WHERE is_premium = true AND (premium_tier IS NULL OR premium_tier = '');

-- STEP 5: Verify - Show all premium users
SELECT id, full_name, is_premium, premium_tier, updated_at
FROM public.profiles
WHERE is_premium = true;

