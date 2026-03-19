import { useState } from "react";
import supabase from "../../utils/DatabaseInteractions/supabase";

export default function JoinCode({value, submit, submitted}) {
  const [formData, setFormData] = useState({
    joinCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [cid, setCid] = useState(null);
  
  const fetchCid = async () => {
    event.preventDefault();
    console.log("pls");
    const { joinCode } = formData;

    if (!joinCode) {
      setError("Please enter a join code.");
      return;
    }
    if (!joinCode.trim()) return

    setLoading(true);
    setError(null);
    setCid(null);

    const { data, error } = await supabase
      .from('Courses')
      .select('cid')
      .eq('join_code', joinCode.trim())
      .single()

    if (error) {
      setError('No course found with that join code.');
      console.log(error);
    } else {
      setCid(data.cid);
      value = data.cid;
      submitted = true;
      console.log(value);
      submit;
    }
    setLoading(false)
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    submitted = false;
  };

  return (
    
    <div className="outer-container">
      <h1 className="h1-default">Join Course</h1>
      <form onSubmit={fetchCid} className="form-default">
        <label className="label-default">
          <span className="span-default">Join Code</span>
          <input
            type="text"
            name="joinCode"
            value={formData.joinCode}
            onChange={onChange}
            placeholder=""
            className="field-default uppercase"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {submitted ? <p className="success">Course Joined!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Creating..." : "Join Course"}
        </button>
      </form>
    </div>
    
  );
};
