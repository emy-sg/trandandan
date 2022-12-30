import  { useEffect } from 'react'
import { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './DisplayChatRoomsusers.css'
import { io } from 'socket.io-client';
// import blobz from 'blobz.css'
const DisplayChatRoomusers = (props) => {
   
    const [display,setDisplay] = useState(false);
    const [inviteGame,setInviteGame] = useState(false);
    const params = useParams();
    const navigate = useNavigate();

    const HandleInviteToGame = (e) => {
        e.preventDefault();
        // console.log("invting this user to a game !");
        setInviteGame(true);

    }
 
    useEffect(() => {

        if (inviteGame)
        {
            const back_url = process.env.REACT_APP_BACK_URL + "/game";
            let socket = io(back_url);

   socket.on("connect",() => {
    // console.log("socket : ",socket);
   })

   socket.emit("inviteGame",{
    user:localStorage.getItem("user")!,
    invite:props.user.nickname
   })

   socket.on("InviteUpdate",(data:any) => {
    // console.log("Invite Update Data : ",data)
    if(data.logged)
    {
    localStorage.setItem("inviteGame",data.inviteeNickname)
   navigate('/Pong') 
    }
    
   })
  }
  // eslint-disable-next-line
    },[inviteGame])
    
    useEffect(() => {
        const loggeduser = localStorage.getItem("user");
        if(loggeduser)
        {
            const current = JSON.parse(loggeduser);
            if (current.id === props.user.id)
            {
                setDisplay(false);
            }
            else
            setDisplay(true);
            let texttt = "HasRoomAccess" + params.id

            // console.log("SETTING TEXT TO FALSE " + texttt)
          
            localStorage.setItem(texttt,"false")
        }
        // eslint-disable-next-line
    },[])
// console.log(" DIsplay ChatRoom Users >>> " + props.user + " nickname : " , props.user.nickname)
    return (
        <>
<div className="ChatRoom-HELP"> 
    <table className="ChatRoom-table">
        <tbody>
            {display ? (
                <>
                 <tr>
   </tr>
   <tr>
   <td> <img src={props.user.avatar!} 
   height="20" 
   className='avatarsidebar'
   alt="AvatarSideBar"/>
   </td>
   <td>
    <Link style={{color:'white'}} to={`/users/${props.user.nickname}`} > 
   <p> {props.user.nickname} </p>
     </Link> 
     </td> 

  <td>
                <button>
  <span className="icon material-symbols-outlined" onClick={HandleInviteToGame}>
     {"stadia_controller"}  
      </span>
      </button>
{/* {isAdmin === "true"  ? (
<>

<button type="button" id="ss" className='ButtonSocial-Unfriend' onClick={HandleShowAction}>
    <span className="icon material-symbols-outlined">
     {"Settings"}  
      </span>
      </button>

{action ? (
<>
   <button type="button" id="ss" className='ButtonSocial-Unfriend' onClick={handleFriendClick}>
    <span className="icon material-symbols-outlined">
     {"people"}  
      </span>

      </button>
      <button type="button" id="ss" className='ButtonSocial-block' onClick={HandleBlock}>
    <span className="icon material-symbols-outlined">
     {"block"}  
      </span>

      </button> 
      <p> {errorMessage && <div className="error"> {errorMessage} </div>}  </p>

   
</>
) : (
    <>
    </>
)}
</>
) : (
<>

</>
)} */}


      
      </td>

   </tr>
                </>
            ) : (
                <>
                </>
            )}
   
   </tbody>
   </table>
   </div>
        </>


       
    )
}
export default DisplayChatRoomusers;