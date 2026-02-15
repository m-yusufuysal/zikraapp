-- Migration: Add new enriched fields for dream interpretations
-- Date: 2026-02-02
-- Description: Adds contextual_analysis, islamic_references, and timing_advice columns
--              to support the enhanced Hz. Yusuf-level dream interpretation system

-- Add new columns for enriched dream interpretations
ALTER TABLE public.dream_interpretations 
ADD COLUMN IF NOT EXISTS contextual_analysis TEXT,
ADD COLUMN IF NOT EXISTS islamic_references TEXT,
ADD COLUMN IF NOT EXISTS timing_advice TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.dream_interpretations.contextual_analysis IS 'Analysis of how dream symbols interact with each other';
COMMENT ON COLUMN public.dream_interpretations.islamic_references IS 'Quran and Hadith references related to the dream interpretation';
COMMENT ON COLUMN public.dream_interpretations.timing_advice IS 'Advice on timing when the dream effects will be strongest';
