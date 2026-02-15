-- ============================================
-- Islamvy App - RLS Performance Optimization
-- ============================================

-- Fix: auth_rls_initplan (LINT 0003)
-- Wrapping auth.role() in a subquery (SELECT auth.role()) prevents 
-- re-evaluation for every row, making RLS much more efficient at scale.

DROP POLICY IF EXISTS "Allow public insert to analytics" ON public.shop_analytics;
CREATE POLICY "Allow public insert to analytics"
ON public.shop_analytics FOR INSERT
TO public
WITH CHECK (
  ((SELECT auth.role()) = 'anon' OR (SELECT auth.role()) = 'authenticated') AND
  click_type IS NOT NULL AND
  product_id IS NOT NULL
);
