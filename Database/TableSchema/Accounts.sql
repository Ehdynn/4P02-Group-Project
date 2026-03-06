create table public."Accounts" (
  id uuid not null,
  is_prof boolean not null,
  sid text null,
  constraint accounts_pkey primary key (id),
  constraint accounts_sid_key unique (sid),
  constraint accounts_id_fkey foreign KEY (id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;