import { useEffect, useMemo, useState } from "react";
import useUser from "../context/useUser";
import { isProfessorAccount } from "../utils/api";

const Landing = () => {
  const { user, authReady } = useUser();
  const [isProfessor, setIsProfessor] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => {
    if (!user) return null;
    if (typeof user === "string") return user;
    return user.id ?? user.user_id ?? null;
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      if (!authReady || !userId) {
        if (isMounted) {
          setIsProfessor(null);
          setRoleLoading(false);
          setError("");
        }
        return;
      }

      try {
        if (isMounted) {
          setRoleLoading(true);
          setError("");
        }
        const result = await isProfessorAccount(userId);
        if (isMounted) {
          setIsProfessor(result);
          setError("");
        }
      } catch (roleError) {
        if (isMounted) {
          setError(roleError?.message || "Unable to load account role");
          setIsProfessor(null);
        }
      } finally {
        if (isMounted) {
          setRoleLoading(false);
        }
      }
    };

    loadRole();

    return () => {
      isMounted = false;
    };
  }, [authReady, userId]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Landing</h1>
      {!authReady ? <p className="mt-3 text-slate-600">Checking session...</p> : null}
      {authReady && !user ? <p className="mt-3 text-slate-600">You are not signed in.</p> : null}
      {authReady && user && roleLoading ? <p className="mt-3 text-slate-600">Loading account type...</p> : null}
      {authReady && user && !roleLoading && !error && typeof isProfessor === "boolean" ? (
        <p className="mt-3 text-slate-700">
          Account type: <span className="font-semibold">{isProfessor ? "Instructor" : "Student"}</span>
        </p>
      ) : null}
      {error ? <p className="mt-3 text-red-600">{error}</p> : null}
    </main>
  );
};

export default Landing;
