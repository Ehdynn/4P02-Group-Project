import useUser from "../context/useUser"
import { Navigate } from "react-router-dom";
import InstructorOverview from './InstructorPages/InstructorOverview';
import StudentOverview from './StudentPages/StudentOverview';

const Overview = () => {
  const { user, isProfessor, roleReady } = useUser();

  if (!roleReady) return null; // or loading UI
  if (!user) return <Navigate to="/" replace />;

  return isProfessor ? <InstructorOverview /> : <StudentOverview />;

}

export default Overview