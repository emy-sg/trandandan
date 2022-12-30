import { useState } from 'react';
import './UpdateNickname.css'
import { containsSpecialChars } from '../../utils/utils';

const UpdateNickname = () => {

    const [nickName,setNickName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [Updated, setisUpdated] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
  
  async function UploadNickname ()  {
    
    const loggeduser = localStorage.getItem("user");
  
    if(loggeduser)
  {
   let  text = (process.env.REACT_APP_BACK_URL + "/player/update/nickname" );

    // console.log("Uploading the nickname ! of this user  + " +  current.nickname +  " + New Nickname " + nickName);
        await fetch(text,{
      // mode:'no-cors',
      method:'post',
      credentials:"include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
          { 
        nickname: nickName,
      }
          )
  })
  
  .then((response) => response.json())
  .then(json => {
      // console.log("The updateNickname Resp   is => " + JSON.stringify(json))
      // IsAuthOk(json.statusCode)
      if( String(json.statusCode)=== "404")
        {
          setErrorMessage(json.message)
        }
    else  if(String(json.statusCode) === "401")
     {
      setErrorMessage(json.message);
     }
    // else if (String(json.statusCode) === "401")
    // {
    //   setErrorMessage(json.message)
    // }
    else
    {
      const test  = JSON.stringify(json);

      // console.log("The Resp Of Update Nickname is  => " + test);
      localStorage.setItem("user","");
      localStorage.setItem("user",test);
      // console.log("Update Nick=>     " + JSON.stringify(UpdatedUser));
      setTimeout(() => {
        setIsUpdating(false);
        setisUpdated(true);
        setTimeout(() => setisUpdated(false), 2500);
        window.location.reload();
     
      }, 2000);
    }
    // navigate('/Landing')
    // window.location.reload();
      return json;
  })
  .catch((error) => {
      // console.log("An error occured : " + error)
      return error;
  })
}

  
  };
    const UpdateNickname = (e) => {
        e.preventDefault();
        // console.log("Hello from update nickname")
       if(nickName)
       {
     if(nickName.length > 2 && nickName.length < 10)
    {  
      if(containsSpecialChars(nickName))
      {
        console.log(" THERE IS SOME SPECIAL CHARS ! ")
        setErrorMessage("Your nickname must contain only characters or numbers. ,")
      }
      else
      {
        console.log(" NO  SPECIAL CHARS ! ")

        setIsUpdating(true);
        UploadNickname()
      }
  
    }
      else
      {
        setErrorMessage("Your nickname must contain between 3 and 9 characteres")
      }
        
      
      
      }
      else
      {
        setErrorMessage("Please chose a valid nickname !")
      }
    };

    return (
        <>
        <form className='UpdateNickname-form'>
       <br>
       </br>
       <div className='ProfilePic-textBox'>
        <input type="text"
       className={`${nickName ? "has-value" : ""}`}
	   id="textbox"
       onChange={event => setNickName(event.target.value)}
       value={nickName || ""}
       />
<label htmlFor='textbox'> Nickname</label>
</div>
         <button
      onClick={UpdateNickname}
      className={isUpdating || Updated ? "sending" : ""}
    >
      <span className="icon material-symbols-outlined">
        {Updated ? "check" : "send"}
      </span>
      <span className="text">
        {isUpdating ? "Updating ..." : Updated ? "Updated" : "Update Nickname"}
      </span>
    </button>
    {errorMessage && <div className="error"> {errorMessage} </div>}
      
       </form>
        </>

    );

};

export default UpdateNickname;