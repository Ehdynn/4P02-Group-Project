create policy "Students_Can_Insert_Own"
on "public"."File_Submissions"
as PERMISSIVE
for INSERT
to authenticated
using (
  (auth.uid() = suid)
);