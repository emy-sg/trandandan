// import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom';
import ProfilePicUpload from '../Account/ProfilePicUpload';
import UpdateNickname from '../Account/UpdateNickname';
import './Account.css'
import { Link } from 'react-router-dom';
// import Login from '../login/login';
import DisplayAchievementsList from './Account_pages/Achievements/DisplayAchievementsList';
import DisplayMatchHistory from './Account_pages/DisplayMatchHistory';

import axios from 'axios';
import { IsAuthOk } from "../../utils/utils";
const Account = () => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
    const [Updated, setisUpdated] = useState(false);
	 const [user42,SetUser42] = useState <any>([]);
  const [showradiotwofa,Setradiotwofa] = useState(false);
  const [twoFa,setTwoFa] = useState(false);
  const [TwoFaDisable,setTwoFaDisable] = useState(false);
  const [TwoFaEnable,setTwoFaEnable] = useState(false);
  const [msg, setMsg] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [TwoFaMessage, setTwoFaMessage] = useState("");


const [AchievementsList,setAchievementsList] = useState<any>([])
const [minihistory,setMiniHistory] = useState<any>([])

async function FetchGameHistory() {

   const loggeduser = localStorage.getItem("user");
  if (loggeduser) {
    const current = JSON.parse(loggeduser);
    // console.log("Fetching Game History Of this User :        => " ,current.nickname)


    await fetch((process.env.REACT_APP_BACK_URL + `/player/gameHistoryById/${current.nickname}`
    ), {
      // mode:'no-cors',
      method: 'get',
      credentials: "include"
    })



      .then((response) => response.json())
      .then(json => {
        // console.log("The gameHistoryById is => " + JSON.stringify(json))
        IsAuthOk(json.statusCode)
        if(String(json.statusCode) === "404")
        {
        setErrorMessage(json.message);
        
        }

        else
        {
          if(json.history)
          {
            // if(json.history[0])
          setMiniHistory(json.history)
          }
        }
      

      

        return json;
      })
      .catch((error) => {
        // console.log("An error occured : " + error)
        // setRelation("error");
        setErrorMessage("An error occured! gameHistoryById not found ! ");
        return error;
      })

  }
}

async function FetchAchivementsList  ()  {
  const loggeduser = localStorage.getItem("user");
  if (loggeduser) {
    const current = JSON.parse(loggeduser);
    // console.log("Fetching AchievementsList  Of this User :        => " ,current.nickname)


    await fetch((process.env.REACT_APP_BACK_URL + `/player/achivement/${current.nickname}`
    ), {
      // mode:'no-cors',
      method: 'get',
      credentials: "include"
    })



      .then((response) => response.json())
      .then(json => {
        // console.log("The AchievementsList is => " + JSON.stringify(json))
 
        
        if(json.getAchivements)
        {
        setAchievementsList(json.getAchivements);

        }

        if(json.statusCode === "404")
        {
        setErrorMessage(json.message);

        }

        return json;
      })
      .catch((error) => {
        // console.log("An error occured : AchievementsList " + error)
        // setRelation("error");
        // setErrorMessage("An error occured! gameHistoryById not found ! ");
        return error;
      })

  }
}
  useEffect(() => {

    // const authenticated = localStorage.getItem("authenticated");
  const loggeduser = localStorage.getItem("user");
 

    if(loggeduser)
    {

      var Current_User = JSON.parse(loggeduser);
      // console.log("=>>>>> FROM THE ACCOUNT " + loggeduser   + Current_User.nickname + Current_User.UserId)
      if(Current_User.tfa)
      {
        console.log("two FA is ACTIVATED ! ")
        setTwoFaMessage("Two Factor Authentification is activated !")
        setTwoFaDisable(true);
        setMsg("Disable two FA.");
        setTwoFaEnable(false);

      }
      else
      {
        console.log("two FA is NOT ACTIVATED ! ")
        setTwoFaMessage("Two Factor Authentification is not activated !")
        setMsg("Activate two FA.");
        setTwoFaEnable(true);
        setTwoFaDisable(false);
        // setTwoFa(true);
      }
      SetUser42(Current_User);
    
    FetchGameHistory();
    FetchAchivementsList();
    // setMiniHistory(minihisto);
      
    }

    
    // console.log("I am navigating =>>> ");
    // navigate('/Account');
    //  const {UserId,usual_full_name} = user42;

    },[]);

  
  
    const HandeAchievements = (e) => {

      e.preventDefault();
      // console.log("From Handle Achievements  ")
        navigate('/Achievements')
    };


     const handleFriendClick = (e) => {
      e.preventDefault()
      // console.log("From Friend Click");
      navigate("/Social");
      
     }
     const HandleTwoFactor = () => {
        // if(!showradiotwofa)
      // {
      //   setErrorMessage("An Error occured");
      // }
      Setradiotwofa(!showradiotwofa);
      
    
      // Here Request to GET Two FA if enable or not Ou je lai deja
    }
    const HandleTwoFa = () => {
      // Setradiotwofa(!showradiotwofa);
      // Here Request to GET Two FA if enable or not Ou je lai deja
      setTwoFa(!twoFa);
      setTwoFaDisable(false);
    }

    const DisableTwoFa = () => {
      // Setradiotwofa(!showradiotwofa);
      // Here Request to GET Two FA if enable or not Ou je lai deja
      setTwoFaDisable(!TwoFaDisable);
      setTwoFa(false);
    }

