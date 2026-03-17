import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserAccount,
  setDisplayNameForUser,
} from "../../utils/DatabaseInteractions/createUserAccount";

export default function SignUpForm() {
  const navigate = useNavigate();
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
      const { data, error } = await createUserAccount({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message || "Unable to create account");
        return;
      }

      if (!data?.user) {
        setError("Account creation did not complete.");
        return;
      }

      if (data.session) {
        if (fullName.trim()) {
          const { error: profileError } = await setDisplayNameForUser({
            displayName: fullName.trim(),
          });

          if (profileError) {
            setError(
              "Account created, but saving your display name failed."
            );
          }
        }

        navigate("/Overview");
        return;
      }

      setError("Please check your email to confirm your account before signing in.");
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
            placeholder="John Doe"
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
            placeholder="you@email.com"
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
            disabled={
              loading ||
              !fullName.trim() ||
              !email.trim() ||
              !password.trim()
            }
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
