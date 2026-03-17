import { Navigate } from "react-router-dom";
import useUser from '../../context/useUser';

const InstructorRoute = ({children}) => {
  const { user, roleReady } = useUser();

  if (!roleReady) {
    return children;
  }

  if (user) {
    return children;
  }

  return <Navigate to={'/login'} replace />
}

export default InstructorRoute
