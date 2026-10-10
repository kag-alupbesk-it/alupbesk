-- Push subscription Web Push: satu baris per endpoint Push API browser
-- (regenerate saat user menyetujui notifikasi, terhapus bila endpoint 404/410).
create table if not exists push_subscriptions (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references users(id) on delete cascade,
    endpoint    text not null unique,
    auth        text not null,
    p256dh      text not null,
    user_agent  text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user
    on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

drop policy if exists "users manage own push subscriptions" on public.push_subscriptions;
create policy "users manage own push subscriptions" on public.push_subscriptions
    for all to authenticated
    using (
        exists (
            select 1 from public.users
             where lower(email) = lower(auth.jwt() ->> 'email')
               and id = push_subscriptions.user_id
        )
    )
    with check (
        exists (
            select 1 from public.users
             where lower(email) = lower(auth.jwt() ->> 'email')
               and id = push_subscriptions.user_id
        )
    );

revoke all on public.push_subscriptions from public, anon;
grant select, insert, update, delete on public.push_subscriptions to service_role;