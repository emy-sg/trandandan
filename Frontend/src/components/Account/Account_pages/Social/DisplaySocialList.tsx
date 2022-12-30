import { useState } from 'react';

import './DisplaySocialList.css'

const DisplaySocial = (props) => {

	// const [OpenMsg, SetOpenMsg] = useState(false);
    // const [Dmcount,SetDmCount] = useState(-1);
    const [errorMessage,setErrorMessage] = useState("");


async function BlockRelationship()
{
   let endpoint = process.env.REACT_APP_BACK_URL + "/player/blockFriendship/"


    // console.log("BlockRelation  => " + endpoint + " \n user" + props.Friends.nickname)
    //  setAction("");
    endpoint = endpoint + props.Friends.nickname;
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
        setErrorMessage("An error occured! Can't Block Relationship    ! ");
        return error;
      })
}
    const HandleBlock = (e) => {
        e.preventDefault();
        // console.log("Blocking this user ...." + props.Friends.nickname);
        BlockRelationship();
    } 
//     const HandleOpenMsg = (e) => {
//         e.preventDefault();
//         SetOpenMsg(!OpenMsg)
       
// if(!OpenMsg)
// {
//     // let tt = Dmcount + 1;
//     let tt = parseInt(localStorage.getItem("Dmcount")!);
//     // const tt = Dmcount + 1;
    
//      tt = tt + 1;
//     // console.log(" TRUE " + tt);
//     SetDmCount(tt);
//     // let tt = parseInt(localStorage.getItem("Dmcount")!);
//     // console.log("Parsed => "  + tt);
//     // tt = tt - 1;
//     // console.log(" => "  + tt);

//     localStorage.setItem("Dmcount",(tt).toString());
//     // var = var  - 1;
//     // localStorage.setItem("Dmcount",var.toString());
// }

// if(OpenMsg)
// {
//        const tt = Dmcount - 1
//     // tt = tt - 1;
//     SetDmCount(tt);
//     // console.log(" FALSE "   + tt);
//     // localStorage.setItem("Dmcount",(tt).toString());
// }

//     SetOpenMsg(!OpenMsg);

//     }
    return (
        <>

        <ul className='SocialList'>
            <li>
        <ul>  </ul>
    {errorMessage && <div className="error"> {errorMessage} </div>}
        <span>{props.Friends.nickname}          </span>
         <img className="avatar" src={props.Friends.avatar} alt="FriendAvatarSocial" />
      
      <button type="button" id="ss" className='ButtonSocial-block' onClick={HandleBlock}>
    <span className="icon material-symbols-outlined">
     {"block"}  
      </span>

      </button>


      </li>
      <li>
        
      </li>
        </ul>
        </>
    )
}

export default DisplaySocial;