-- Semua akses data aplikasi melewati Route Handler server yang memakai
-- SUPABASE_SERVICE_ROLE_KEY. Tutup akses langsung anon/authenticated agar
-- tabel tidak dapat dibaca atau diubah dengan anon key.
do $$
declare
    table_name text;
begin
    foreach table_name in array array[
        'users',
        'products',
        'product_variants',
        'orders',
        'order_lines',
        'order_status_events',
        'custom_requests',
        'gudang_items',
        'gudang_movements',
        'gudang_orders',
        'project_orders',
        'project_order_items',
        'kas_entries',
        'penagihan',
        'marketing_banners',
        'portfolio_items',
        'case_studies',
        'partners',
        'faq_items',
        'custom_services',
        'site_content',
        'pm_orders',
        'pm_order_items',
        'field_deliveries',
        'field_delivery_items',
        'finance_dashboard',
        'contact_messages'
    ] loop
        if to_regclass(format('public.%I', table_name)) is not null then
            execute format(
                'alter table public.%I enable row level security',
                table_name
            );
        end if;
    end loop;
end;
$$;
