import { useEffect, useMemo, useState } from "react";
import UserContext from "./UserContext";
import supabase from "../utils/supabase";

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setUser(data.session?.user ?? null);
        setAuthReady(true);
      }
    };

    hydrateUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, setUser, authReady }), [user, authReady]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
