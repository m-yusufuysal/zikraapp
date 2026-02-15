-- 1. Create a secure function to add an influencer by email
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
  -- Check if the executor is an admin
  if not exists (select 1 from public.admins where id = auth.uid()) then
    return json_build_object('success', false, 'message', 'Unauthorized');
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
  insert into public.influencers (user_id, referral_code, total_earnings, click_count, registration_count)
  values (target_user_id, user_referral_code, 0, 0, 0)
  returning influencer_id into new_influencer_id;

  return json_build_object('success', true, 'message', 'Influencer added successfully', 'influencer_id', new_influencer_id);

exception when others then
  return json_build_object('success', false, 'message', SQLERRM);
end;
$$;