async function EnableTwoFa () {


  
  

  const text = process.env.REACT_APP_BACK_URL + "/player/2fa/enable/" ;
  // console.log("/2fa/enable Link :  =>  " + text);
  let loggedUser = localStorage.getItem("user");
  if(loggedUser)
  {
  await axios.get(text,{withCredentials:true}
    // mode:'no-cors',
    // method:'get',
    // credentials:"include"
  )

// .then((response) => response.json())
.then(json => {
    // json.data.id = params.id;
  console.log("The /2fa/enable esp : " + JSON.stringify(json.data));
  IsAuthOk(json.data.statusCode);
  if (String(json.data.statusCode) === "404")
  {
    setErrorMessage(json.data.message)
  }
  else
  {
    const current = JSON.parse(localStorage.getItem("user")!);
    const NewUser = [
      {
        id:current.id,
        nickname:current.nickname,
        avatar:current.avatar,
        firstName:current.firstName,
        lastName:current.lastName,
        email:current.email,
        wins:current.wins,
        loses:current.loses,
        tfa:true,
        tfaSecret:current.tfaSecret
      }
    ]
    console.log("USER : " + JSON.stringify(NewUser[0]))
  localStorage.setItem("user",JSON.stringify(NewUser[0]));
  window.location.reload();
  }
 


   
})
.catch((error) => {
  setErrorMessage("An error occured ! .");

    // console.log("An error occured  while fetching the /2fa/enable  : " + error)
    return error;
})
}
}


