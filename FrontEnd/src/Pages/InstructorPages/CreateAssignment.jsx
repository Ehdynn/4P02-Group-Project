import { useState } from "react";
import supabase from "../../utils/supabase";

const CreateAssignment = () => {
  const [formData, setFormData] = useState({
    cid: "",
    name: "",
    dueDate: "",
    description: "",
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
    const { cid, dueDate, description } = formData;

    if (!cid || !formData.name.trim()) {
      setError("Please fill in all fields.");
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
      setError("You must be logged in to create an assignment.");
      return;
    }

    const { error: invokeError } = await supabase.functions.invoke("createAssignment", {
      body: {
        course_id: cid,
        name: formData.name.trim(),
        due_date: dueDate,
        description: description?.trim() ?? null,
      },
    });

    setLoading(false);

    if (invokeError) {
      let errorMessage = invokeError.message || "Unable to create assignment";
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
      cid: "",
      name: "",
      dueDate: "",
      description: "",
    });
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Create Assignment</h1>
      <p className="mt-2 text-sm text-slate-600">FILL IN TEXT HERE</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Course id</span>
          <input
            type="integer"
            name="cid"
            value={formData.cid}
            onChange={onChange}
            placeholder=""
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Assignment Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Assignment One"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 uppercase text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Due Date</span>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
                name="description"
                value={formData.description}
                onChange={(e) => {
                    onChange(e);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                }}
                rows={1}
                className="w-full overflow-hidden resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {submitted ? <p className="text-sm text-emerald-700">Assignment Created!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </main>
  );
};

export default CreateAssignment;
