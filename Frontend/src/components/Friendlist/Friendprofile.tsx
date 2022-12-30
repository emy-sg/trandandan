import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from "react";
import './Friendprofile.css'
import { containsSpecialChars2, IsAuthOk } from '../../utils/utils';
import axios from 'axios';
import { io } from 'socket.io-client';

const Friendprofile = () => {
  const params = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [userState, setUserState] = useState<any>([]);
  const [relation, setRelation] = useState("");
  const [isMe,setIsMe] = useState(false);
  const [allgood,setAllGood] = useState(false);
  const [InvitingGame,setInvitingGame] = useState(false);
  const [isFriendLogged,setIsFriendLogged] = useState(false);


  const [icons, setIcons] = useState("");
  const [msg, setMsg] = useState("");
  const [action, setAction] = useState("");
  localStorage.setItem("choice", "");
  localStorage.setItem("action2", "");

  const navigate = useNavigate();

  async function AcceptRelationship() {

    let endpoint = process.env.REACT_APP_BACK_URL + "/player/acceptFriendship/"

    // console.log("AcceptRelationship  => " + endpoint + " \n user:" + params.nickname)
    //  setAction("");
    endpoint = endpoint + params.nickname;
    await fetch((endpoint
    ), {
      // mode:'no-cors',
      method: 'get',
      credentials: "include"
    })


      .then((response) => response.json())
      .then(json => {
        // console.log("The response  => " + JSON.stringify(json))
          IsAuthOk(json)
          window.location.reload();
        setErrorMessage("");
        return json;
      })
      .catch((error) => {
        // console.log("An error occured : " + error)
        setErrorMessage("An error occured! Can't Accept Relationship    ! ");
        return error;
      })

  }


async function BlockRelationship()
{
   let endpoint = process.env.REACT_APP_BACK_URL + "/player/blockFriendship/"


    // console.log("BlockRelation  => " + endpoint + " \n user" + params.nickname)
    //  setAction("");
    endpoint = endpoint + params.nickname;
    await fetch((endpoint
    ), {
      // mode:'no-cors',
      method: 'get',
      credentials: "include"
    })


      .then((response) => response.json())
      .then(json => {
        // console.log("The response is => " + JSON.stringify(json))
        // if (json.ok)
        // IsAuthOk(json);
        // window.location.reload();
        if(String(json.statusCode) === "404")
        {
          setErrorMessage(json.message)
        }
        else
        {
        setErrorMessage("");
          window.location.reload();
        }
        return json;
      })
      .catch((error) => {
        // console.log("An error occured : " + error)
        setErrorMessage("An error occured! Can't Refuse Relationship    ! ");
        return error;
      })
}

  async function RefuseRelationship() {


    let endpoint = process.env.REACT_APP_BACK_URL + "/player/refuseFriendship/"

    // console.log("RefuseRelationship  => " + endpoint + " \n user" + params.nickname)
    //  setAction("");
    endpoint = endpoint + params.nickname;
    await fetch((endpoint
    ), {
      // mode:'no-cors',
      method: 'get',
      credentials: "include"
    })


      .then((response) => response.json())
      .then(json => {
        // console.log("The response is => " + JSON.stringify(json))
        // if (json.ok)
        IsAuthOk(json);
          window.location.reload();
        setErrorMessage("");
        return json;
      })
      .catch((error) => {
        // console.log("An error occured : " + error)
        setErrorMessage("An error occured! Can't Refuse Relationship    ! ");
        return error;
      })

  }

  async function ExecuteRelationship() {
    let endpoint;
    // console.log("Execute final " + action);
    switch (action) {
      case "addFriend":
        {
          endpoint = process.env.REACT_APP_BACK_URL + "/player/requestFriendship/"
          break;
        }
      case "blockFriend":
        {
          endpoint = process.env.REACT_APP_BACK_URL + "/player/blockFriendship/"
          break;

        }
      case "Accept":
        {
          endpoint = process.env.REACT_APP_BACK_URL + "/player/acceptFriendship/"
          break;

        }
      case "Refuse":
        {
          endpoint = process.env.REACT_APP_BACK_URL + "/player/refuseFriendship/"
          break;

        }
      case "unblockFriend":
        {
          endpoint = process.env.REACT_APP_BACK_URL + "/player/unblockFriendship/";
          break;
        }

    }
    // console.log("ExecuteRelationship  => " + endpoint + " \n action" + execute)
    //  setAction("");
    endpoint = endpoint + params.nickname;
    await fetch((endpoint
    ), {
      // mode:'no-cors',
      method: 'get',
      credentials: "include"
    })


      .then((response) => response.json())
      .then(json => {
        // console.log("The response is => " + JSON.stringify(json))
        IsAuthOk(json);
        window.location.reload();
        setErrorMessage("");
        return json;
      })
      .catch((error) => {
        // console.log("An error occured : " + error)
        setErrorMessage("An error occured! Can't update Relationship    ! ");
        return error;
      })

  }


  async function FetchRelationship() {

    const loggeduser = localStorage.getItem("user");
    if (loggeduser) {
      // console.log("Fetching Relationship    Infos   => " + params.nickname + " I am : " + current.nickname);

      // console.log(" this endpoint   " + endpoint + " Fetching : " + nicknametofetch)

      await fetch((process.env.REACT_APP_BACK_URL + `/player/statusFriendship/${params.nickname}`
      ), {
        // mode:'no-cors',
        method: 'get',
        credentials: "include"
      })



        .then((response) => response.json())
        .then(json => {
          // console.log("The Status Response is => " + JSON.stringify(json))
          // setErrorMessage("");
          if(String(json.statusCode) === "404")
          {
          setErrorMessage(json.message);

          }
          // localStorage.setItem("usertoshow",JSON.stringify(json));
          localStorage.setItem("choice", json);
          return json;
        })
        .catch((error) => {
          // console.log("An error occured : " + error)
          localStorage.setItem("choice","");
          // setRelation("error");
          setErrorMessage("An error occured! Relationship not found ! ");
          return error;
        })

    }

  }
  async function FetchUserInfos() {
    // console.log("Fetching User Profile  Infos  Home Page  => " + params.nickname);


    const loggeduser = localStorage.getItem("user");
    if (loggeduser) {
      // console.log(" this endpoint   " + endpoint)
      await fetch((process.env.REACT_APP_BACK_URL + `/player/profile/${params.nickname}`), {
        // mode:'no-cors',
        method: 'get',
        credentials: "include"
      })


        .then((response) => response.json())
        .then(json => {
          // console.log("The User  is => " + JSON.stringify(json))
          IsAuthOk(json.statusCode)
          if(String(json.statusCode) === "404")
          {
            setAllGood(false);
            setErrorMessage(json.message)
          }
          else
          {
            setAllGood(true);
          }
          setUserState(json);
          return json;
        })
        .catch((error) => {
          // console.log("An error occured : " + error)
          setUserState([])
          // localStorage.setItem("usertoshow","");
          setErrorMessage("An error occured! User not found ! ");
          return error;
        })

    }

  };

  async function SetRelationInfos() {


    await FetchRelationship()
      .then(() => {
      })
    const tt = localStorage.getItem("choice");
    if (tt === "addFriend") {
      // console.log("ww khello")
      setIcons("people")
      setMsg("AddFriend");
      setAction("addFriend");
      setRelation("addFriend");
      //  ExecuteRelationship("AddFriend");
      localStorage.setItem("action", "addFriend");

    }
    if (tt === "blockFriend") {
      setIcons("block")
      setMsg("Block friend ");
      setAction("blockFriend")
      setRelation("blockFriend");
      localStorage.setItem("action", "blockFriend");

      //  ExecuteRelationship("BlockFriend");
    }
    if (tt === "unblockFriend") {
      setMsg("Unblock this user.");
      setAction("unblockFriend")
      setIcons("block")
      setRelation("unblockFriend");
      localStorage.setItem("action", "unblockFriend");

      //  ExecuteRelationship("Unblock");

    }
    if (tt === "pendingFriend") {
      setMsg("Waiting for the user to accept ...");
      setAction("pending")
      setIcons("hourglass_top")
      setRelation("pending");
      localStorage.setItem("action", "pending");

    }
    if (tt === "acceptFriend" || tt === "refuseFriend") {
      setRelation("AcceptOrRefuse");
    }
    if (tt === "YourBlocked") {
      setAction("none");
      setRelation("YourBlocked");
      localStorage.setItem("action", "none");
    }
    else {
      const arr = (localStorage.getItem("choice")!)

      if (arr.includes("acceptFriend") || arr.includes("refuseFriend")) {
        setRelation("AcceptOrRefuse");
      }
      // setMsg("An error o");
      // setAction("noaction");
      // setRelation("error");
      // localStorage.setItem("action","noaction");

    }
    // console.log("TT is " + tt + " the action is " + action);

    // if(localStorage.getItem("choice"))
  };
  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    if(loggedUser)
    {
      const current = JSON.parse(loggedUser);
      if(current.nickname === params.nickname)
      {
        setIsMe(true);
      }
    }
    if(containsSpecialChars2(params.nickname))
    {
      setErrorMessage("invalid user nickname !")
    }
    else
    {
      FetchUserInfos();

      SetRelationInfos();
    }

    // FetchUserInfos();

    
    // ExecuteRelationship();
    // eslint-disable-next-line 
  }, [])

  useEffect(() => {
    
    let onlineUsers = localStorage.getItem("online");
    if(userState)
    {

    if(onlineUsers)
    {
        let ParsedUsers = JSON.parse(onlineUsers);
        // console.log ( "PARSED USER : " , ParsedUsers);

    let srch = ParsedUsers.filter((m: any) => {
    // console.log(" ME id : " + userState.id + "  ME NICKNAME : " + userState.nickname  +  " : " , ParsedUsers);
    return m.id === userState.id
  })[0]

    if(srch)
    {
        // console.log(" THIS USER IS LOGEED IN  " + JSON.stringify(srch))
        // setImLogged(true);
    }
    else if (!srch)
    {
        // console.log( " THIS USER NOT LOGGED IN ");
        // setImLogged(false);
    }
        // const isInsideLoggedUsers = ParsedUsers.filter(s => s.id);
    }
  }

  },[userState])

  const HandleAction = (e) => {
    e.preventDefault();

    // const execute = localStorage.getItem("action")
    // console.log("Executing this command =>   " + action);
    if (action !== "error")
      ExecuteRelationship();
    // else
      // console.log("Error ! can't execute action.");

  }

  const HandleRefuseFriendRequest = (e) => {
    e.preventDefault();
    setAction("Refuse");
    // localStorage.setItem("action","Refuse");
    // ExecuteRelationship();
    RefuseRelationship();
  }

  const HandleAcceptFriendRequest = (e) => {
    e.preventDefault();
    // console.log("Accepting the request ...");
    setAction("Accept")
    AcceptRelationship();

  }
  const HandleInviteToGame = (e) => {
    e.preventDefault();
    // console.log("invinting " + userState.nickname + "to play a game ...")
    setInvitingGame(true);

 
  }
  useEffect(() => {

    if(InvitingGame)
    {
      const back_url = process.env.REACT_APP_BACK_URL + "/game"
   let socket = io(back_url);

   socket.on("connect",() => {
    // console.log("socket : ",socket);
   })

   socket.emit("inviteGame",{
    user:localStorage.getItem("user")!,
    invite:userState.nickname
   })
//    function simpleStringify (object){
//     // stringify an object, avoiding circular structures
//     // https://stackoverflow.com/a/31557814
//     var simpleObject = {};
//     for (var prop in object ){
//         if (!object.hasOwnProperty(prop)){
//             continue;
//         }
//         if (typeof(object[prop]) == 'object'){
//             continue;
//         }
//         if (typeof(object[prop]) == 'function'){
//             continue;
//         }
//         simpleObject[prop] = object[prop];
//     }
//     return JSON.stringify(simpleObject); // returns cleaned up JSON
// };


if(isFriendLogged)
{

   socket.on("InviteUpdate",(data:any) => {
    setErrorMessage("");
    // console.log("Invite Update Data : ",data)
    if(data.logged)
    {
    localStorage.setItem("inviteGame",data.inviteeNickname)
   navigate('/Pong') 
    }
    
   })
  }
  else
  {
    setErrorMessage("This User is not logged In ,Can't invite him to play a game.")
  // localStorage.setItem("Errorprf","true");
  setTimeout(() => {

	  window.location.reload();
   
	}, 3000);
  }
    }
    // eslint-disable-next-line 
  },[InvitingGame,isFriendLogged])


