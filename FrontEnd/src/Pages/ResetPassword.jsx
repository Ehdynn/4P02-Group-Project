import supabase from "../utils/DatabaseInteractions/supabase";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [canReset, setCanReset] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setCanReset(Boolean(data?.session));
        };

        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
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

        setSuccess(true);
        navigate("/login");
    };

  return (
    <main className='outer-container'>
      <div className='box-wrapper'>
        <h1 className="h1-default">Reset Password</h1>

        <form className="form-default " onSubmit={handleSubmit}>
            <label className="label-default"type="email">
            New Password
            <input
                type="password"
                name="user_email"
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
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">Password updated. Redirecting to sign in.</p> : null}
      </div>
    </main>
  )
}

export default ResetPassword