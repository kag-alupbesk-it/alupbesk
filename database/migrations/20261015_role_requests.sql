create table if not exists role_requests (
    id              uuid primary key default gen_random_uuid(),
    auth_user_id    uuid not null references auth.users(id) on delete cascade,
    profile_id      uuid not null references users(id) on delete cascade,
    requested_role  user_role not null check (requested_role <> 'owner'),
    status          text not null default 'PENDING'
                    check (status in ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by     uuid references users(id) on delete set null,
    reviewed_at     timestamptz,
    created_at      timestamptz not null default now()
);

create index if not exists idx_role_requests_pending
    on role_requests(created_at desc)
    where status = 'PENDING';

create unique index if not exists idx_role_requests_one_pending_per_user
    on role_requests(auth_user_id)
    where status = 'PENDING';

alter table role_requests enable row level security;

create or replace function public.create_role_request_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    requested_role_text text;
    profile_id_value uuid;
    profile_active boolean;
    display_name text;
    department text;
begin
    requested_role_text := new.raw_user_meta_data ->> 'requested_role';
    if requested_role_text is null or requested_role_text = '' then
        return new;
    end if;

    if requested_role_text not in (
        'marketing', 'gudang', 'keuangan', 'proyek', 'field', 'produksi'
    ) then
        raise exception 'INVALID_REQUESTED_ROLE';
    end if;

    display_name := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        split_part(new.email, '@', 1)
    );
    department := nullif(trim(new.raw_user_meta_data ->> 'department'), '');

    select id, active
      into profile_id_value, profile_active
      from public.users
     where lower(email) = lower(new.email)
     limit 1;

    if profile_active is true then
        raise exception 'PROFILE_ALREADY_ACTIVE';
    end if;

    if profile_id_value is null then
        insert into public.users (id, name, email, dept, role, status, active)
        values (
            new.id,
            display_name,
            lower(new.email),
            department,
            'pelanggan',
            'PENDING',
            false
        )
        returning id into profile_id_value;
    end if;

    insert into public.role_requests (
        auth_user_id,
        profile_id,
        requested_role
    ) values (
        new.id,
        profile_id_value,
        requested_role_text::public.user_role
    );

    return new;
end;
$$;

drop trigger if exists on_auth_user_role_request on auth.users;
create trigger on_auth_user_role_request
after insert on auth.users
for each row execute function public.create_role_request_for_auth_user();

create or replace function public.review_role_request(
    request_id_input uuid,
    decision_input text,
    reviewer_id_input uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    request_row public.role_requests%rowtype;
    reviewer_role public.user_role;
begin
    if decision_input not in ('approve', 'reject') then
        raise exception 'INVALID_DECISION';
    end if;

    select role into reviewer_role
      from public.users
     where id = reviewer_id_input
       and active = true;
    if reviewer_role is distinct from 'owner'::public.user_role then
        raise exception 'ROLE_FORBIDDEN';
    end if;

    select * into request_row
      from public.role_requests
     where id = request_id_input
     for update;
    if not found then
        raise exception 'ROLE_REQUEST_NOT_FOUND';
    end if;
    if request_row.status <> 'PENDING' then
        raise exception 'ROLE_REQUEST_ALREADY_REVIEWED';
    end if;

    if decision_input = 'approve' then
        update public.users
           set role = request_row.requested_role,
               status = 'ACTIVE',
               active = true
         where id = request_row.profile_id;

        update public.role_requests
           set status = 'APPROVED',
               reviewed_by = reviewer_id_input,
               reviewed_at = now()
         where id = request_row.id;
    else
        update public.users
           set status = 'SUSPENDED',
               active = false
         where id = request_row.profile_id;

        update public.role_requests
           set status = 'REJECTED',
               reviewed_by = reviewer_id_input,
               reviewed_at = now()
         where id = request_row.id;
    end if;

    return jsonb_build_object(
        'id', request_row.id,
        'profile_id', request_row.profile_id,
        'requested_role', request_row.requested_role,
        'status', case when decision_input = 'approve' then 'APPROVED' else 'REJECTED' end
    );
end;
$$;

revoke all on function public.review_role_request(uuid, text, uuid)
    from public, anon, authenticated;
grant execute on function public.review_role_request(uuid, text, uuid)
    to service_role;

drop policy if exists "users read own auth profile" on public.users;
create policy "users read own auth profile" on public.users
    for select to authenticated
    using (lower(email) = lower(auth.jwt() ->> 'email'));
grant select on public.users to authenticated;

drop policy if exists "owners read role requests" on public.role_requests;
create policy "owners read role requests" on public.role_requests
    for select to authenticated
    using (
        exists (
            select 1 from public.users
             where lower(email) = lower(auth.jwt() ->> 'email')
               and active = true
               and role = 'owner'
        )
    );
grant select on public.role_requests to authenticated;

do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
       and not exists (
           select 1 from pg_publication_tables
            where pubname = 'supabase_realtime'
              and schemaname = 'public'
              and tablename = 'role_requests'
       ) then
        alter publication supabase_realtime add table public.role_requests;
    end if;
end;
$$;
