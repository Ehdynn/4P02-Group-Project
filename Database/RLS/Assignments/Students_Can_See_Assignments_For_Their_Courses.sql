create policy "Instructors_Can_See_Their_Assignments"
on "public"."Assignments"
as PERMISSIVE
for SELECT
to authenticated
using (
  (EXISTS ( SELECT 1
   FROM "Enrolled" e
  WHERE ((e.suid = auth.uid()) AND (e.cid = "Assignments".course))))
);