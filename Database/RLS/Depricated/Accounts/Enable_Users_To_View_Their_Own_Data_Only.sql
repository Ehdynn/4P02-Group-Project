create policy "Enable_Users_To_View_Their_Own_Data_Only"
on "public"."Accounts"
as PERMISSIVE
for SELECT
to authenticated
using (
  (( SELECT auth.uid() AS uid) = id)
);