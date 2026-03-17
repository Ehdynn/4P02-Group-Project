import useUser from "../context/useUser"
import { Navigate } from "react-router-dom";
import InstructorAssignment from '../Components/Assignment/InstructorAssignment';

const Assignment = () => {
  const { user, isProfessor, roleReady } = useUser();

  if (!roleReady) return null; // or loading UI
  if (!user) return <Navigate to="/login" replace />;

  return <InstructorAssignment />;

}

export default Assignment