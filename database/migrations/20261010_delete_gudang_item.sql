create or replace function delete_gudang_item_if_unused(item_id_input text)
returns boolean
language plpgsql
as $$
begin
    delete from gudang_items where id = item_id_input;
    if found then return true; end if;
    return false;
exception when foreign_key_violation then
    raise exception 'ITEM_IN_USE';
end;
$$;
