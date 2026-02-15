-- ============================================
-- Islamvy App - Fix Birth Date Column Type
-- Changes birth_date from timestamp to text
-- ============================================

-- The birth_date column was incorrectly created as timestamp
-- but the app sends DD/MM/YYYY strings. This fixes the issue.

DO $$ 
BEGIN
    -- Check if birth_date is not text type and convert it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'birth_date'
        AND data_type != 'text'
    ) THEN
        -- Drop the column and recreate as text
        ALTER TABLE public.profiles DROP COLUMN IF EXISTS birth_date;
        ALTER TABLE public.profiles ADD COLUMN birth_date text;
        RAISE NOTICE 'Converted birth_date column to text type';
    ELSE
        RAISE NOTICE 'birth_date column is already text type or does not exist';
    END IF;
END $$;

-- Add birth_date if it doesn't exist at all
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'birth_date') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_date text;
        RAISE NOTICE 'Added birth_date column as text';
    END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name = 'birth_date';
