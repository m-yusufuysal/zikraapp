-- Final fix for daily_quotes table
ALTER TABLE public.daily_quotes ADD COLUMN IF NOT EXISTS citation TEXT;

-- Ensure RLS is enabled
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Allow public read access" ON public.daily_quotes;
CREATE POLICY "Allow public read access" ON public.daily_quotes FOR SELECT TO public USING (true);

-- Ensure service role can also do everything
DROP POLICY IF EXISTS "Allow service role all" ON public.daily_quotes;
CREATE POLICY "Allow service role all" ON public.daily_quotes FOR ALL TO service_role USING (true);
