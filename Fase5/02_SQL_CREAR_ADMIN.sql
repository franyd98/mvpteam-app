-- Ejecuta esto DESPUÉS de crear tu cuenta en Supabase Auth
-- Cambia el email si es necesario

update profiles
set role = 'admin', full_name = 'Fran'
where id = (
  select id from auth.users where email = 'franyd98@gmail.com'
);
