import { useEffect, useMemo, useState } from "react";
import UserContext from "./UserContext";
import supabase from "../utils/DatabaseInteractions/supabase";
import { isProfessorAccount } from "../utils/DatabaseInteractions/isProfessorAccount";

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isProfessor, setIsProfessor] = useState(null);
  const [roleReady, setRoleReady] = useState(false);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("app_user");
      }

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

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      if (!authReady) {
        return;
      }

      if (!user) {
        if (isMounted) {
          setIsProfessor(null);
          setRoleError("");
          setRoleReady(true);
        }
        return;
      }

      const userId = typeof user === "string" ? user : user.id ?? user.user_id ?? null;

      if (!userId) {
        if (isMounted) {
          setIsProfessor(null);
          setRoleError("Logged in but no id found.");
          setRoleReady(true);
        }
        return;
      }

      if (isMounted) {
        setRoleReady(false);
        setRoleError("");
      }

      try {
        const profFlag = await isProfessorAccount(userId);
        if (isMounted) {
          setIsProfessor(profFlag);
          setRoleError("");
        }
      } catch (error) {
        if (isMounted) {
          setIsProfessor(null);
          setRoleError(error?.message || "Unable to load account role");
        }
      } finally {
        if (isMounted) {
          setRoleReady(true);
        }
      }
    };

    loadRole();

    return () => {
      isMounted = false;
    };
  }, [authReady, user]);

  const value = useMemo(
    () => ({ user, setUser, authReady, isProfessor, roleReady, roleError }),
    [user, authReady, isProfessor, roleReady, roleError]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
