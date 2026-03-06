create policy "Students_Can_See_Their_Course_Details"
on "public"."Courses"
as PERMISSIVE
for SELECT
to authenticated
using (
  (EXISTS ( SELECT 1
   FROM "Enrolled" e
  WHERE ((e.cid = "Courses".cid) AND (e.suid = auth.uid()))))
);