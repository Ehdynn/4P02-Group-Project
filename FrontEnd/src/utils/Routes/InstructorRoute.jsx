import { Navigate } from "react-router-dom";
import useUser from '../../context/useUser';

const InstructorRoute = ({children}) => {
  const {isProfessor, roleReady } = useUser();

  if (!roleReady) {
    return null;
  }

  if (isProfessor){
    return children;
  }

  return <Navigate to={'/login'} replace />
}

export default InstructorRoute
