import React from 'react';
import { useEffect, useState } from "react";
import SearchBar from '../users/SearchBar'
import DisplayMatchHistory from '../Account/Account_pages/DisplayMatchHistory';
import './HomePage.css'
import { IsAuthOk } from '../../utils/utils';

const Home = () => {
  const [MatchHistory,setMatchHsitory] = useState<any>([]);

async function FetchAllGamesHistory()
{
  const loggeduser = localStorage.getItem("user");
  if (loggeduser) {
    // console.log(" allGameHistory        => " )


    await fetch((process.env.REACT_APP_BACK_URL + '/player/allGameHistory/'
    ), {
      // mode:'no-cors',
      method: 'get',
      credentials: "include"
    })



      .then((response) => response.json())
      .then(json => {
        // console.log("The allGameHistory is => " + JSON.stringify(json.history))
        IsAuthOk(json.statusCode)
        if(json.history)
        {
          setMatchHsitory(json.history)
        }
    //     else
    //     {
    // setMatchHsitory(json.history)

    //     }
        return json;
      })
      .catch((error) => {
        // console.log("An error occured : " + error)
        return error;
      })

  }
}
  useEffect(() => {
    const loggeduser = localStorage.getItem("user");
    // console.log("HomePage Is User Auth ?  " + authenticated);
  
    if (loggeduser)
{

    FetchAllGamesHistory();
    
}


  }, []);
    return (
      

    <>
          <SearchBar/>
            <div className='carreer-card'>
        <h3> Global History  </h3>
      <span>{MatchHistory.map(c => < DisplayMatchHistory  key = {c.id_game_history} match ={c} />)}</span>
      </div>
      
            </>
  

    )
}
  
export default Home;