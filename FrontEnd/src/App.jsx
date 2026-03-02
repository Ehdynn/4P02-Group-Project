import InstructorRoute from './utils/Routes/InstructorRoute';
import StudentRoute from './utils/Routes/StudentRoute';

// Public Pages
import Landing from './Pages/Landing';
import About from './Pages/About';
import PageNotFound from './Pages/PageNotFound';
import Login from './Pages/Login';
// Instructor Pages
import InstructorOverview from './Pages/InstructorPages/InstructorOverview';
import CreateCourse from './Pages/InstructorPages/CreateCourse';
import CreateAssignment from './Pages/InstructorPages/CreateAssignment';
import InstructorAssignment from './Pages/InstructorPages/InstructorAssignment';
// Student Pages
import StudentOverview from './Pages/StudentPages/StudentOverview';
import StudentAssignment from './Pages/StudentPages/StudentAssignment';
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
                  <Route path="/about" element = {<About />} />
                  <Route path="/login" element = {<Login/>} />
                  {/* Instructor Routes */}
                  <Route
                    path="/InstructorOverview"
                    element={
                      <InstructorRoute>
                        <InstructorOverview />
                      </InstructorRoute>
                    }
                  />
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
                  <Route
                    path = "/InstructorAssignment"
                    element={
                        <InstructorRoute>
                          <InstructorAssignment />
                        </InstructorRoute>
                    }
                  />
                  {/* Student Routes */}
                  <Route
                    path="/StudentOverview"
                    element={
                      <StudentRoute>
                        <StudentOverview />
                      </StudentRoute>
                    }
                  />
                  <Route
                    path="/StudentAssignment"
                    element={
                      <StudentRoute>
                        <StudentAssignment />
                      </StudentRoute>
                    }
                  />
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
