import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../context/useUser";
import supabase from "../../utils/supabase";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentNumber, setStudentNumber] = useState("");
  const isProfessor = accountType === "prof";

  const onSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("createUserAccount", {
        body: {
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          is_prof: isProfessor,
          student_number: isProfessor ? undefined : studentNumber.trim(),
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

      setUser(data?.user_id ?? null);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-center border-b border-slate-100 px-6 py-4">
        <p className="text-body-strong">Create your account</p>
      </div>

      <form
        className="space-y-8 px-6 py-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit();
        }}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Account type</p>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAccountType("student");
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                accountType === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType("prof");
                setStudentNumber("");
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                accountType === "prof" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Instructor
            </button>
          </div>
        </div>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Full name
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Juno Park"
            required
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </label>
        {!isProfessor ? (
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Student Number
            <input
              type="text"
              value={studentNumber}
              onChange={(event) => setStudentNumber(event.target.value.replace(/\D/g, ""))}
              placeholder="1010101"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
        ) : null}

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@studio.com"
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pr-12 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 hover:text-slate-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading || !fullName.trim() || !email.trim() || !password.trim() || (!isProfessor && !studentNumber.trim())}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
