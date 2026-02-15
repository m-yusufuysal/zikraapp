-- ============================================
-- Fix: Add missing updated_at column to hatim_groups
-- This column is required by the check_hatim_completion trigger
-- ============================================

ALTER TABLE public.hatim_groups 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
