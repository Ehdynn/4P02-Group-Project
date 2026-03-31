create table public."Repositories" (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  repository_name text not null,
  aid bigint not null,
  constraint Repository_pkey primary key (id),
  constraint Repository_aid_fkey foreign KEY (aid) references "Assignments" (id)
) TABLESPACE pg_default;