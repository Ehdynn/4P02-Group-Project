create table public."Boiler_Plate_Uploads" (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  aid bigint not null,
  constraint Boiler_Plate_Uploads_pkey primary key (id),
  constraint Boiler_Plate_Uploads_aid_fkey foreign KEY (aid) references "Assignments" (id)
) TABLESPACE pg_default;