useEffect(() => {


  let onlineUsers = localStorage.getItem("online");
  if(onlineUsers)
  {
      let ParsedUsers = JSON.parse(onlineUsers);
      // console.log ( "PARSED USER : " , ParsedUsers);

  let srch = ParsedUsers.filter((m: any) => {
  // console.log(" ME id : " + userState.id + "  ME NICKNAME : " + userState.nickname  +  " : " , m.user);
  return m.user === userState.id
})[0] 

  if(srch)
  {
      // console.log(" THIS FRIEND IS LOGEED IN  ")
      setIsFriendLogged(true);
  }
  else
  {
      // console.log( " THIS FRIEND NOT LOGGED IN ");
      setIsFriendLogged(false);
  }
      // const isInsideLoggedUsers = ParsedUsers.filter(s => s.id);
  }
},[userState])
  async function FetchRoomId()
  {
    const text = process.env.REACT_APP_BACK_URL + "/player/sendMessageButton/" + params.nickname;
    // console.log("Api  Sendmessagebutton  Link :  =>  " + text);
    

    await axios.get(text,{
      withCredentials:true
      // mode:'no-cors',
      // method:'get',
      // credentials:"include"
  })
  
  // .then((response) => response.json())
  .then(json => {
      // json.data.id = params.id;
      // console.log("json" + json)
      // console.log("The response Of SendMessage  is  => " + JSON.stringify(json.data))
      // SetUserAdmin(json);
      if(json.data)
      {
        window.location.href = process.env.REACT_APP_FRONT_URL + "/room/" + json.data;

      }
     
  })
  .catch((error) => {
      // console.log("An error occured  while fetching the SendMessage Id  ! : " + error)
      setErrorMessage(" An error occured while fetching the SendMessage Room id  ");
      return error;
  })

  }

  const HandleSendMessage  =  (e) => {
    e.preventDefault();
    // console.log("Fetching the room id !")
    FetchRoomId();

  }

  const HandleBlockUser = (e) => {
    e.preventDefault();

    // setAction("blockFriend")
    BlockRelationship();

    // console.log("Executing this command =>   " + action);
    // if (action !== "error")
    //   // ExecuteRelationship();
    // // else
      // console.log("Error ! can't execute action.");

    // console.log("BLOCKING THIS USER ")
  }
  if (!userState) {
    // TODO: 404
    console.log("ERROR ·404  from Friend Profile ,User Not found" + params.id + params.name);
    return (
      <>
      </>
    )
  }
  else {
    // console.log("B4" + userState['nickname'] + params.nickname);
    return (
      <div className='FriendProfile'>
        {errorMessage && <div className="error"> {errorMessage} </div>}
  
    {allgood ? (
      <>
          <>
       <img src={userState.avatar} height="80" alt="FriendAvatar"/>
        <h2>{userState.nickname}</h2>
        <h3> Number Of Wins : </h3>
        <h2>{userState.wins}</h2>
        <h3>Number of Loses : </h3>
        <h2>{userState.loses}</h2>
          </>
          <button type="button" className='' >
                      <span className="icon material-symbols-outlined">
                        {"History"}
                      </span>
                      <Link style={{ color: 'blue' }} to={`/Carreer/${userState.nickname}`} >
                        <span>  {userState.nickname} Carreer </span>
                      </Link>
                    </button>


        <br />
        {isMe ? (
          <>
  
          </>
        ) : (
          <>
           {relation === "YourBlocked" ? (
          <>
            <button type="button" className='button-displayuser' >
              <span className="icon material-symbols-outlined">
                {"sentiment_very_dissatisfied"}
              </span>
              <span> You are blocked !    </span>
            </button>
          </>
        ) : (
          <>
            {relation === "AcceptOrRefuse" ? (
              <>
                <button type="button" className='' >
                  <span className="icon material-symbols-outlined">
                    {"History"}
                  </span>
                </button>
                <br />
                <h2>{userState.nickname} want to be your friend ! </h2>
                <button type="button" className='button-displayuser' onClick={HandleAcceptFriendRequest}>
                  <span className="icon material-symbols-outlined">
                    {"Favorite"}
                  </span>
                  <span>Accept</span>
                </button>
                <button type="button" className='button-displayuser' onClick={HandleRefuseFriendRequest}>
                  <span className="icon material-symbols-outlined">
                    {"Cancel"}
                  </span>
                  <span>Refuse</span>
                </button>

                <button type="button" className='button-displayuser' onClick={HandleBlockUser}>
                  <span className="icon material-symbols-outlined">
                    {"Block"}
                  </span>
                  <span>Block</span>
                </button>
              </>
            ) : (
              <>

                {action ? (
                  <>
                 

                  </>
                ) : (
                  <>
                 
                  </>
                )}
                {String(action) === "addFriend" ? (
                  <>
                  <br/>
                    <button type="button" className='button-displayuser' onClick={HandleBlockUser}>
                  <span className="icon material-symbols-outlined">
                    {"block"}
                  </span>
                  <span> Block this user </span>
                </button>
                  </>
                ) : (
                  <>

                  </>
                )}
                <br />
                <button type="button" className='button-displayuser' onClick={HandleAction}>
                  <span className="icon material-symbols-outlined">
                    {icons}
                  </span>
                  <span>{msg}</span>
                </button>
                <br/>
             
                  
        
                     <button type="button" id="ss" className='ButtonSocial-Unfriend' onClick={HandleInviteToGame}>
    <span className="icon material-symbols-outlined">
     {"stadia_controller"}  
      </span>
      <span> Play  </span>
      </button>
                  <br/>
      <button type="button" id="ss" className='ButtonSocial-Unfriend' onClick={HandleSendMessage}>
    <span className="icon material-symbols-outlined">
     {"forward_to_inbox"}  
      </span>
      <span> Send Message  </span>
      </button>
      
              </>

            )}

          </>
        )}
          </>
        )}
       

      </>
    ) : (
      <>

      </>
    )}
       
      </div>
    );
  }
}

export default Friendprofile;