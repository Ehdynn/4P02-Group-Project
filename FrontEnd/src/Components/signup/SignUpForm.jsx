import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../context/useUser";
import supabase from "../../utils/DatabaseInteractions/supabase";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("createUserAccount", {
        body: {
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          is_prof: false,
          student_number: undefined,
        },
      });

      if (invokeError) {
        let errorMessage = invokeError.message || "Unable to create account";
        if (invokeError.context) {
          try {
            const payload = await invokeError.context.json();
            errorMessage = payload?.error || errorMessage;
          } catch {
            // Keep default message if response body isn't JSON.
          }
        }
        setError(errorMessage);
        return;
      }

      const { data: user, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });


      if (signInError) {
        setError(signInError.message || "Unable to sign in");
        return;
      }

      setUser(user?.user?? null);
      navigate("/Overview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="h1-default">Instructor Sign Up</h1>

      <form
        className="form-default"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit();
        }}
      >

        <label className="label-default">
          Full name
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Juno Park"
            required
            className="account-form-default"
          />
        </label>

        <label className="label-default">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@studio.com"
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

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading || !fullName.trim() || !email.trim() || !password.trim()}
            className="submit-button"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </>
  );
}
