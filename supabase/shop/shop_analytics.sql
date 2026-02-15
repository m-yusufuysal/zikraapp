-- Run this in your Supabase SQL Editor to enable Shop Analytics

-- 1. Create the Analytics Table
create table if not exists public.shop_analytics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id), -- Optional, if user is logged in
  product_id text, -- ID of the product clicked
  product_name text, -- Name for easier reading
  click_type text, -- 'product' or 'search'
  region_code text, -- 'TR', 'US', etc.
  destination_url text -- Where they went
);

-- 2. Enable RLS (Security)
alter table public.shop_analytics enable row level security;

-- 3. Policy: Allow anyone (anon) to INSERT metrics (since we want to track even guests)
create policy "Allow public insert to analytics"
on public.shop_analytics for insert
with check (true);

-- 4. Policy: Only admins can SELECT (View)
-- (Adjust this if you have an admin role, typically service_role key bypasses this anyway)
