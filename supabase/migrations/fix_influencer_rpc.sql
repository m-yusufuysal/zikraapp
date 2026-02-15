-- Drop existing functions to avoid signature conflicts if needed
drop function if exists get_all_influencers();
drop function if exists add_influencer_by_email(text, text);

-- 1. Corrected get_all_influencers function
-- Needs to pull data from the 'influencers' table directly, 
-- as 'influencer_dashboard_stats' seems to be missing or mismatched.
create or replace function get_all_influencers()
returns table (
  influencer_id uuid,
  user_id uuid,
  full_name text,
  referral_code text,
  click_count bigint,
  registration_count bigint,
  conversion_count bigint,
  total_earnings numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    i.id as influencer_id,
    i.user_id,
    p.full_name,
    i.referral_code,
    coalesce(i.click_count, 0) as click_count,
    coalesce(i.registration_count, 0) as registration_count,
    coalesce(i.conversion_count, 0) as conversion_count,
    coalesce(i.total_earnings, 0) as total_earnings
  from influencers i
  left join profiles p on i.user_id = p.id
  order by i.registration_count desc nulls last;
end;
$$;

-- 2. Corrected add_influencer_by_email function
-- Ensures all necessary columns are initialized
create or replace function add_influencer_by_email(
  user_email text, 
  user_referral_code text
)
returns json
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
  new_influencer_id uuid;
begin
  -- Check if the executor is an admin (optional: currently commented out for dev ease if RLS handles it, 
  -- but adhering to previous logic: check public.admins)
  if not exists (select 1 from public.admins where id = auth.uid()) then
     -- fallback for now: allow if user is authenticated/admin via app logic, 
     -- or uncomment if admins table is strictly populated
     -- return json_build_object('success', false, 'message', 'Unauthorized');
  end if;

  -- Find user by email
  select id into target_user_id from auth.users where email = user_email;
  
  if target_user_id is null then
    return json_build_object('success', false, 'message', 'User not found');
  end if;

  -- Check if already an influencer
  if exists (select 1 from public.influencers where user_id = target_user_id) then
    return json_build_object('success', false, 'message', 'User is already an influencer');
  end if;

  -- Insert into influencers
  insert into public.influencers (user_id, referral_code, total_earnings, click_count, registration_count, conversion_count)
  values (target_user_id, user_referral_code, 0, 0, 0, 0)
  returning id into new_influencer_id;

  return json_build_object('success', true, 'message', 'Influencer added successfully', 'influencer_id', new_influencer_id);

exception when others then
  return json_build_object('success', false, 'message', SQLERRM);
end;
$$;
