create table public."Enrolled" (
  suid uuid not null,
  cid bigint not null,
  constraint Enrolled_pkey primary key (suid, cid),
  constraint Enrolled_cid_fkey foreign KEY (cid) references "Courses" (cid) on update CASCADE on delete CASCADE,
  constraint Enrolled_sid_fkey foreign KEY (suid) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;