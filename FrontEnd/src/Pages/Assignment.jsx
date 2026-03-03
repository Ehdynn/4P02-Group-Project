import useUser from "../context/useUser"
import { Navigate } from "react-router-dom";
import InstructorAssignment from '../Components/Assignment/InstructorAssignment';
import StudentAssignment from '../Components/Assignment/StudentAssignment';

const Assignment = () => {
  const { user, isProfessor, roleReady } = useUser();

  if (!roleReady) return null; // or loading UI
  if (!user) return <Navigate to="/login" replace />;

  return isProfessor ? <InstructorAssignment /> : <StudentAssignment />;

}

export default Assignment