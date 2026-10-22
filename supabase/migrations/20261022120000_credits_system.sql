-- Webloom Credits System:
-- Free accounts start with 30 credits (1 website = 30 credits; downloading ZIP = 10 credits).
-- Users can request credits or message admin about credit pricing; admins can add credits to any account.

alter table public.profiles
  add column if not exists credits integer not null default 30;

alter table public.profiles drop constraint if exists profiles_credits_check;
alter table public.profiles
  add constraint profiles_credits_check check (credits >= 0);

-- Give platform admins a generous credit pool by default.
update public.profiles
   set credits = greatest(credits, 999999)
 where id in (select user_id from public.platform_admins);

alter table public.subscription_requests
  add column if not exists requested_credits integer not null default 10,
  add column if not exists request_type text not null default 'credits';

alter table public.subscription_requests drop constraint if exists subscription_requests_type_check;
alter table public.subscription_requests
  add constraint subscription_requests_type_check check (request_type in ('credits', 'pricing'));

grant select, insert on table public.subscription_requests to authenticated;

drop policy if exists subscription_requests_read_admin on public.subscription_requests;
create policy subscription_requests_read_admin on public.subscription_requests
  for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_platform_admin()));

drop policy if exists subscription_requests_insert_own on public.subscription_requests;
create policy subscription_requests_insert_own on public.subscription_requests
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Spend credits atomically for website creation (30) or download (10).
create or replace function public.spend_user_credits(p_amount integer, p_reason text default 'website_action')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_remaining integer;
  v_email text;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_amount <= 0 then
    select credits into v_remaining from public.profiles where id = v_uid;
    return coalesce(v_remaining, 0);
  end if;

  if public.is_platform_admin() then
    select credits into v_remaining from public.profiles where id = v_uid;
    return coalesce(v_remaining, 999999);
  end if;

  update public.profiles
     set credits = credits - p_amount,
         updated_at = now()
   where id = v_uid
     and credits >= p_amount
   returning credits, email into v_remaining, v_email;

  if not found then
    raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001';
  end if;

  insert into public.audit_logs (actor_id, action, target_user_id, target_email, metadata)
  values (
    v_uid,
    'credits_spent',
    v_uid,
    coalesce(v_email, ''),
    jsonb_build_object('amount', p_amount, 'remaining', v_remaining, 'reason', coalesce(p_reason, 'website_action'))
  );

  return v_remaining;
end;
$$;

revoke all on function public.spend_user_credits(integer, text) from public, anon;
grant execute on function public.spend_user_credits(integer, text) to authenticated;

-- Admin function to add or set credits for a customer account.
create or replace function public.admin_adjust_user_credits(
  p_user_id uuid,
  p_delta integer,
  p_set_exact boolean default false
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_credits integer;
  v_target_email text;
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator permission required' using errcode = '42501';
  end if;

  update public.profiles
     set credits = case
                     when p_set_exact then greatest(0, p_delta)
                     else greatest(0, credits + p_delta)
                   end,
         plan = case
                  when (case when p_set_exact then greatest(0, p_delta) else greatest(0, credits + p_delta) end) > 30 then 'pro'
                  else plan
                end,
         updated_at = now()
   where id = p_user_id
   returning credits, email into v_new_credits, v_target_email;

  if not found then
    raise exception 'Customer account not found' using errcode = 'P0002';
  end if;

  insert into public.audit_logs (actor_id, action, target_user_id, target_email, metadata)
  values (
    (select auth.uid()),
    'credits_adjusted',
    p_user_id,
    coalesce(v_target_email, ''),
    jsonb_build_object('delta', p_delta, 'set_exact', p_set_exact, 'credits', v_new_credits)
  );

  return v_new_credits;
end;
$$;

revoke all on function public.admin_adjust_user_credits(uuid, integer, boolean) from public, anon;
grant execute on function public.admin_adjust_user_credits(uuid, integer, boolean) to authenticated;

-- Update request approval so approving a credit request automatically adds the requested credits.
create or replace function public.admin_set_subscription_request_status(p_request_id bigint, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
  target_email text;
  v_req_credits integer;
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator permission required' using errcode = '42501';
  end if;
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid status' using errcode = 'P0001';
  end if;

  update public.subscription_requests
     set status = p_status,
         reviewed_at = now(),
         reviewed_by = (select auth.uid())
   where id = p_request_id
   returning user_id, email, requested_credits into target_user_id, target_email, v_req_credits;
  if not found then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;

  if p_status = 'approved' and target_user_id is not null then
    update public.profiles
       set credits = credits + greatest(coalesce(v_req_credits, 10), 10),
           plan = 'pro',
           subscribed_at = coalesce(subscribed_at, now()),
           updated_at = now()
     where id = target_user_id;
  end if;

  insert into public.audit_logs (actor_id, action, target_user_id, target_email, metadata)
  values (
    (select auth.uid()),
    case p_status when 'approved' then 'credit_request_approved' else 'credit_request_rejected' end,
    target_user_id,
    coalesce(target_email, ''),
    jsonb_build_object('request_id', p_request_id, 'status', p_status, 'credits_added', case when p_status = 'approved' then greatest(coalesce(v_req_credits, 10), 10) else 0 end)
  );
end;
$$;

revoke all on function public.admin_set_subscription_request_status(bigint, text) from public, anon;
grant execute on function public.admin_set_subscription_request_status(bigint, text) to authenticated;
