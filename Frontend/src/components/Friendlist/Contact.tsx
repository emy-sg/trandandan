import React from "react";
// import {Link} from'react-router-dom';
import { useState ,useEffect} from "react";
// import DmWindow from "../DirectMsg/DmWindow"
import './Contact.css'
// import { io } from "socket.io-client";
// import { Socket } from 'dgram';
// import socket
// var socket:any;
const Contact = (props) => {
	const [OpenMsg, SetOpenMsg] = useState(false);
    // const [OpenBox,setOpenBox] = useState(true);
    const [imLogged,setImLogged] = useState(false);
    const [inGame,setInGame] = useState(false);

    // console.log(props.name);
    const [Dmcount,SetDmCount] = useState(-1);
const handleClick = (e) => {
e.preventDefault();

if(!OpenMsg)
{
    // let tt = Dmcount + 1;
    let tt = parseInt(localStorage.getItem("Dmcount")!);
    // const tt = Dmcount + 1;
    
     tt = tt + 1;
    // console.log(" TRUE " + tt);
    SetDmCount(tt);
    // let tt = parseInt(localStorage.getItem("Dmcount")!);
    // console.log("Parsed => "  + tt);
    // tt = tt - 1;
    // console.log(" => "  + tt);

    localStorage.setItem("Dmcount",(tt).toString());
}

if(OpenMsg)
{
       const tt = Dmcount - 1
    SetDmCount(tt);
}

    SetOpenMsg(!OpenMsg);

    
}
useEffect (() => {
    let InGameUsers = localStorage.getItem("InGame");
    if (InGameUsers)
    {
        // console.log("Inside In Game Users : ")
        const parsedInGame = JSON.parse(InGameUsers);
        if(parsedInGame.data[0])
        {

        let srch = parsedInGame.data.filter((m: any) => {
            // console.log(" ME id : " + m.id + "  User Nick : " + props.user.nickname  +  " : " , m);
            return m.id === props.user.nickname
          })[0] 
        
            if(srch)
            {
                // console.log(" THIS FRIEND IS IN GAME  IN  ")
                setInGame(true);
                // setImLogged(true);
            }
            else
            {
                // console.log( " THIS FRIEND IS NOT IN GAME" );
                setInGame(false);
                // setImLogged(false);
            }
        }
        else
        {
            // console.log("no PARSED IN GAME DATA")
            setInGame(false);
        }

    }

    let onlineUsers = localStorage.getItem("online");
    if(onlineUsers)
    {
        let ParsedUsers = JSON.parse(onlineUsers);
        console.log ( "PARSED USER : " , ParsedUsers);

    let srch = ParsedUsers.filter((m: any) => {
    // console.log(" ME id : " + props.user.id + "  ME NICKNAME : " + props.user.nickname  +  " : " , m.user);
    return m.user === props.user.id
  })[0] 

    if(srch)
    {
        // console.log(" THIS FRIEND IS LOGEED IN  ")
        setImLogged(true);
    }
    else
    {
        // console.log( " THIS FRIEND NOT LOGGED IN ");
        setImLogged(false);
    }
        // const isInsideLoggedUsers = ParsedUsers.filter(s => s.id);
    }
    // eslint-disable-next-line
},[])

const RedirFriendProfile = (e) => {
    e.preventDefault();
    window.location.href = process.env.REACT_APP_FRONT_URL + "/users/" + props.user.nickname;


}
return (
<div className="Contact-HELP"> 
    <table className="Contact-table">
        <tbody>
    <tr>
       <th></th>
       <th>Name</th>
       <th>Status </th>
   </tr>
   <tr>
   <td> <img src={props.user.avatar} 
   height="20"
   className="avatar1"
   alt="ContactAvatar"
   onClick={handleClick} /></td>
    {/* {OpenMsg ? (
                    <td> 
                            
                     <DmWindow contact={props.user}/> 
                     </td>
              ) : (
                <td></td>
              )} */}
   <td> 
  
   <p> <button onClick={RedirFriendProfile}>{props.user.nickname}</button> </p>
    </td> 
    {inGame ? (
        <>
               <td>
                <div className="inGame-div">

<button type="button" className='has-border' >  
<span className="icon material-symbols-outlined">
{"radio_button_checked"}        </span> 
<span> In Game</span>
</button>
</div>
</td> 
        </>
    ) : (
        <>
              {imLogged ? (
                 <td>  
                    <div className="icon-div">

                         <button type="button" className='has-border' >  
                 <span className="icon material-symbols-outlined">
                {"check_circle"}        </span> 
<span> Online</span>

                 </button>
                 </div>
                 
                    </td>
              ) : (
              <td> 
                    <div className="icon-off-div">
                 <button type="button" className='has-border' >  
              <span className="icon material-symbols-outlined">
             {"cancel"}        </span> 
<span> Offline</span>

              </button>
              </div>
                 </td>
              )}
        </>
    )}


</tr>
        </tbody>
    </table>
  
    </div>
);
};

export default Contact;


