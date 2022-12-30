import { useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IsAuthOk } from '../../utils/utils';
import DisplayRoomList from './DisplayRoomList';

import './Landing.css'
function Landing() {
    const navigate = useNavigate();
    const [BackendRooms,setChatRooms] = useState<any>([]);

    const HandleClick = (e) => {
        navigate('/CreateRoom')
    };

async function GetRoomList  ()  {


  const loggeduser = localStorage.getItem("user");
  if(loggeduser)
  {
  const text = process.env.REACT_APP_BACK_URL + "/player/listOfRooms"
    // console.log("Api ListOfRooms Link :  =>  " + text);
    

    await fetch(text,{
      // mode:'no-cors',
      method:'get',
      credentials:"include"
  })
  
  .then((response) => response.json())
  .then(json => {
      // console.log("The ListOfRooms is => " + JSON.stringify(json))
    IsAuthOk(json.statusCode)
    if(String(json.statusCode) === "404")
    {
      console.log("error !")
    }
    else
    {
      setChatRooms(json);
    }
    
      return json;
  })
  .catch((error) => {
      // console.log("An error occured : " + error)
      return error;
  })

    }

  

}

      useEffect (() =>
      {
        const loggeduser = localStorage.getItem("user");
          if(loggeduser)
          {
            GetRoomList();
          }
        localStorage.setItem("members","");
      },[])

    return (
        <>
        <div className='ChatRooms-card'>
            <h2> Join a ChatRoom </h2>
           <button className='CreateChatRoom-button' onClick={HandleClick}> Create a Chat Room </button>
           <div className='Roomlist-card'>
    
      {BackendRooms.map(c => < DisplayRoomList  key = {c.id} room ={c} />)}
      </div>

            </div>
        </>
    );
}

export { Landing };