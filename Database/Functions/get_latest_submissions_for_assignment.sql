create or replace function public.get_latest_submissions_for_assignment(p_aid bigint)
returns table(
  submission_id uuid,
  assignment_id bigint,
  suid uuid,
  student_name text,
  student_number text,
  file_name text,
  storage_path text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $function$
begin
  if not exists (
    select 1
    from public."Assignments" a
    join public."Courses" c
      on c.cid = a.course
    where a.id = p_aid
      and c.primary_instructor = auth.uid()
  ) then
    raise exception 'Assignment not found or unauthorized.'
      using errcode = '42501';
  end if;

  return query
  with ranked_submissions as (
    select
      fs.id,
      fs.assignment_id,
      fs.suid,
      fs.file_name,
      fs.created_at,
      row_number() over (
        partition by fs.suid
        order by fs.created_at desc, fs.id desc
      ) as rn
    from public."File_Submissions" fs
    where fs.assignment_id = p_aid
  )
  select
    ranked_submissions.id as submission_id,
    ranked_submissions.assignment_id,
    ranked_submissions.suid,
    coalesce(
      nullif(btrim(au.raw_user_meta_data->>'full_name'), ''),
      'Unknown Student'
    ) as student_name,
    a.sid::text as student_number,
    ranked_submissions.file_name,
    concat_ws('/', ranked_submissions.suid::text, ranked_submissions.id::text, ranked_submissions.file_name) as storage_path,
    ranked_submissions.created_at
  from ranked_submissions
  left join public."Accounts" a
    on a.id = ranked_submissions.suid
  left join auth.users au
    on au.id::text = ranked_submissions.suid::text
  where ranked_submissions.rn = 1
  order by ranked_submissions.created_at desc;
end;
$function$;
