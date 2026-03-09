import InstructorRoute from './utils/Routes/InstructorRoute';
//import StudentRoute from './utils/Routes/StudentRoute';

// Public Pages
import Landing from './Pages/Landing';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import PageNotFound from './Pages/PageNotFound';
import Login from './Pages/Login';
import Overview from './Pages/Overview';
import Assignment from './Pages/Assignment';
// Instructor Pages 
import CreateCourse from './Pages/InstructorPages/CreateCourse';
import CreateAssignment from './Pages/InstructorPages/CreateAssignment';
// Student Pages
import JoinCourseModal from './Components/JoinCourse/JoinCourse';
import { useState } from 'react';
// Components
import NavBar from './Components/NavBar/NavBar';
// Utils
import UserProvider from './context/UserProvider';
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';

function App() {
  const [showJoinCourseModal, setShowJoinCourseModal] = useState(false);

  return (
    <UserProvider>
      <Router>
          <div>
              <NavBar onJoinCourse={() => setShowJoinCourseModal(true)}/>
              <JoinCourseModal
                isOpen={Boolean(showJoinCourseModal)}
                onClose={() => setShowJoinCourseModal(false)}
              />
              <Routes>
                  {/* Public Routes */}
                  <Route path="/" element = {<Landing />} />
                  <Route path="/login" element = {<Login/>} />
                  <Route path="/Overview/:cid" element={<Overview/>}/>
                  <Route path="/Overview" element={<Overview/>}/>
                  <Route path="/ForgotPassword" element={<ForgotPassword/>}/>
                  <Route path="/ResetPassword" element={<ResetPassword/>}/>
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
                  <Route path="*" element={<PageNotFound />} />
              </Routes>
          </div>
      </Router>
    </UserProvider>
  )
}

export default App
