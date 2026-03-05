import { Navigate } from "react-router-dom";
import useUser from '../../context/useUser';

const StudentRoute = ({children}) => {
  const {isProfessor, roleReady } = useUser();

  if (!roleReady) {
    return (
      children
    );
      {/*   
      <div style={{ position: "relative" }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
        <p
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
          }}
        >
          Checking permissions...
        </p>
      </div>
      */}
    
  }

  if (!isProfessor){
    return children;
  }

  return <Navigate to={'/login'} replace />
}

export default StudentRoute
