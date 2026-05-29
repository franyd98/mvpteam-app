-- Asocia cada programa a un cliente propietario (nullable = plantilla global).
-- Los programas existentes quedan con owner_client_id = NULL (sección Plantillas).

alter table programs
  add column if not exists owner_client_id uuid references profiles(id) on delete set null;

-- Índice para la consulta por cliente
create index if not exists idx_programs_owner on programs(owner_client_id);
