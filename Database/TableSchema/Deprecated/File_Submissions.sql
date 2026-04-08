create table public."File_Submissions" (
  id uuid not null default gen_random_uuid (),
  assignment_id bigint null,
  created_at timestamp with time zone not null default now(),
  suid uuid null,
  file_name text not null,
  constraint File_Submissions_pkey primary key (id),
  constraint File_Submissions_assignment_id_fkey foreign KEY (assignment_id) references "Assignments" (id) on update CASCADE on delete CASCADE,
  constraint File_Submissions_suid_fkey foreign KEY (suid) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;