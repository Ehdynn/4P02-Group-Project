import { useState } from "react";
import supabase from "../../utils/DatabaseInteractions/supabase";

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    name: "",
    joinCode: "",
    startDate: "",
    endDate: "",
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
    const { name, joinCode, startDate, endDate } = formData;

    if (!name.trim() || !joinCode.trim() || !startDate || !endDate) {
      setError("Please fill in all fields.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("Course end date must be after the start date.");
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
      setError("You must be logged in to create a course.");
      return;
    }

    const { error: invokeError } = await supabase.functions.invoke("createCourse", {
      body: {
        name: name.trim(),
        joinCode: joinCode.trim().toUpperCase(),
        startDate,
        endDate,
      },
    });

    setLoading(false);

    if (invokeError) {
      let errorMessage = invokeError.message || "Unable to create course";
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
      name: "",
      joinCode: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Create Course</h1>
      <p className="mt-2 text-sm text-slate-600">Set the course name and a code students can use to join.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Course Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Software Design 101"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Join Code</span>
          <input
            type="text"
            name="joinCode"
            value={formData.joinCode}
            onChange={onChange}
            placeholder="4P02-W26"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 uppercase text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Start Date</span>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">End Date</span>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {submitted ? <p className="text-sm text-emerald-700">Course Created!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </main>
  );
};

export default CreateCourse;
