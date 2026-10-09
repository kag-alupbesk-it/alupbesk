-- Pendaftaran: role & dept di public.users mengikuti pilihan formulir,
-- bukan nilai default 'pelanggan'. Aman dijalankan berulang.

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
    requested_role_text := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'requested_role'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'role'), '')
    );
    if requested_role_text is null then
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
    department := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'dept'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'department'), '')
    );

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
            new.id, display_name, lower(new.email), department,
            requested_role_text::public.user_role, 'PENDING', false
        )
        returning id into profile_id_value;
    else
        update public.users
           set name = display_name,
               dept = department,
               role = requested_role_text::public.user_role,
               status = 'PENDING',
               active = false
         where id = profile_id_value;
    end if;

    if to_regclass('public.role_requests') is not null then
        delete from public.role_requests
         where profile_id = profile_id_value
           and status = 'PENDING';

        insert into public.role_requests (auth_user_id, profile_id, requested_role)
        values (new.id, profile_id_value, requested_role_text::public.user_role)
        on conflict do nothing;
    end if;
    return new;
end;
$$;

drop trigger if exists on_auth_user_role_request on auth.users;
create trigger on_auth_user_role_request
after insert on auth.users
for each row execute function public.create_role_request_for_auth_user();
