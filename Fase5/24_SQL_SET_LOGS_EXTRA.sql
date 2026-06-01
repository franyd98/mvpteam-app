-- ============================================================
-- 24_SQL_SET_LOGS_EXTRA.sql
-- Añade campos para registrar R&P última serie y Drop Set
-- en la tabla set_logs.
-- ============================================================

-- R&P Última Serie: reps extra tras el descanso corto
alter table set_logs add column if not exists rp_reps integer default null;

-- Drop Set: peso reducido y reps del drop
alter table set_logs add column if not exists drop_weight numeric(6,2) default null;
alter table set_logs add column if not exists drop_reps integer default null;
