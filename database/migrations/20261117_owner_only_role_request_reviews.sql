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
    if reviewer_role is distinct from 'owner' then
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
        if not exists (
            select 1 from auth.users
             where id = request_row.auth_user_id
               and email_confirmed_at is not null
        ) then
            raise exception 'EMAIL_NOT_CONFIRMED';
        end if;
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
