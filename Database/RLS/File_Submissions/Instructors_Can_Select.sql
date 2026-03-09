create policy "Instructors_Can_Select"
on "public"."File_Submissions"
as PERMISSIVE
for SELECT
to authenticated
using (
  (EXISTS (
    SELECT 1
    FROM "Assignments" a
    WHERE ((a.id = "File_Submissions".assignment_id) AND
           (EXISTS (
             SELECT 1
             FROM "Courses" c
             WHERE ((c.cid = a.course) AND (c.primary_instructor = auth.uid()))
           )))
  ))
);
