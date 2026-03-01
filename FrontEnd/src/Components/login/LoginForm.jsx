import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../context/useUser";
import supabase from "../../utils/supabase";

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const onForgot = () => {
    // Placeholder for forgot-password flow.
    console.log("Forgot password clicked");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Unable to sign in");
      return;
    }

    setUser(data?.user ?? null);
    navigate("/");
  };

  return (
    <div className="w-full max-w-md justify-self-center overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-center border-b border-slate-100 px-6 py-4">
        <p className="text-body-strong">Sign in</p>
      </div>

      <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
        <label className="space-y-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Password
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pr-12 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 hover:text-slate-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-sky-200"
            />
            Remember me
          </label>
          <button type="button" className="font-semibold text-slate-700 underline-offset-4 hover:underline">
            Forgot?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

      </form>

      <div className="border-t border-slate-100 px-6 py-4 text-center text-body-muted">
        Need a hand?{" "}
        <button onClick={onForgot} className="font-semibold text-slate-800 underline-offset-4 hover:underline">
          Restore access
        </button>
      </div>
    </div>
  );
}
