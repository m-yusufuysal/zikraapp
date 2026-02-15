-- 1. Add machine_id to profiles for device tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS machine_id TEXT;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_machine_id ON public.profiles(machine_id);

-- 3. Function to check if a device is over the free account limit
CREATE OR REPLACE FUNCTION public.check_device_account_limit(p_machine_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_account_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_account_count FROM public.profiles WHERE machine_id = p_machine_id;
    -- For example, allow max 3 accounts per device to be safe (family use)
    RETURN v_account_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Unified usage tracking table (Server-side)
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    machine_id text NOT NULL,
    feature text NOT NULL, -- 'dream' or 'dhikr'
    usage_date date DEFAULT CURRENT_DATE,
    count integer DEFAULT 1,
    UNIQUE(user_id, feature, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_machine_date ON public.ai_usage(machine_id, usage_date);

-- 5. Function to check AI limits (Device-level for free users)
CREATE OR REPLACE FUNCTION public.fn_check_ai_limit(p_user_id UUID, p_machine_id TEXT, p_feature TEXT)
RETURNS JSONB AS $$
DECLARE
    v_is_premium BOOLEAN;
    v_tier TEXT;
    v_limit INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get user tier
    SELECT is_premium, premium_tier INTO v_is_premium, v_tier FROM public.profiles WHERE id = p_user_id;
    
    -- Determine limit
    IF v_is_premium THEN
        CASE v_tier
            WHEN 'starter' THEN v_limit := 3;
            WHEN 'pro' THEN v_limit := 10;
            WHEN 'unlimited' THEN v_limit := 99;
            ELSE v_limit := 3;
        END CASE;
    ELSE
        v_limit := 1; -- Free limit
    END IF;

    -- Calculate usage
    -- If user is FREE, we check usage across ALL accounts for this machine_id
    IF NOT v_is_premium THEN
        SELECT COALESCE(SUM(count), 0) INTO v_current_count 
        FROM public.ai_usage 
        WHERE machine_id = p_machine_id AND feature = p_feature AND usage_date = CURRENT_DATE;
    ELSE
        -- If premium, limit is per user
        SELECT COALESCE(count, 0) INTO v_current_count 
        FROM public.ai_usage 
        WHERE user_id = p_user_id AND feature = p_feature AND usage_date = CURRENT_DATE;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_current_count < v_limit,
        'limit', v_limit,
        'current_count', v_current_count,
        'tier', COALESCE(v_tier, 'free'),
        'device_limit_reached', (NOT v_is_premium AND v_current_count >= v_limit),
        'can_bypass_with_ad', (NOT v_is_premium) -- Any free user can try to bypass with ad
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to safely increment AI usage
CREATE OR REPLACE FUNCTION public.fn_increment_ai_usage(p_user_id UUID, p_machine_id TEXT, p_feature TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.ai_usage (user_id, machine_id, feature, usage_date, count)
    VALUES (p_user_id, p_machine_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, usage_date) 
    DO UPDATE SET count = ai_usage.count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Add updated_at to ai_usage for bookkeeping
ALTER TABLE public.ai_usage ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
