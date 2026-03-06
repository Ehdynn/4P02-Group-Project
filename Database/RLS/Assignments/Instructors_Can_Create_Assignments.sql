create policy "Instructors_Can_Create_Assignments"
on "public"."Assignments"
as PERMISSIVE
for INSERT
to authenticated
with check (
  (EXISTS ( SELECT 1
   FROM "Courses" c
  WHERE ((c.cid = "Assignments".course) AND (c.primary_instructor = auth.uid()))))
);