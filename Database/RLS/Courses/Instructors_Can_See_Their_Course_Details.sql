create policy "Instructors_Can_See_Their_Course_Details"
on "public"."Courses"
as PERMISSIVE
for SELECT
to authenticated
using (
  (( SELECT auth.uid() AS uid) = primary_instructor)
);