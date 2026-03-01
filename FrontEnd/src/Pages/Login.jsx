
import { useState } from 'react';
import LoginForm from '../Components/login/LoginForm';
import SignupForm from '../Components/signup/SignupForm';
const Login = () => {
  const [loginMode, setLoginMode] = useState(true);

  return (
    <>
    <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 -translate-y-1">
        <div className='box-border min-w-64 p-4 bg-gray-500 rounded-2xl'>
            <div className="flex justify-end">
              <button
                onClick={() => setLoginMode(!loginMode)}
                className="box-border border border-white rounded px-2 py-1 text-sm font-semibold text-white hover:bg-blue-950"
              >
                {loginMode ? "signup" : "login"}
              </button>
            </div>
            <div className="mt-3 flex justify-center text-center">
              {loginMode ? <LoginForm /> : <SignupForm />}
            </div>
        </div>
    </div>
    </>
  )
}

export default Login
