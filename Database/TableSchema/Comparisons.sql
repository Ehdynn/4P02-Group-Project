create table public."Comparisons" (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  aid bigint not null,
  status text not null default 'pending'::text,
  error_message text null,
  number_of_students integer null,
  boiler_plate_file uuid null,
  repository uuid null,
  submissions_compared uuid[] null,
  constraint Comparisons_pkey primary key (id),
  constraint Comparisons_aid_fkey foreign KEY (aid) references "Assignments" (id),
  constraint Comparisons_boiler_plate_file_fkey foreign KEY (boiler_plate_file) references "Boiler_Plate_Uploads" (id),
  constraint Comparisons_repository_fkey foreign KEY (repository) references "Repositories" (id)
) TABLESPACE pg_default;