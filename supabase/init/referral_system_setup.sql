-- ============================================
-- Islamvy App - Influencer Referral System
-- Version 1.0
-- ============================================

-- 1. INFLUENCERS TABLE
CREATE TABLE IF NOT EXISTS public.influencers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    referral_code text UNIQUE NOT NULL,
    commission_rate numeric(5,2) DEFAULT 20.00, -- e.g. 20.00%
    total_earned numeric(12,2) DEFAULT 0.00,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

-- Influencers can view their own data
CREATE POLICY "Influencers can view own data" 
    ON public.influencers FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    influencer_id uuid REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
    referred_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    device_id text, -- For anonymous tracking
    status text DEFAULT 'clicked' CHECK (status IN ('clicked', 'registered', 'converted')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    converted_at timestamp with time zone
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Influencers can view their own referrals
CREATE POLICY "Influencers can view own referrals" 
    ON public.referrals FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.influencers 
            WHERE influencers.id = referrals.influencer_id 
            AND influencers.user_id = auth.uid()
        )
    );

-- 3. INFLUENCER PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.influencer_payouts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    influencer_id uuid REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
    referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
    amount numeric(12,2) NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.influencer_payouts ENABLE ROW LEVEL SECURITY;

-- Influencers can view their own payouts
CREATE POLICY "Influencers can view own payouts" 
    ON public.influencer_payouts FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.influencers 
            WHERE influencers.id = influencer_payouts.influencer_id 
            AND influencers.user_id = auth.uid()
        )
    );

-- 4. VIEW FOR DASHBOARD STATS
CREATE OR REPLACE VIEW public.influencer_dashboard_stats AS
SELECT 
    i.user_id as owner_id,
    i.id as influencer_id,
    i.referral_code,
    COUNT(r.id) FILTER (WHERE r.status = 'clicked') as click_count,
    COUNT(r.id) FILTER (WHERE r.status = 'registered') as registration_count,
    COUNT(r.id) FILTER (WHERE r.status = 'converted') as conversion_count,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'pending'), 0) as pending_payout,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'paid'), 0) as total_paid
FROM public.influencers i
LEFT JOIN public.referrals r ON i.id = r.influencer_id
LEFT JOIN public.influencer_payouts p ON i.id = p.influencer_id
GROUP BY i.id, i.user_id;

-- 5. CONVERSION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_referral_conversion()
RETURNS trigger AS $$
DECLARE
    v_influencer_id uuid;
    v_commission_rate numeric;
    v_payout_amount numeric := 10.00; -- Default flat fee or logic here
BEGIN
    -- Check if user was referred
    IF NEW.is_premium = true AND (OLD.is_premium = false OR OLD.is_premium IS NULL) THEN
        -- Find the registration referral
        UPDATE public.referrals
        SET status = 'converted', converted_at = now()
        WHERE referred_user_id = NEW.id AND status = 'registered'
        RETURNING influencer_id INTO v_influencer_id;

        IF v_influencer_id IS NOT NULL THEN
            -- Get influencer commission rate
            SELECT commission_rate INTO v_commission_rate FROM public.influencers WHERE id = v_influencer_id;
            
            -- Record the payout (example: 10 units of currency)
            INSERT INTO public.influencer_payouts (influencer_id, amount, status)
            VALUES (v_influencer_id, v_payout_amount, 'pending');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_premium_conversion ON public.profiles;
CREATE TRIGGER on_premium_conversion
    AFTER UPDATE OF is_premium ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_referral_conversion();

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_referrals_influencer_id ON public.referrals(influencer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_influencers_referral_code ON public.influencers(referral_code);
