create policy "Students_Can_Insert_Own"
on "public"."File_Submissions"
as PERMISSIVE
for INSERT
to authenticated
with check (
  auth.uid() = suid
  AND EXISTS ( 
    SELECT 1
    FROM "Assignments" a
    WHERE a.id = assignment_id 
      AND a.due_date >= now()
  )
);