create or replace function public.remove_student_from_course(p_sid p_cid, p_uid)
returns jsonb
language plpgsql
security definer
as $function$
declare
  v_suid uuid;
begin
  if not exists (
    select 1
    from public."Courses" c
    where c.cid = p_cid
      and c.primary_instructor = p_uid
  ) then
    raise exception 'Unauthorized: you are not the primary instructor for this course.'
      using errcode = '42501';
  end if;

  select a.id
    into v_suid
  from public."Accounts" a
  where a.sid = p_sid;

  if v_suid is null then
    raise exception 'Student with that sid does not exist.'
      using errcode = 'P0001';
  end if;

  -- delete enrollment
  delete from public."Enrolled" e
  where e.cid = p_cid
    and e.suid = v_suid;

  if not found then
    raise exception 'Student is not enrolled in this course.'
      using errcode = 'P0001';
  end if;

  return;
end;