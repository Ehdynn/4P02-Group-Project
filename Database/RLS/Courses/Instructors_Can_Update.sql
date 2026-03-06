create policy "Instructors_Can_Update"
on "public"."Courses"
as PERMISSIVE
for UPDATE
to authenticated
using (
  primary_instructor = auth.uid()
) with check (
  primary_instructor = auth.uid()
);
