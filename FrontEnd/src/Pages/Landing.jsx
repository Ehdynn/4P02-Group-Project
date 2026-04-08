import useUser from "../context/useUser"
import { Navigate, useNavigate } from "react-router-dom";

const Landing = () => {
  const { user, roleReady } = useUser();
  const navigate = useNavigate();

  if (!roleReady) return null;
  if (user) {
    return <Navigate to="/Overview" replace />;
  }

  return (
    <main className="outer-container-3qw">
      <h1 className="h1-default text-center">Team Won Code Comparison</h1>
      <section className="py-28 px-6 bg-gradient-to-b from-white to-gray-50 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
        Are you a -
      </h2>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">

        <div className="flex flex-col items-center bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition">
          <h3 className="text-2xl font-semibold mb-6">Student</h3>

          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-4 rounded-xl shadow-md transform hover:scale-105 transition" onClick={() => navigate("/Submit")}>
            Submit Assignment
          </button>
        </div>

        <div className="flex flex-col items-center bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition">
          <h3 className="text-2xl font-semibold mb-6">Instructor</h3>

          <button className="w-full md:w-auto bg-gray-900 hover:bg-black text-white text-lg px-10 py-4 rounded-xl shadow-md transform hover:scale-105 transition" onClick={() => navigate("/Login")}>
            Login
          </button>
        </div>

      </div>
      <h2 className="text-4xl font-bold text-center mt-24 mb-12">
        Why us?
      </h2>
      <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center my-12">         
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Fights Against Plagiarism
        </h2>
        <div className="mt-8 bg-blue-100 shadow-md rounded-2xl p-6 md:p-8">
          <p className="text-gray-600 text-lg">
            Using advanced systems, scans and evaluates if students copied off of each other.
          </p>
        </div>

      </div>

      <div className="max-w-4xl mx-auto text-center my-24">         
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Central Assignment Hosting
        </h2>
        <div className="mt-8 bg-green-100 shadow-md rounded-2xl p-6 md:p-8">
          <p className="text-gray-600 text-lg">
            Provides a central space for Instructors to manage submissions for assignments.
          </p>
        </div>

      </div>

      <div className="max-w-4xl mx-auto text-center">         
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Simple Submission Process
        </h2>
        <div className="mt-8 bg-pink-100 shadow-md rounded-2xl p-6 md:p-8">
          <p className="text-gray-600 text-lg">
            No hoops for students to go through to submit, just enter the Assignment code, and submit!
          </p>
        </div>

      </div>
    </section>
    </section>
    </main>
  )

}

export default Landing
