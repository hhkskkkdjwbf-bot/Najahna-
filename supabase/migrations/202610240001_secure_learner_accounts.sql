-- Apply in Supabase SQL Editor or with Supabase CLI migrations.
-- The client may read/write only the authenticated user's own learner data.
create table if not exists public.learner_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint learner_data_payload_is_array check (jsonb_typeof(data) = 'array'),
  constraint learner_data_payload_size check (pg_column_size(data) <= 5242880)
);

alter table public.learner_data enable row level security;
revoke all on table public.learner_data from anon;
grant select, insert, update, delete on table public.learner_data to authenticated;

drop policy if exists "Learners can read only their own data" on public.learner_data;
create policy "Learners can read only their own data"
  on public.learner_data for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners can insert only their own data" on public.learner_data;
create policy "Learners can insert only their own data"
  on public.learner_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners can update only their own data" on public.learner_data;
create policy "Learners can update only their own data"
  on public.learner_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners can delete only their own data" on public.learner_data;
create policy "Learners can delete only their own data"
  on public.learner_data for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists learner_data_updated_at_idx on public.learner_data (updated_at desc);
