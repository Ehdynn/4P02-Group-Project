create policy "Instructors_Can_See_Their_Assignments"
on "public"."Assignments"
as PERMISSIVE
for SELECT
to authenticated
using (
  (EXISTS ( SELECT 1
   FROM "Courses" e
  WHERE ((e.primary_instructor = auth.uid()) AND (e.cid = "Assignments".course))))
);