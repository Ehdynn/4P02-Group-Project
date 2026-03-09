import { useState } from "react";
import supabase from '../utils/DatabaseInteractions/supabase';
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitted(true);
        setSuccess(false);
        if(email === ""){setError("Please enter the email."); setSubmitted(false); return;}
        const {error } = await supabase.auth
            .resetPasswordForEmail(email, {redirectTo: `${window.location.origin}/ResetPassword`})
        if(error){setError(`Failed to send email: ${error}`)}
        setSubmitted(false);
        setSuccess(true);
    }
 
  return (

    <main className='outer-container'>
      <div className='box-wrapper'>
        <h1 className="h1-default">Forgot Password</h1>

        <form className="form-default " onSubmit={handleSubmit}>
            <label className="label-default"type="email">
            Email
            <input
                type="email"
                name="user_email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="account-form-default"
            />
            </label>
            <button
            type="submit"
            disabled={submitted || !email.trim()}
            className="submit-button"
            >
            {submitted ? "Sending Email…" : "Send Reset Request"}
            </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        {success ? <><p className="success">Email sent!</p><button className="submit-button" onClick={() => {navigate("/login")}}>Sign in</button></>: null}
      </div>
    </main>
  )
}

export default ForgotPassword