create policy "Students_Can_See_Their_Enrollment"
on "public"."Enrolled"
as PERMISSIVE
for SELECT
to authenticated
using (
  (( SELECT auth.uid() AS uid) = suid)
);