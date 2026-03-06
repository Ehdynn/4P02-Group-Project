import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import useUser from '../../context/useUser';
import supabase from "../../utils/DatabaseInteractions/supabase";
import InstructorLinks from './InstructorLinks';
import StudentLinks from './StudentLinks';
const Navbar = () => {
    const navigate = useNavigate();
    const { user, setUser, isProfessor, roleReady } = useUser();
    const handleLogout = async () => {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/");
    };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="w-full px-4">
        <div className="flex items-center">
          <div className="hidden md:flex items-center w-full">

            <Link 
                to={user && roleReady ? "/Overview" : "/"} 
                className="link-default"
            >{user && roleReady ? "Overview" : "Home"}</Link>

            <div className="ml-auto flex items-center gap-1">
              {user == null ? 
                <Link to="/login" className="link-default">
                    Login
                </Link> 
                :
                <>
                  {roleReady ? (isProfessor ? <InstructorLinks /> : <StudentLinks />) : null}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="link-default"
                  >
                    Logout
                  </button>
                </>
                }
              
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
