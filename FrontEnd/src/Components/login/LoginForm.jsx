import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/DatabaseInteractions/supabase";

export default function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const onForgot = () => {
    navigate("/ForgotPassword")
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

    navigate("/Overview");
  };

  return (
    <>
      <h1 className="h1-default">Sign In</h1>

      <form className="form-default " onSubmit={handleSubmit}>
        <label className="label-default">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="account-form-default"
          />
        </label>

        <label className="label-default">
          Password
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="account-form-default"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="show-hide"
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
          <button type="button" onClick={onForgot} className="text-button">Forgot?</button>
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          className="submit-button"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
        {error ? <p className="error">{error}</p> : null}

      </form>

      <div className="py-3">
        Need a hand?{" "}
        <button 
        onClick={onForgot} className="text-button">
          Restore access
        </button>
      </div>
    </>
  );
}
