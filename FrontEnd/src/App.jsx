import Landing from './Pages/Landing'
import About from './Pages/About'
import PageNotFound from './Pages/PageNotFound';
import Login from './Pages/Login';
import NavBar from './Components/NavBar/NavBar';
import UserProvider from './context/UserProvider';
import InstructorOverview from './Pages/InstructorPages/InstructorOverview'
import StudentOverview from './Pages/StudentPages/StudentOverview'

import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';
import CreateCourse from './Pages/InstructorPages/CreateCourse';
import CreateAssignment from './Pages/InstructorPages/CreateAssignment'

function App() {
  return (
    <UserProvider>
      <Router>
          <div>
              <NavBar/>
              <Routes>
                  <Route path="/" element = {<Landing />} />
                  <Route path="/about" element = {<About />} />
                  <Route path="/login" element = {<Login/>} />
                  <Route path="/CreateCourse" element = {<CreateCourse/>}/>
                  <Route path="/CreateAssignment" element = {<CreateAssignment/>}/>
                  <Route path="/InstructorOverview" element = {<InstructorOverview/>}/>
                  <Route path="StudentOverview" element = {<StudentOverview/>}/>
                  {/* TODO Add Rest of the Routes Here */}
                  <Route path="*" element={<PageNotFound />} />
              </Routes>
          </div>
      </Router>
    </UserProvider>
  )
}

export default App
