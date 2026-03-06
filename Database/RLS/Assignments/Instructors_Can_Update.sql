create policy "Instructors_Can_Update"
on "public"."Assignments"
as PERMISSIVE
for UPDATE
to authenticated
using (
  (EXISTS ( SELECT 1
   FROM "Courses" c
  WHERE ((c.cid = "Assignments".course) 
    AND (c.primary_instructor = auth.uid()))))
) with check (
  EXISTS ( 
    SELECT 1
    FROM "Courses" c
    WHERE ((c.cid = "Assignments".course) 
      AND (c.primary_instructor = auth.uid())))
);
