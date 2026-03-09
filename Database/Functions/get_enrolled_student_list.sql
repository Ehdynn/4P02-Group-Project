create or replace function public.get_enrolled_list(p_cid uuid)
returns jsonb
language plpgsql
security definer
as $function$
begin
  if not exists (
    select 1
    from public."Courses" c
    where c.cid = p_cid
      and c.primary_instructor = auth.uid()
  ) then
    raise exception 'Unauthorized: you are not the primary instructor for this course.'
      using errcode = '42501';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'suid',
          enrolled.suid,
          'student_name',
          coalesce(
            nullif(btrim(auth_user.raw_user_meta_data->>'full_name'), ''),
            'Unknown Student'
          ),
          'student_number',
          account.sid::text
        )
      )
      from (
        select distinct e.suid
        from public."Enrolled" e
        where e.cid = p_cid
      ) enrolled
      left join public."Accounts" account
        on account.id = enrolled.suid
      left join auth.users auth_user
        on auth_user.id::text = enrolled.suid::text
    ),
    '[]'::jsonb
  );
end;