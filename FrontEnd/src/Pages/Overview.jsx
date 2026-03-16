import useUser from "../context/useUser"
import { Navigate } from "react-router-dom";
import InstructorOverview from '../Components/Overview/InstructorOverview';

const Overview = () => {
  const { user, isProfessor, roleReady } = useUser();

  if (!roleReady) return null; // or loading UI
  if (!user) return <Navigate to="/" replace />;

  return isProfessor ? <InstructorOverview /> : null;

}

export default Overview