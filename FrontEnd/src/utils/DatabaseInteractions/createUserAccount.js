import supabase from "./supabase";

const trimValue = (value) => String(value ?? "").trim();

export const createUserAccount = async ({ email, password }) => {
  return await supabase.auth.signUp({
    email: trimValue(email),
    password,
  });
};

export const setDisplayNameForUser = async ({ displayName }) => {
  if (!displayName) {
    return { data: null, error: null };
  }

  const normalizedDisplayName = trimValue(displayName);

  const { data: sessionData } = await supabase.auth.getUser();
  const userId = sessionData?.user?.id;

  if (userId) {
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          display_name: normalizedDisplayName,
        },
        { onConflict: "id" }
      );

    if (!profileError) {
      return { data: profileData, error: null };
    }
  }

  const { data, error } = await supabase.auth.updateUser({
    data: { display_name: normalizedDisplayName },
  });

  return { data, error };
};
