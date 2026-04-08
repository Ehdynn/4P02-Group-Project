create table public."File_Submissions_New" (
  id uuid not null default gen_random_uuid (),
  assignment_id bigint null,
  created_at timestamp with time zone not null default now(),
  student_info jsonb null,
  student_identity_key text not null,
  repository_id uuid null,
  constraint File_Submissions_New_pkey primary key (id),
  constraint File_Submissions_New_assignment_id_fkey foreign KEY (assignment_id) references "Assignments" (id) on update CASCADE on delete CASCADE,
  constraint File_Submissions_New_repository_id_fkey foreign KEY (repository_id) references "Repositories" (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;