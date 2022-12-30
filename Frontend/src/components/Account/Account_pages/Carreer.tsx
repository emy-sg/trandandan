import { useState } from 'react';
import { useEffect } from 'react';
import'./Carreer.css'
import DisplayMatchHistory from './DisplayMatchHistory';
import { useParams } from 'react-router-dom';
import { containsSpecialChars } from '../../../utils/utils';
const Carreer = () => {
    // const [user42,SetUser42] = useState<any>([]);
    const [MatchHistory,setMatchhistory] = useState<any>([]);
    const [done,setDone] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");


    async function FetchGameHistory() {

      const loggeduser = localStorage.getItem("user");
     if (loggeduser) {
      //  const current = JSON.parse(loggeduser);
      //  console.log("Fetching Game History Of this User : from caarreer         => " ,current.nickname)
   
    const nickname = params.id;
    console.log("Nickname from params : ",nickname)
    
       await fetch((process.env.REACT_APP_BACK_URL + `/player/gameHistoryById/${nickname}`
       ), {
         // mode:'no-cors',
         method: 'get',
         credentials: "include"
       })
   
   
   
         .then((response) => response.json())
         .then(json => {
          //  console.log("The gameHistoryById is => " + JSON.stringify(json))

          if(String(json.statusCode) ==="404")
          {
           console.log("404")
          setErrorMessage(json.message);
  
          }
          else
          {
            if(json.history)
            {
           //  setMiniHistory(json.history)
         setMatchhistory(json.history);
         setDone(true);
 
            }
          }
        
   
        
   
           return json;
         })
         .catch((error) => {
          //  console.log("An error occured : " + error)
           // setRelation("error");
          //  setErrorMessage("An error occured! gameHistoryById not found ! ");
           return error;
         })
   
     }
   }
  
  const params = useParams();
    useEffect(() => {
  const loggeduser = localStorage.getItem("user");
    
  if(loggeduser)
  {
    // var Current_User = JSON.parse(loggeduser);
    // console.log("=>>>>> FROM THE ACCOUNT " + loggeduser   + Current_User.nickname + Current_User.UserId)
    
    // SetUser42(Current_User);
    // if(containsSpecialChars2)
    const nickame = params.id;
    if (containsSpecialChars(nickame))
    {
      setErrorMessage("Invalid user nickname  ! ")
    }
    else
    {
      FetchGameHistory();

    }
    // Request to Backend pour avoir lhistorique des match du User , en fonction de son id ? 

}
 // eslint-disable-next-line
    },[])

    return (
        <>
           <div className='body'>
      <div className='carreer-card'>
        <h3>Game History  </h3>
        {errorMessage && <div className="error"> {errorMessage} </div>}
      <span>{MatchHistory.map(c => < DisplayMatchHistory  key = {c.id_game_history} match ={c} />)}</span>
      {done ? (
        <>
        </>
      ) : (
        <>
        No Game  found for this user.

        </>
      )}
      </div>
      </div>
        </>
    )
}

export default Carreer;