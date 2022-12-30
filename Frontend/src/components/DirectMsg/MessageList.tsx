import { useEffect, useState } from "react";
import {Link} from'react-router-dom';



import './MesageList.css'
const MessageList = (props) => {
    const[CurrentUser,SetCurrentUser] = useState<any>([]);
    const [UserId,SetUserId] = useState("");
    const [date,setDate] = useState("");
  useEffect(() => {
    const loggeduser = (localStorage.getItem("user")!);

    if(loggeduser)
		{

		const Current_User = JSON.parse(loggeduser);
           const {id} = Current_User;
           var date = new Date(props.user.createdAt);

          //  setDate(date.getDate().toString());
var year = date.getFullYear();
var dateVal = date.getDate();
var hours = date.getHours();
var seconds = date.getSeconds();


var formattedDate = dateVal + '/' + (date.getMonth()+1) + '/' + year + '  ' + hours + ':' + seconds
setDate(formattedDate)
      // console.log("User is " + UserId +" props USER ID => "+ props.user.userId);
    SetCurrentUser(CurrentUser);
    SetUserId(id);
        }
        // eslint-disable-next-line
  }, []);
    return (   
        <div className="MsgHistory">
          
        {String(UserId) === props.user.senderId ? (
       <div className='YourMessages'>  
       <img src={props.user.sender.avatar} className="avatar1" alt="SenderAvatar"/>   

    <p>  {props.user.msg} </p>
          
    <span className="time-right"> {date}</span>
        </div>
            ):(
 <div className="OthersHistory">
    <div className='OthersMessages'>
    <img src={props.user.sender.avatar} className="avatar1" alt="SenderAvatar1" />     
 <Link style={{color:'purple',float:'left'}} to={`/users/${props.user.sender.nickname}`} >{props.user.sender.nickname} : </Link>
    <p>{props.user.msg}</p>
       
            <span className="time-left"> {date}</span>
            </div>
            </div>
            )}
            <br/>
        </div>

    );
};

export default MessageList;