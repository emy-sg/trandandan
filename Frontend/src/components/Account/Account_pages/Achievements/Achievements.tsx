import { useState,useEffect } from 'react';
import { IsAuthOk } from '../../../../utils/utils';
import './Achievements.css'
import DisplayAchievementsList from './DisplayAchievementsList';
const Achievements = () => {
const [AchievementsList,setAchievementsList] = useState<any>([])
const [errorMessage, setErrorMessage] = useState("");

    async function FetchAchivementsList  ()  {
        const loggeduser = localStorage.getItem("user");
        if (loggeduser) {
          const current = JSON.parse(loggeduser);
          // console.log("Fetching AchievementsList  Of this User : Inside Achievements Page         => " ,current.nickname)
      
      
          await fetch((process.env.REACT_APP_BACK_URL + `/player/achivement/${current.nickname}`
          ), {
            // mode:'no-cors',
            method: 'get',
            credentials: "include"
          })
      
      
      
            .then((response) => response.json())
            .then(json => {
              // console.log("The AchievementsList is => " + JSON.stringify(json))
       
              
              IsAuthOk(json.statusCode)
              if(String(json.statusCode) === "404")
              {
              setErrorMessage(json.message);
      
              }
              else
              {
                if(json.getAchivements)
                {
                setAchievementsList(json.getAchivements);
        
                }
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
    const loggeduser = localStorage.getItem("user");
    if (loggeduser)
    {
   
    FetchAchivementsList();
        
    }

},[])


    return (
        <>
        <div className='body'>
            <div className='Achievements-card'>
    {errorMessage && <div className="error"> {errorMessage} </div>}
      <span>{AchievementsList.map(c => < DisplayAchievementsList  key = {c.id} AchievementsList ={c} />)}</span>

            </div>
        </div>
        </>

    );
};

export default Achievements;