import React from "react";
const DisplayRoomList =  (props) => {

    // async function JoinRoom()
    // {
     
      
    //   const text = process.env.REACT_APP_BACK_URL + "/player/joinRoom/" + props.room.id;
    //     // console.log("THE  Join Room Link :  =>  " + text);
        
    
    //     await fetch(text,{
    //       // mode:'no-cors',
    //       method:'get',
    //       credentials:"include"
    //   })
      
    //   .then((response) => response.json())
    //   .then(json => {
    //     //   console.log("The Joining Room Response  is => " + JSON.stringify(json))
    //     //   setSuccess(true);
    //       if(json.statusCode == "")
    
    //       return json;
    //   })
    //   .catch((error) => {
    //     //   console.log("An error occured  while joinin the room " + error)
    //       return error;
    //   })
    
    // }

    const HandleJoinRoom = (e) => {
        e.preventDefault();
    localStorage.setItem("protected","false");
        // console.log("just set protected to false  ! ")
        // console.log("Joining this room ..." + props.room.id + " ROOM INFO : DM :  " + props.room.is_dm, + " PROTECTED ? : "  +  props.room.is_protected)
    //     if(!props.room.is_dm && !props.room.is_protected)
    //    { JoinRoom()
    //     .then((resp) => {
    //         // console.log( " JOINING IS DONE ! ")
         
    // window.location.href =process.env.REACT_APP_FRONT_URL +  "/room/" + props.room.id;
            
    //     })}
        // else 
        if (props.room.is_protected)
        {

    localStorage.setItem("protected","true");
    // console.log("just set protected to TRUE  ! ")
    let text = "HasRoomAccess" + props.room.id
  let RoomText = "Room:" + props.room.id;

    // console.log(" PARAMS ID IS : " + props.room.id)
    localStorage.setItem(text,"false");
    localStorage.setItem(RoomText,"");

    window.location.href = process.env.REACT_APP_FRONT_URL + "/room/" + props.room.id;

        }
        else
        {
    window.location.href = process.env.REACT_APP_FRONT_URL+ "/room/" + props.room.id;

        }
    }
    return (
        <>

            <ul className="chat-room-list">
        <li>
    {props.room.is_protected ? (
        <> 
           <button type="button" className='has-border'  onClick={HandleJoinRoom}>
            <span className="icon material-symbols-outlined">
             {"lock"}     </span>
             <span>{  props.room.name} </span>
              </button> 
        </>
    ) : (
        <>
         <button 
         onClick={HandleJoinRoom}
                          
                  >
                      {/* <Link to={`/room/${props.room.id}`}>{props.room.name}</Link> */}
                    {props.room.name}
                      </button>
        </>
        
     )} 
    </li>
            </ul>
        </>
    )
}

export default DisplayRoomList