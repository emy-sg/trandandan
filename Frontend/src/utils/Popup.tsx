import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useState ,useEffect} from 'react';
import './Popup.css'
import { useParams } from 'react-router-dom';
const Pop = (props) => {
const [Roompassword,setRoomPassword] = useState("");
const [errorMessage,setErrorMessage] = useState("");

const params = useParams();
const [showinput,setInput] = useState(false);
const HandleShowPassword = (e) => {
    e.preventDefault();
    setInput(!showinput)
}

async function TryAccessRoom()
{

  let text = (process.env.REACT_APP_BACK_URL + "/player/joinProtectedRoom/");
  // console.log("Joinprotected Link => " + text + " PSWD " + Roompassword);
  // console.log(" THE ID IS " + params.id);

  // console.log( "THE PROP : " , props);
  await fetch(text,{
    // mode:'no-cors',
    method:'post',
    credentials:"include",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
        { 
      room_id: params.id,
      pwd: Roompassword,
        }
      )
})

.then((response) => response.json())
.then(json => {
    // console.log("The JoinprotectedRoom Response   is => " + JSON.stringify(json))

  // window.location.reload();
  
  if(String(json.statusCode) === "401" || String(json.statusCode) === "404")
  {
    setErrorMessage(json.message)
  }
  else
  {
    // console.log("Room Access if now true.");
    let text = "HasRoomAccess" + params.id
    let RoomText = "Room:" + params.id;
    const room = {
      id: params.id
      ,...json.room
      // [json.data],
    }
    localStorage.setItem(text,"true");
    localStorage.setItem(RoomText,JSON.stringify(room));
    window.location.reload();
  }

    return json;
})
.catch((error) => {
    // console.log("An error occured : " + error)
    return error;
})

}

const HandleEnterProtectedRoom = (e) => {
    e.preventDefault();
    // console.log("Inside Protected room ")
    if(!Roompassword)
    {
        setErrorMessage("Please enter a valid password.");
    }
    else
    {
      // console.log("Tring to enter this room with this psswd " + Roompassword);
      TryAccessRoom();
    }

}

useEffect (() => {
  
},[])

return (
  <Popup trigger ={
      <button type="button" className='ButtonPswd' onClick={HandleShowPassword}>
      <span className="icon material-symbols-outlined">
     {"lock"}    {props.room.name}    </span>
      </button> 

      }    
    position="bottom center">
    <div className='ProfilePic-textBox'>

    <input type="password"
       className={`${Roompassword ? "has-value" : ""}`}
	   id="textbox"
       onChange={event => setRoomPassword(event.target.value)}
       value={Roompassword || ""}
       />
       <label htmlFor='textbox'> Password : </label>
    {errorMessage && <div className="error"> {errorMessage} </div>}
    <button type="button" id="ss" className='EnterPsswdButton' onClick={HandleEnterProtectedRoom}>
    <span className="icon material-symbols-outlined">
     {"Send"}  
      </span>
      </button>
    </div>
  </Popup>
)
}

export { Pop };
