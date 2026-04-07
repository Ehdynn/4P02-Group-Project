create  function public.create_file_submission(
  p_submission_id uuid,
  p_assignment_id bigint,
  p_student_name text,
  p_student_number text,
  p_student_identity_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_submission_id uuid;
begin
  if p_submission_id is null then
    raise exception 'Missing submission id.'
      using errcode = 'P0001';
  end if;

  if p_assignment_id is null then
    raise exception 'Missing assignment id.'
      using errcode = 'P0001';
  end if;

  if nullif(btrim(coalesce(p_student_name, '')), '') is null then
    raise exception 'Missing student name.'
      using errcode = 'P0001';
  end if;

  if nullif(btrim(coalesce(p_student_number, '')), '') is null then
    raise exception 'Missing student number.'
      using errcode = 'P0001';
  end if;

  if nullif(btrim(coalesce(p_student_identity_key, '')), '') is null then
    raise exception 'Missing student identity key.'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public."Assignments" a
    where a.id = p_assignment_id
      and a.due_date >= now()
  ) then
    raise exception 'Assignment not found or due date has passed.'
      using errcode = '42501';
  end if;

  insert into public."File_Submissions_New" (
    id,
    assignment_id,
    student_info,
    student_identity_key
  )
  values (
    p_submission_id,
    p_assignment_id,
    jsonb_build_object(
      'student_name', btrim(p_student_name),
      'student_number', btrim(p_student_number)
    ),
    btrim(p_student_identity_key)
  )
  returning id into v_submission_id;

  return v_submission_id;
end;
$function$;
