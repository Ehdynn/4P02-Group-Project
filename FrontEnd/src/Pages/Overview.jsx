import useUser from "../context/useUser"
import { Navigate } from "react-router-dom";
import InstructorOverview from '../Components/Overview/InstructorOverview';

const Overview = () => {
  const { user, roleReady } = useUser();

  if (!roleReady) return null;
  if (!user) return <Navigate to="/" replace />;

  return <InstructorOverview />;
}

export default Overview
