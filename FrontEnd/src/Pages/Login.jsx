
import { useState } from 'react';
import LoginForm from '../Components/login/LoginForm';
import SignupForm from '../Components/signup/SignUpForm';
const Login = () => {
  const [loginMode, setLoginMode] = useState(true);

  return (
    <>
    <div className="center-box">
        <div className='box-wrapper'>
            <div className="flex justify-end">
              <button
                onClick={() => setLoginMode(!loginMode)}
                className="text-button"
              >
                {loginMode ? "signup" : "login"}
              </button>
            </div>
            <div className="justify-center text-center">
              {loginMode ? <LoginForm /> : <SignupForm />}
            </div>
        </div>
    </div>
    </>
  )
}

export default Login
