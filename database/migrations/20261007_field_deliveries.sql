alter table pm_orders add column if not exists contractor_phone text;
alter table pm_orders add column if not exists project_address text;

create table if not exists field_deliveries (
    id text primary key,
    pm_order_id text not null unique references pm_orders(id) on delete cascade,
    contractor_name text not null,
    contractor_code text not null,
    project_address text not null default '',
    phone text,
    status text not null default 'siap-kirim' check (status in ('siap-kirim','dalam-pengiriman','selesai-kirim')),
    driver_name text,
    plate_number text,
    vehicle_type text,
    shipped_at timestamptz,
    signature_image_url text,
    project_image_url text,
    print_count integer not null default 0 check (print_count >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists field_delivery_items (
    id text primary key,
    delivery_id text not null references field_deliveries(id) on delete cascade,
    name text not null,
    category text not null default 'Material',
    specification text not null default '',
    unit text not null,
    quantity integer not null check (quantity > 0),
    quantity_shipped integer not null default 0 check (quantity_shipped >= 0 and quantity_shipped <= quantity),
    sort_order integer not null default 0
);

alter table field_deliveries enable row level security;
alter table field_delivery_items enable row level security;
create index if not exists idx_field_deliveries_status on field_deliveries(status, updated_at desc);
create index if not exists idx_field_delivery_items_delivery on field_delivery_items(delivery_id, sort_order);

create or replace function field_submit_shipment(
    delivery_id_input text,
    shipment_items jsonb,
    driver_name_input text,
    plate_number_input text,
    vehicle_type_input text,
    shipped_at_input timestamptz
) returns void language plpgsql as $$
declare
    current_status text;
    shipment_count integer;
    distinct_count integer;
    invalid_count integer;
begin
    select status into current_status
    from field_deliveries where id = delivery_id_input for update;
    if current_status is null or current_status = 'selesai-kirim' then
        raise exception 'STATUS_INVALID';
    end if;

    select count(*), count(distinct item_id)
      into shipment_count, distinct_count
      from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer);
    if shipment_count = 0 or shipment_count <> distinct_count then
        raise exception 'INVALID_INPUT';
    end if;

    select count(*) into invalid_count
    from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
    left join field_delivery_items i on i.id = x.item_id and i.delivery_id = delivery_id_input
    where i.id is null or x.quantity < 0 or x.quantity > i.quantity - i.quantity_shipped;
    if invalid_count > 0 then raise exception 'QUANTITY_EXCEEDED'; end if;

    if not exists (
        select 1 from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
        where x.quantity > 0
    ) then raise exception 'INVALID_INPUT'; end if;

    update field_delivery_items i
       set quantity_shipped = i.quantity_shipped + x.quantity
      from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
     where i.id = x.item_id and i.delivery_id = delivery_id_input;

    update field_deliveries
       set driver_name = driver_name_input,
           plate_number = plate_number_input,
           vehicle_type = vehicle_type_input,
           status = 'dalam-pengiriman',
           shipped_at = shipped_at_input,
           updated_at = shipped_at_input
     where id = delivery_id_input;
end;
$$;
