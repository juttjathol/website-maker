-- Enforce Pro at the storage boundary as well as in the editor.
-- Downgrades keep existing scenes, but cannot add or change them. Removing
-- scenes and editing the rest of the website remain possible on Free.
create or replace function public.webloom_scene_blocks(p_data jsonb)
returns setof jsonb
language sql
immutable
set search_path = ''
as $$
  with recursive blocks(block) as (
    select b.value
      from pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(p_data -> 'pages') = 'array'
          then p_data -> 'pages' else '[]'::jsonb end
      ) p
      cross join lateral pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(p.value -> 'blocks') = 'array'
          then p.value -> 'blocks' else '[]'::jsonb end
      ) b
    union all
    select c.value
      from blocks b
      cross join lateral pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(b.block -> 'children') = 'array'
          then b.block -> 'children' else '[]'::jsonb end
      ) c
  )
  select block from blocks where block ->> 'type' = 'scene3d';
$$;

revoke all on function public.webloom_scene_blocks(jsonb) from public, anon, authenticated;

create or replace function public.enforce_webloom_pro_scenes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_data jsonb := '{}'::jsonb;
begin
  if exists (select 1 from public.profiles where id = new.user_id and plan = 'pro') then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.user_id = old.user_id then
    previous_data := old.data;
  end if;

  -- EXCEPT ALL also checks multiplicity: duplicating a saved scene is an addition.
  if exists (
    select * from public.webloom_scene_blocks(new.data)
    except all
    select * from public.webloom_scene_blocks(previous_data)
  ) then
    raise exception '3D scenes require Webloom Pro. Existing scenes are preserved; remove them or request Pro to continue.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_webloom_pro_scenes() from public, anon, authenticated;
drop trigger if exists enforce_webloom_pro_scenes on public.projects;
create trigger enforce_webloom_pro_scenes
before insert or update of data, user_id on public.projects
for each row execute function public.enforce_webloom_pro_scenes();
