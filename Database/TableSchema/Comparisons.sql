create table public."Comparisons" (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  aid bigint not null,
  status text not null default 'pending'::text,
  error_message text null,
  students_compared uuid[] null,
  constraint Comparisons_aid_fkey foreign KEY (aid) references "Assignments" (id)
) TABLESPACE pg_default;