async function SendDisableTwoFa () {


  
  

  const text = process.env.REACT_APP_BACK_URL + "/player/2fa/disable/" ;
  // console.log("/2fa/disable Link :  =>  " + text);
  let loggedUser = localStorage.getItem("user");
  if(loggedUser)
  {

  await axios.get(text,{withCredentials:true}
    // mode:'no-cors',
    // method:'get',
    // credentials:"include"
  )

// .then((response) => response.json())
.then(json => {
    // json.data.id = params.id;
  console.log("The /2fa/disable esp : " + JSON.stringify(json.data));

  const current = JSON.parse(localStorage.getItem("user")!);
  const NewUser = [
    {
      id:current.id,
      nickname:current.nickname,
      avatar:current.avatar,
      firstName:current.firstName,
      lastName:current.lastName,
      email:current.email,
      wins:current.wins,
      loses:current.loses,
      tfa:false,
      tfaSecret:current.tfaSecret
    }
  ]
  console.log("USER : " + JSON.stringify(NewUser[0]))
localStorage.setItem("user",JSON.stringify(NewUser[0]));
window.location.reload();

   
})
.catch((error) => {
  setErrorMessage("An error occured ! .");

    // console.log("An error occured  while fetching the /2fa/disable  : " + error)
    return error;
})
  }
}

    const SendTwoFa = (e) => {
      e.preventDefault();
      // Setradiotwofa(!showradiotwofa);
      // Here Post Request  Of Two FA 
      //if enable or not Ou je lai deja
      if(twoFa)
      {
        // setErrorMessage("POSTIF CHEF ENABLING")
        setIsUpdating(true);
        EnableTwoFa();

        setTimeout(() => {
          setIsUpdating(false);
          setisUpdated(true);
          setTimeout(() => setisUpdated(false), 2500);
        }, 2000);
      }
      else
      {
        // setErrorMessage("NEGATIF CHEF DISABLE")
        setIsUpdating(true);
        SendDisableTwoFa();
        setTimeout(() => {
          setIsUpdating(false);
          setisUpdated(true);
          setTimeout(() => setisUpdated(false), 2500);
        }, 2000);
      }

    // }
    }

    //ProfilePicUpload : Send User infos here  Get from state ?
    return (
      <div>
        
<>

<div className='body'>
      <div className='Account-card'>
		  <img className="avatar" src={user42.avatar} alt="avatar" />
        Welcome to your Dashboard  {user42.nickname} ! 
        <br/>
      <button type="button" className='has-border' onClick={HandleTwoFactor}>  
      <span className="icon material-symbols-outlined">
     {"Lock"}  2FA      </span> 
      </button>
      {showradiotwofa ? (
          <>
                {TwoFaMessage && <div className="error"> {TwoFaMessage} </div>}
		<form className='AccountTwoFa-form'>
        {TwoFaEnable ? (
          <>
     <input type="radio"
        value ="Enable"
       placeholder="Room Name " 
       checked = {twoFa}
       onChange={HandleTwoFa}
       />
       Enable
       
       {twoFa ? (
        <>
               <button
			   type="submit"
      onClick={SendTwoFa}
      className={isUpdating || Updated ? "sending" : ""}
    >
      <span className="icon material-symbols-outlined">
        {Updated ? "Priority" : "send"}
      </span>
      <span className="text">
        {isUpdating ? "Updating ..." : Updated ? "Updated" : msg}
      </span>
    </button>

{/* {done ? (
  <>
      <QRCode
        id="qrCodeEl"
        size={150}
        value={QRcodeText}
      />
  </>
) : (
  <>
  </>
)} */}

        </>
       ) : (
        <>
        </>
       )}
          </>
        ) : (
          <>
   
       <input type="radio"
        value ="Disable"
       placeholder="Room Name " 
       checked = {TwoFaDisable}
       onChange={DisableTwoFa}
       />
       Disable

{TwoFaDisable ? (
  <>
  <button
			   type="submit"
      onClick={SendTwoFa}
      className={isUpdating || Updated ? "sending" : ""}
    >
      <span className="icon material-symbols-outlined">
        {Updated ? "Priority" : "send"}
      </span>
      <span className="text">
        {isUpdating ? "Updating ..." : Updated ? "Updated" : msg}
      </span>
    </button>
  </>
) : (
  <>
  </>
)}
       
          </>
        )}
    
 

      
                {errorMessage && <div className="error"> {errorMessage} </div>}
        </form>
          </>
      ) : (
          <>
          </>
        )}
        <div className='AccountButtons'>
      <button type="button" className='' onClick={handleFriendClick}>  
         <span className="icon material-symbols-outlined">
     {"People"}  Social
      </span>
      </button>
 

      </div>
        <UpdateNickname
        />
      <ProfilePicUpload/>
          </div>
          <br/>
          <div className='intra-card'>
          <div className='last-Achievements-card'>
          <button type="button" className='has-border' onClick={HandeAchievements}>  
      <span className="icon material-symbols-outlined">
     {"military_tech"}  
      </span> 
      <span>See All Achievements</span>
      </button>
      <span>{AchievementsList.map(c => < DisplayAchievementsList  key = {c.id} AchievementsList ={c} />)}</span>
            </div>
            <div className='LastMatch-card'>
            <button type="button" className='' >  
      <span className="icon material-symbols-outlined">
     {"History"}  
      </span> 
      <Link style={{color:'blue'}} to={`/Carreer/${user42.nickname}`} >
   <span> See All </span>
    </Link>
      </button>
      <span>{minihistory.map(c => < DisplayMatchHistory  key = {c.id_game_history} match ={c} />)}</span>

            </div>
          </div>
          </div>
</>
      </div>
    );
    }
  
export default Account;
