import {useState,useEffect} from 'react'
import './Social.css'
import DisplaySocial from './DisplaySocialList'
import { IsAuthOk } from '../../../../utils/utils'
const Social = () => {

  const[friends,setFriends] = useState <any >([]);
  const [errorMessage, setErrorMessage] = useState("");

    async function FetchUserInfo () {

        // ]
      const loggeduser = localStorage.getItem("user");
    
      if(loggeduser)
    {
      const text = (process.env.REACT_APP_BACK_URL + "/player/listOfFriends");
      // console.log("Api ListOfFriends Link :  =>  " + text);
      
  
      await fetch(text,{
        // mode:'no-cors',
        method:'get',
        credentials:"include"
    })
    
    .then((response) => response.json())
    .then(json => {
        // console.log("The response is => " + JSON.stringify(json))
        IsAuthOk(json.satusCode)
        // {
        //   window.location.reload();
        // }
        if(String(json.statusCode) === "404")
    {  
      setErrorMessage(json.message)
    }
        else
        {
        setFriends(json);
        }
    
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
      
        if(loggeduser)
        {

      FetchUserInfo()
        }
    },[])
    return (
        <>
        <div className='body'>
            <div className='Social-card'>
                <h3>Social</h3>
                {errorMessage && <div className="error"> {errorMessage} </div>}
            <span>{friends.map(c => < DisplaySocial  key = {c.id} Friends ={c} />)}</span>

            </div>
        </div>
        </>
    )
}

export default Social;