import InstructorRoute from './utils/Routes/InstructorRoute';
import StudentRoute from './utils/Routes/StudentRoute';

// Public Pages
import Landing from './Pages/Landing';
import ForgotPassword from './Pages/ForgotPassword';
import PageNotFound from './Pages/PageNotFound';
import Login from './Pages/Login';
import Overview from './Pages/Overview';
import Assignment from './Pages/Assignment';
// Instructor Pages
import CreateCourse from './Pages/InstructorPages/CreateCourse';
import CreateAssignment from './Pages/InstructorPages/CreateAssignment';
// Student Pages
import JoinCourse from './Pages/StudentPages/JoinCourse';
// Components
import NavBar from './Components/NavBar/NavBar';
// Utils
import UserProvider from './context/UserProvider';
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';

function App() {
  return (
    <UserProvider>
      <Router>
          <div>
              <NavBar/>
              <Routes>
                  {/* Public Routes */}
                  <Route path="/" element = {<Landing />} />
                  <Route path="/login" element = {<Login/>} />
                  <Route path="/Overview" element={<Overview/>}/>
                  <Route path="/ForgotPassword" element={<ForgotPassword/>}/>
                  <Route path="/Assignment/:aid" element={<Assignment/>}/>
                  {/* Instructor Routes */}
                  <Route
                    path="/CreateCourse"
                    element={
                      <InstructorRoute>
                        <CreateCourse />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/CreateAssignment"
                    element={
                      <InstructorRoute>
                        <CreateAssignment />
                      </InstructorRoute>
                    }
                  />
                  {/* Student Routes */}
                  <Route
                    path="/JoinCourse"
                    element={
                      <StudentRoute>
                        <JoinCourse />
                      </StudentRoute>
                    }
                  />
                  <Route path="*" element={<PageNotFound />} />
              </Routes>
          </div>
      </Router>
    </UserProvider>
  )
}

export default App
