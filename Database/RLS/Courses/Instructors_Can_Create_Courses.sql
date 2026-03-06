create policy "Instructors_Can_Create_Courses"
on "public"."Courses"
as PERMISSIVE
for INSERT
to authenticated
using (
  ((EXISTS ( SELECT 1
   FROM "Accounts" a
  WHERE ((a.id = auth.uid()) AND (a.is_prof = true)))) AND (primary_instructor = auth.uid()))
);