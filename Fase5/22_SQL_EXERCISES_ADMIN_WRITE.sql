-- ============================================================
-- 22_SQL_EXERCISES_ADMIN_WRITE.sql
-- Permite al admin (role = 'admin' en profiles) crear,
-- editar y borrar ejercicios del catálogo.
-- ============================================================

create policy "Admin inserta ejercicios"
  on exercises for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admin actualiza ejercicios"
  on exercises for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admin borra ejercicios"
  on exercises for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
