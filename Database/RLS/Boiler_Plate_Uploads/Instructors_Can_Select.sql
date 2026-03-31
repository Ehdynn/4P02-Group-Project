create policy "Instructors_Can_Select"
on "public"."Boiler_Plate_Uploads"
as PERMISSIVE
for SELECT
to authenticated
using (
  exists (
    select 1
    from public."Assignments" a
    join public."Courses" c
      on c.cid = a.course
    where a.id = "Boiler_Plate_Uploads".aid
      and c.primary_instructor = auth.uid()
  )
);
