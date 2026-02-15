-- Ensure daily_quotes table exists with all required columns
CREATE TABLE IF NOT EXISTS public.daily_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    language TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    citation TEXT,
    type TEXT DEFAULT 'verse',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(date, language)
);

-- Enable RLS
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.daily_quotes;
CREATE POLICY "Allow public read access" ON public.daily_quotes FOR SELECT TO public USING (true);

-- Allow service role all
DROP POLICY IF EXISTS "Allow service role all" ON public.daily_quotes;
CREATE POLICY "Allow service role all" ON public.daily_quotes FOR ALL TO service_role USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_quotes_date ON public.daily_quotes(date);
CREATE INDEX IF NOT EXISTS idx_daily_quotes_lang ON public.daily_quotes(language);
