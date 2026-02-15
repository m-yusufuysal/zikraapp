-- Function to get high-level admin stats
create or replace function get_admin_stats()
returns json
language plpgsql
security definer
as $$
declare
  active_users_count integer;
  products_count integer;
  influencers_count integer;
  shop_clicks_count integer;
begin
  -- Get total users (profiles)
  select count(*) into active_users_count from profiles;
  
  -- Get total products
  select count(*) into products_count from products;
  
  -- Get total influencers
  select count(*) into influencers_count from influencers;

  -- Get total shop clicks
  select count(*) into shop_clicks_count from shop_analytics;
  
  return json_build_object(
    'active_users_count', active_users_count,
    'products_count', products_count,
    'influencers_count', influencers_count,
    'shop_clicks_count', shop_clicks_count
  );
end;
$$;

-- Function to get all influencers with their stats
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
    coalesce(s.click_count, 0) as click_count,
    coalesce(s.registration_count, 0) as registration_count,
    coalesce(s.conversion_count, 0) as conversion_count,
    coalesce(s.total_earnings, 0) as total_earnings
  from influencers i
  left join profiles p on i.user_id = p.id
  left join influencer_dashboard_stats s on s.influencer_id = i.id
  order by s.registration_count desc nulls last;
end;
$$;

-- Function to get shop analytics
create or replace function get_shop_stats()
returns json
language plpgsql
security definer
as $$
declare
  total_clicks bigint;
  clicks_today bigint;
  top_products json;
begin
  -- Total clicks
  select count(*) into total_clicks from shop_analytics;

  -- Clicks today
  select count(*) into clicks_today 
  from shop_analytics 
  where created_at > current_date;

  -- Top 5 products
  select json_agg(t) into top_products
  from (
    select product_name, count(*) as clicks
    from shop_analytics
    group by product_name
    order by clicks desc
    limit 5
  ) t;

  return json_build_object(
    'total_clicks', total_clicks,
    'clicks_today', clicks_today,
    'top_products', coalesce(top_products, '[]'::json)
  );
end;
$$;

-- Function to get user growth history (last 7 days)
create or replace function get_user_stats_history()
returns table (
  date_label text,
  user_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    to_char(date_trunc('day', created_at), 'Mon DD') as date_label,
    count(*) as user_count
  from profiles
  where created_at > current_date - interval '7 days'
  group by date_trunc('day', created_at)
  order by date_trunc('day', created_at);
end;
$$;
