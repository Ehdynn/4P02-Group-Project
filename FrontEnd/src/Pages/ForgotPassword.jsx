import React from 'react'
import { useState } from "react";
const ForgotPassword = () => {
 const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("placeholder")
    setSubmitted(true);
 }
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [submitted, setSubmitted] = useState(false);
  return (
    <>
    <h1 className="h1-default">Forgot Password</h1>
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
        <button
          type="submit"
          disabled={loading || !email.trim() || submitted}
          className="submit-button"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
        {error ? <p className="error">{error}</p> : null}
        
      </form>
      {submitted && (
        <p style={{ color: "red" }}>
          An Email has been sent to you to reset your password.
        </p>
      )}
    </>
  )
}

export default ForgotPassword