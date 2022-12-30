import React from 'react';
import './login.css'
import { useState, useEffect } from "react";

const back_url = process.env.REACT_APP_BACK_URL;
const Login = () => {
  const [wantsLogin, setWantsLogin] = useState(false);

  useEffect(() => {

    if (wantsLogin) {
      // console.log("WANTS LOGIN IS TRUEEE")
      localStorage.setItem("wantslogin", "true");
    }

  }, [wantsLogin])

  return (
    <div className='body'>

      <div className="login-card">

        <a href={back_url + "/auth/signup"} onClick={(e) => setWantsLogin(true)}>
          <span>
            Login
          </span>
        </a>
      </div>
    </div>
  )
};

export default Login;