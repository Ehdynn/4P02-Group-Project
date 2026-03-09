import React from 'react'
import { useState } from "react";
import { useRef } from 'react';
import emailjs, { send } from '@emailjs/browser';
const ForgotPassword = () => {
 const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("placeholder")
    setSubmitted(true);
 }
 const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, form.current, {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      })
      .then(
        () => {
          console.log('SUCCESS!');
          setSubmitted(true);
        },
        (error) => {
          console.log('FAILED...', error.text);
        },
      );
  };
 const form = useRef();
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [submitted, setSubmitted] = useState(false);
  return (
    <>
    <h1 className="h1-default">Forgot Password</h1>
    <form ref={form} className="form-default " onSubmit={sendEmail}>
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