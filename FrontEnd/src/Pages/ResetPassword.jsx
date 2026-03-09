import supabase from "../utils/DatabaseInteractions/supabase";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [canReset, setCanReset] = useState(false);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);
    const [checkedPage, setCheckedPage] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash || "";
        const query = window.location.search || "";
        const fromRecoveryLink = hash.includes("type=recovery") || query.includes("type=recovery");
        if (fromRecoveryLink) {
            setIsRecoveryMode(true);
        }

        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setCanReset(Boolean(data?.session));
            setCheckedPage(true);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsRecoveryMode(true);
            }
            setCanReset(Boolean(session));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitted(true);
        setSuccess(false);
        if (password.trim() === "") {
            setError("Please enter a password.");
            setSubmitted(false);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        setSubmitted(false);

        if (updateError) {
            setError(updateError.message || "There was an error updating your password.");
            return;
        }

        await supabase.auth.signOut({ scope: "global" });
        window.history.replaceState({}, "", "/login");
        setSuccess(true);
        
    };

  if (checkedPage && !isRecoveryMode) {
      return (
          <main className='outer-container'>
              <div className='box-wrapper'>
                  <h1 className="h1-default">Reset Password</h1>
                  <p className="error">Open the password reset link from your email first.</p>
              </div>
          </main>
      );
  }

  return (
    <main className='outer-container'>
      <div className='box-wrapper'>
        <h1 className="h1-default">Reset Password</h1>
        {!checkedPage ? (
            <p className="error">Checking reset session…</p>
        ) : null}

        
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">Password updated. You may now close this window.</p> : 
            <form className="form-default " onSubmit={handleSubmit}>
                <label className="label-default">
                New Password
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="account-form-default"
                />
                </label>
                {!canReset && (
                    <p className="error">Open the password reset link from your email first.</p>
                )}
                <button
                type="submit"
                disabled={submitted || !password || !canReset}
                className="submit-button"
                >
                {submitted ? "Resetting password…" : "Reset Password"}
                </button>
            </form>
        }
      </div>
    </main>
  )
}

export default ResetPassword
