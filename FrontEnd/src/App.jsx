import Landing from './Pages/Landing'
import About from './Pages/About'
import PageNotFound from './Pages/PageNotFound';
import Login from './Pages/Login';
import NavBar from './Components/NavBar/NavBar';
import UserProvider from './context/UserProvider';

import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';

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
                  {/* TODO Add Rest of the Routes Here */}
                  <Route path="*" element={<PageNotFound />} />
              </Routes>
          </div>
      </Router>
    </UserProvider>
  )
}

export default App
