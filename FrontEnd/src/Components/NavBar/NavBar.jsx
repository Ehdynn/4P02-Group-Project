import { Link } from 'react-router-dom';
import useUser from '../../context/useUser';
import supabase from '../../utils/supabase';
const Navbar = () => {
    const { user, setUser } = useUser();
    const handleLogout = async () => {
      await supabase.auth.signOut();
      setUser(null);
    };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="w-full px-4">
        <div className="flex items-center">
          <div className="hidden md:flex items-center w-full">
            <Link to="/" className="py-5 px-3 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300">
              Home
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <Link to="/about" className="py-5 px-3 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300">
                About
              </Link>
              {user == null ? 
                <Link to="/login" className="py-5 px-3 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300">
                    Login
                </Link> 
                :
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-5 px-3 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300"
                >
                  Logout
                </button>
                }
              
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
