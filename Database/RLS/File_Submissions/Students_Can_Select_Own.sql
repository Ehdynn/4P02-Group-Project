create policy "Students_Can_Select_Own"
on "public"."File_Submissions"
as PERMISSIVE
for SELECT
to authenticated
using (
  (( SELECT auth.uid() AS uid) = suid)
);