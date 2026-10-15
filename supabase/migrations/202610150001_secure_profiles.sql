-- User profiles are linked to Supabase Auth identities.
-- Run in Supabase SQL Editor or via Supabase CLI migrations.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  theological_role text not null default 'Estudante'
    check (theological_role in ('Estudante', 'Teólogo', 'Pastor', 'Líder', 'Membro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, theological_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('Estudante', 'Teólogo', 'Pastor', 'Líder', 'Membro')
        then new.raw_user_meta_data ->> 'role'
      else 'Estudante'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- Never store a Supabase service_role key in the browser. RLS limits each
-- authenticated user to their own profile. Do not use theological_role for admin authorization.


-- Entitlements are authoritative for paid access. Users can read only their own row.
create table if not exists public.subscription_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual', 'lifetime')),
  active boolean not null default true,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.subscription_entitlements enable row level security;
drop policy if exists "Users can read own entitlement" on public.subscription_entitlements;
create policy "Users can read own entitlement"
  on public.subscription_entitlements for select to authenticated
  using (auth.uid() = user_id);

-- Voucher table intentionally has no client-facing policies. Manage codes in the
-- Supabase dashboard using an admin/service-role context only.
create table if not exists public.voucher_codes (
  code text primary key,
  plan text not null check (plan in ('monthly', 'annual', 'lifetime')),
  enabled boolean not null default true,
  expires_at timestamptz,
  max_redemptions integer not null default 1 check (max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  created_at timestamptz not null default now()
);
alter table public.voucher_codes enable row level security;

create table if not exists public.voucher_redemptions (
  id bigint generated always as identity primary key,
  code text not null references public.voucher_codes(code),
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code, user_id)
);
alter table public.voucher_redemptions enable row level security;

create or replace function public.redeem_voucher(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_code public.voucher_codes%rowtype;
  v_expires_at timestamptz;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', 'Faça login para resgatar o cupom.');
  end if;

  select * into v_code
  from public.voucher_codes
  where code = upper(trim(p_code))
  for update;

  if not found or not v_code.enabled
     or (v_code.expires_at is not null and v_code.expires_at <= now())
     or v_code.redemption_count >= v_code.max_redemptions then
    return jsonb_build_object('success', false, 'message', 'Código inválido, expirado ou já utilizado.');
  end if;

  if exists (
    select 1 from public.voucher_redemptions
    where code = v_code.code and user_id = v_user_id
  ) then
    return jsonb_build_object('success', false, 'message', 'Este cupom já foi utilizado nesta conta.');
  end if;

  v_expires_at := case
    when v_code.plan = 'lifetime' then null
    when v_code.plan = 'annual' then now() + interval '365 days'
    else now() + interval '30 days'
  end;

  insert into public.voucher_redemptions(code, user_id)
  values (v_code.code, v_user_id);

  update public.voucher_codes
  set redemption_count = redemption_count + 1
  where code = v_code.code;

  insert into public.subscription_entitlements(user_id, plan, active, expires_at, updated_at)
  values (v_user_id, v_code.plan, true, v_expires_at, now())
  on conflict (user_id) do update
  set plan = excluded.plan, active = true, expires_at = excluded.expires_at, updated_at = now();

  return jsonb_build_object(
    'success', true,
    'message', 'Cupom validado com sucesso.',
    'plan', v_code.plan,
    'expires_at', v_expires_at
  );
end;
$$;

revoke all on function public.redeem_voucher(text) from public;
grant execute on function public.redeem_voucher(text) to authenticated;
