-- Trigger para criar perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.sellers (id, name, whatsapp, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário Novo'),
    coalesce(new.raw_user_meta_data->>'whatsapp', ''),
    false
  );
  return new;
end;
$$;

-- Remover se já existir para evitar erro
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
