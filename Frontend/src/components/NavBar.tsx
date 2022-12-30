import React, {useState} from 'react';
import {useEffect} from "react";
import './Navbar.css'
import ContactList from './Friendlist/ContactList';
import { IsAuthOk } from '../utils/utils';
import { io } from 'socket.io-client';
import Notifs from './Notifs';

var gamesocket:any;
let id = 0;


function Navbar() {
  const [errorMessage, setErrorMessage] = useState("");
  const [notifMessage, setNotifsMessage] = useState("");

  const [isShown,setIsShown] = useState(false);
  const [allgood,setAllgood] = useState(false);
  const [OpenNotifs,setOpenNotifs] = useState(false);


  const[user42,setUser42] = useState <any >([]);
  const[friends,setFriends] = useState <any >([]);
  const[notifs,setNotifs] = useState(false);
    const [sideBar,setSideBar] = useState(true);
    const [blur,SetBlur] = useState(false);
    const [invites,setInvites] = useState<any>([]);

    const toggleSidebar = (e) => {
      e.preventDefault();
        document.body.classList.toggle("open");
        setSideBar(!sideBar);
        SetBlur(!blur);
    }

    const navigateHome = () => {
        // navigate('/Home');
        window.location.href = process.env.REACT_APP_FRONT_URL + "/Home"

      };
      const navigateAccount = () => {
        // navigate('/');
        window.location.href = process.env.REACT_APP_FRONT_URL + "/"

      };

      const navigateChatRooms = () => {
        // navigate('/Landing');
        window.location.href =  process.env.REACT_APP_FRONT_URL + "/Landing"

      };


      const navigateGameLanding = () => {
        window.location.href = process.env.REACT_APP_FRONT_URL + "/GameLanding"

        // navigate('/GameLanding');
      };

      const navigatePlay = () => {
        window.location.href = process.env.REACT_APP_FRONT_URL + "/Pong"

        // navigate('/Pong');
      };

      const handleFriendClick = event => {
        // Toggle Shown state
        event.preventDefault();
        setIsShown(current => !current);
       FetchUserInfo();
         };


 async function LogOut ()
         {

let endpoint = process.env.REACT_APP_BACK_URL + '/auth/logout';
// endpoint = endpoint + userQuery;
// console.log(" LogOut endpoint   " + endpoint)


await fetch((endpoint),{
    mode:'no-cors',
    method:'get',
    credentials:"include"
})


.then((response) => {
  localStorage.setItem("authenticated", "false");
  localStorage.setItem("online", "");
  localStorage.setItem("action","");

    localStorage.setItem("user","");
    window.location.reload();
})

.catch((error) => {
  // console.log("An error occured : " + error)
  localStorage.setItem("authenticated","false");
  localStorage.setItem("online", "");

  localStorage.setItem("action","");
  setErrorMessage("An error occured! User not found ! ");
  return error;
})
}

      const LogUserOut = (e) => {
        e.preventDefault();
        LogOut();
    };


    async function FetchUserInfo () {

    const loggeduser = localStorage.getItem("user");
  
    if(loggeduser)
  {
    const text = (process.env.REACT_APP_BACK_URL + "/player/listOfFriends");

    await fetch(text,{
      // mode:'no-cors',
      method:'get',
      credentials:"include"
  })
  
  .then((response) => response.json())
  .then(json => {
      // console.log("The response is => " + JSON.stringify(json))
      IsAuthOk(json.statusCode)
        if (String(json.statusCode) === "404")
       {
        setErrorMessage(json.message)
       }
       else
       {
        setFriends(json);
        setAllgood(true);
       return json;  
       }
       
        
  })
  .catch((error) => {
      // console.log("An error occured : " + error)
      return error;
  })

    }
  }
  
  const HandleClickNotifs = (e) => {
    e.preventDefault();
    setNotifsMessage("")
    
    if(notifs)
    {
    setOpenNotifs(!OpenNotifs);
    }
    else
    {
      // console.log("No notifs !")
      setNotifsMessage("You have no Invitation ! ")
    }
  }
  useEffect(() => {
    const back_url = process.env.REACT_APP_BACK_URL + "/game"
    gamesocket = io(back_url)
    gamesocket.emit("OnlineGameUsersBack",{
      user:localStorage.getItem("user")
    })
    gamesocket.on("UsersInGame", (data: any) => {

      // console.log(" Users currently in game  ! : ", data);
      localStorage.setItem("InGame",JSON.stringify(data))
    });
    
    gamesocket.on("ReceivedInvite", (data: any) => {
      // console.log(" You Have Been Invited to play a game ! : ", data);
      const obj = {
        id: id++,
        data

      }
    setInvites((prevData: any) => [...prevData, obj]);
    
      setNotifs(true);
    });

  },[])

      useEffect(() => {
    const loggeduser = localStorage.getItem("user");
        if(loggeduser)
        {
          setUser42(JSON.parse(localStorage.getItem("user")!))
        }
        else
        {
          localStorage.setItem("authenticated","false");
          window.location.reload();
        }

      },[]);
    return (
        <nav>
            {/* <div>  {loggedInUser == "true" ? ( */}
              
              <div>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
                 <div className="body">
            <nav className="sidebar">
              <div className="sidebar-inner">
                <header className="sidebar-header">
                  <button
                    type="button"
                    className="sidebar-burger"
                    onClick={toggleSidebar}
                  ></button>
                  
                  <img src={user42.avatar}   className="avatarsidebar" alt="avatar"/>            
               <span> {user42.nickname}</span> 
                </header>
    {errorMessage && <div className="error"> {errorMessage} </div>}
                <nav className="sidebar-menu">
                  
                  <button type="button" onClick={navigateHome} className="has-border" >
                    <span className="icon material-symbols-outlined">
                Home 
      </span>
     <span> Home</span>
                  </button>
                  <button type="button" onClick={navigateAccount} className="has-border">
                    <span className="icon material-symbols-outlined">
     {"manage_accounts"} 
      </span>
      <span>Account</span>
                  </button>
                  <button type="button" onClick={navigatePlay}>
                <span className="icon material-symbols-outlined">
     {"videogame_asset"} 
      </span>
      <span>Play</span>
                  </button>

                  <button type="button" className='has-border' onClick={navigateGameLanding}>
                    <span className="icon material-symbols-outlined">
     {"live_tv"}  
      </span>
      <span>Live Games</span>
                  </button>
        
                  {/* <button type="button" onClick={navigateLeaderBoard} className="has-border">
                    <span className="icon material-symbols-outlined">
     {"LeaderBoard"} 
      </span>
     <span>LeaderBoard</span> 
                  </button> */}
              
                  <button type="button" onClick={navigateChatRooms}>
                    <span className="icon material-symbols-outlined">
     {"Groups"}  
      </span>
      <span>Channels</span>
                  </button>


  
                      <button type="button" className='has-border' onClick={handleFriendClick}>
                    <span className="icon material-symbols-outlined">
     {"People"}  
      </span>
      <span>
      Social
      </span>
      
   
                      </button>

    <button type="button" className='has-border' onClick={HandleClickNotifs}>
    <span>
 
    <i   className="uil uil-heart"  >
    <span className="icon material-symbols-outlined">
     {"favorite"}  
      </span>
<div className={`${notifs  ? "em-notifs" : ""}`}>
      </div>
      </i>
       <span> 
       </span>
    </span>
  </button>

       {notifMessage && <div className="error"> {notifMessage} </div>}
       { OpenNotifs ? (
    <div className="Notif-Card">

  {invites.map(c => < Notifs  key = {c.id} notifs ={c} />)}

        {/* <Notifs notifs={invites}/> */}
    </div>

       ) : (
        <>
        </>
       )  }
         

                     {isShown && ( 
                        
                      //Show the friendlist only if button is pressed
                      // Here : Send an array.map of the Friendlist of the user 
                      // get request to backend , JSON object -> parse 
                      <>
                    {allgood ? (
                      <>
                        <div className='Contact'>
                        <span>
                        
                        <ContactList contacts={friends} />
                        </span>
                      </div>
                      </>
                    ) : (
                      <>
                      </>
                    )}
                    
                      </>
                     )}
                  <button type="button" onClick={LogUserOut} style={{bottom:0}}>
                    <span className="icon material-symbols-outlined">
     {"logout"} 
      </span>
      <span> Log out</span>
                  </button>
                </nav>
              </div>
            </nav>
            </div>
             </div>
              {/* ) : (
              <div>
                </div>
              )}</div> */}
               
        
 
    
    </nav>
    
    
    )
}

export default Navbar