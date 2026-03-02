import { useState } from "react";
import supabase from "../../utils/supabase";

const JoinCourse = () => {
  const [formData, setFormData] = useState({
    joinCode: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);


  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { joinCode } = formData;

    if (!joinCode) {
      setError("Please enter a join code.");
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      setError(userError.message || "Unable to validate current user");
      return;
    }

    if (!user) {
      setLoading(false);
      setError("You must be logged in to join a course.");
      return;
    }

    const { error: invokeError } = await supabase.functions.invoke("addStudentToCourse", {
      body: {
        join_code: joinCode.trim(),
      },
    });

    setLoading(false);

    if (invokeError) {
      let errorMessage = invokeError.message || "Unable to join course.";
      if (invokeError.context) {
        try {
          const payload = await invokeError.context.json();
          errorMessage = payload?.error || errorMessage;
        } catch {
          // Keep default message if response is not JSON.
        }
      }
      setError(errorMessage);
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
    setFormData({
      joinCode: "",
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Join Course</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Join Code</span>
          <input
            type="text"
            name="joinCode"
            value={formData.joinCode}
            onChange={onChange}
            placeholder=""
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {submitted ? <p className="text-sm text-emerald-700">Course Joined!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {loading ? "Creating..." : "Join Course"}
        </button>
      </form>
    </div>
  );
};

export default JoinCourse;
