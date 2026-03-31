create policy "Instructors_Can_Select"
on "public"."Repositories"
as PERMISSIVE
for SELECT
to authenticated
using (
  exists (
    select 1
    from public."Assignments" a
    join public."Courses" c
      on c.cid = a.course
    where a.id = "Repositories".aid
      and c.primary_instructor = auth.uid()
  )
);
