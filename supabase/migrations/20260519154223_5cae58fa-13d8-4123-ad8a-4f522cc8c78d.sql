
-- Fix function search path
create or replace function public.touch_updated_at()
returns trigger language plpgsql
security invoker
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

-- Restrict execute on has_role to only authenticated
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- Tighten bucket: drop broad listing, allow only viewing specific objects via signed URLs / public URL still works
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] is not null);
