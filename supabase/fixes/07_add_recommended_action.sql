-- Fix for Dream Interpretation Error
-- Run this in Supabase SQL Editor

ALTER TABLE public.dream_interpretations 
ADD COLUMN IF NOT EXISTS recommended_action text;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dream_interpretations';
