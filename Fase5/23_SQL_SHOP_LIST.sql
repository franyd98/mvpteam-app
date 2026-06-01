-- ============================================================
-- 23_SQL_SHOP_LIST.sql
-- Tabla para persistir la lista de la compra por cliente
-- (reemplaza el localStorage que no sincroniza entre dispositivos)
-- ============================================================

create table if not exists shop_list_items (
  id          bigserial primary key,
  client_id   uuid not null references profiles(id) on delete cascade,
  item_key    text not null,          -- id único del ingrediente
  name        text not null,
  category    text not null default '',
  checked     boolean not null default false,
  created_at  timestamptz not null default now(),
  unique(client_id, item_key)
);

alter table shop_list_items enable row level security;

-- El cliente solo ve y gestiona sus propios items
create policy "Cliente gestiona su lista de la compra"
  on shop_list_items for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- El admin puede ver la lista de cualquier cliente
create policy "Admin lee listas de la compra"
  on shop_list_items for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
