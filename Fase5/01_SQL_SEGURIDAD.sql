-- ============================================================
-- Pega esto en Supabase → SQL Editor y dale Run
-- ============================================================

-- Trigger: crea perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Perfiles
create policy "Autenticados leen perfiles" on profiles
  for select using (auth.role() = 'authenticated');
create policy "Trigger puede insertar perfiles" on profiles
  for insert with check (true);
create policy "Usuarios actualizan su propio perfil" on profiles
  for update using (auth.uid() = id);

-- Ejercicios
create policy "Autenticados leen ejercicios" on exercises
  for select using (auth.role() = 'authenticated');

-- Programas
create policy "Autenticados leen programas" on programs
  for select using (auth.role() = 'authenticated');
create policy "Autenticados gestionan programas" on programs
  for all using (auth.role() = 'authenticated');

-- Asignaciones
create policy "Autenticados leen asignaciones" on program_assignments
  for select using (auth.role() = 'authenticated');
create policy "Autenticados gestionan asignaciones" on program_assignments
  for all using (auth.role() = 'authenticated');

-- Días, microciclos, ejercicios de microciclo, series
create policy "Autenticados leen dias" on program_days
  for select using (auth.role() = 'authenticated');
create policy "Autenticados gestionan dias" on program_days
  for all using (auth.role() = 'authenticated');

create policy "Autenticados leen microciclos" on microcycles
  for select using (auth.role() = 'authenticated');
create policy "Autenticados gestionan microciclos" on microcycles
  for all using (auth.role() = 'authenticated');

create policy "Autenticados leen mic ejercicios" on microcycle_exercises
  for select using (auth.role() = 'authenticated');
create policy "Autenticados gestionan mic ejercicios" on microcycle_exercises
  for all using (auth.role() = 'authenticated');

create policy "Autenticados leen series" on exercise_sets
  for select using (auth.role() = 'authenticated');
create policy "Autenticados gestionan series" on exercise_sets
  for all using (auth.role() = 'authenticated');

-- Logs: cada cliente solo ve y gestiona los suyos
create policy "Clientes ven sus logs" on set_logs
  for select using (auth.uid() = client_id);
create policy "Clientes insertan sus logs" on set_logs
  for insert with check (auth.uid() = client_id);
create policy "Clientes actualizan sus logs" on set_logs
  for update using (auth.uid() = client_id);
create policy "Clientes borran sus logs" on set_logs
  for delete using (auth.uid() = client_id);
