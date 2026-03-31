create policy "Instructors_Can_Insert"
on "public"."Boiler_Plate_Uploads"
as PERMISSIVE
for INSERT
to authenticated
with check (
  exists (
    select 1
    from public."Assignments" a
    join public."Courses" c
      on c.cid = a.course
    where a.id = aid
      and c.primary_instructor = auth.uid()
  )
);
