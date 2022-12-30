import  { useEffect } from 'react'
import { useState } from 'react'; 
import { useParams } from 'react-router-dom';
import './DisplayChatRoomsusers.css'
// import blobz from 'blobz.css'
const DisplayChatRoomFriendsToAdd = (props) => {
    const [errorMessage, setErrorMessage] = useState("");

    const [display,setDisplay] = useState(false);
    const params = useParams();

//   console.log("isADmin" + JSON.stringify(isAdmin))

async function InviteFriendToRoom () {
    const loggeduser = localStorage.getItem("user");
    if(loggeduser)
  {
    const text = process.env.REACT_APP_BACK_URL + "/player/addMember/" + props.user.nickname + "/" + params.id
  // console.log("Api Fetch Link :  =>  " + text);
  
  
  await fetch(text,{
    // mode:'no-cors',
    method:'get',
    credentials:"include"
  })
  
  .then((response) => response.json())
  .then(json => {
    // console.log("The ADd Member response is   => " + JSON.stringify(json))
  // 
  // IsAuthOk(json.statusCode);
  if(String(json.statusCode) === "500")
  {
    setErrorMessage("An error occured in the backend.");
  }
  else if (String(json.statusCode) === "404")
  {
    setErrorMessage(json.message)
  }

  
    return json;
  })
  .catch((error) => {
    // console.log("An error occured : " + error)
    return error;
  })
  
  // }
  }
  
  };
    const HandleInviteToRoom = (e) => {
        e.preventDefault();
        // console.log("Inviting this user to the chatroom " + props.user.nickname + " The room id is :" + params.id)
      
        if(props.user.nickname)
        {
          InviteFriendToRoom();
        }
        else
        {
          setErrorMessage("Please enter a valid nickname");
        }
      }
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
        }
        // eslint-disable-next-line
    },[])
// console.log(" DIsplay ChatRoom Users >>> " + props.user.id)
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
   <td>
   {errorMessage && <div className="error"> {errorMessage} </div>}
  
 <img src={props.user.avatar!} 
   height="20" 
   className='avatarsidebar'
   alt="AVatarFriendRoom"/>
   </td>
   <td>
    <button type="button" id="ss" className='ButtonSocial-Unfriend' onClick={HandleInviteToRoom}>
    <span className="icon material-symbols-outlined">
     {"group_add"}  
      </span>
      <span> Add  {props.user.nickname} to the chatroom</span>
      </button>
     </td> 

  <td>
                
 


      
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
export default DisplayChatRoomFriendsToAdd;