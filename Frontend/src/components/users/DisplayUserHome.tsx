import React from "react";
import {Link} from'react-router-dom';

import './DisplayUserHome.css'


const DisplayUserHome = (props) => {

const Reload = (e) => {
    e.preventDefault();
        window.location.href= ('/users/' + props.usertoshow.nickname)
}
    return (
        <>

        <div className="display-user-container"> 
<ul>
   <li>
   <img src={props.usertoshow.avatar} 
   className="avataruser"
   alt="userAvatar"
     />
     </li>
     <li>
    <Link style={{color:'white'}} to={`/users/${props.usertoshow.nickname}`} >
   <p>   <button onClick={Reload}>  {props.usertoshow.nickname}  </button>  </p>
    </Link>
    </li>

      </ul>
      </div>
        </>
    )
}
export default DisplayUserHome;