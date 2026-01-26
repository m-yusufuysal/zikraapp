-- ============================================
-- Zikra App - Schema Update for Personal Closing Dua
-- ============================================

-- Add closing_dua column to dhikr_sessions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'dhikr_sessions' 
                   AND column_name = 'closing_dua') THEN
        ALTER TABLE public.dhikr_sessions ADD COLUMN closing_dua text;
        RAISE NOTICE 'Added closing_dua column to dhikr_sessions table';
    ELSE
        RAISE NOTICE 'closing_dua column already exists in dhikr_sessions table';
    END IF;
END $$;
