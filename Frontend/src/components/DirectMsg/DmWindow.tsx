import react from 'react';
import { useState ,useEffect} from "react";
import './DmWindow.css'
import MessageList from './MessageList';

const DmWindow = (props) => {
	const [Msg, setMsg] = useState("");
    const [click,SetClick] = useState(false);
    const [NbrPos,SetNbrPos] = useState(0);
    //Fetch Message History from backend , for the  Contact inside the prop , Get the correct User using the state 
    const [count,SetCount] = useState<any>("");
    const [OpenDmBox,SetOpenDmBox] = useState(true);
    const MsgHistory = [
        {id:0,userId:50213,username:"narjdal",msg:"salut"},
        {id:1,userId:50213,username:"narjdal",msg:"ca va"},
        {id:2,userId:999,username:"test",msg:"oui et toi "},
        {id:3,userId:50213,username:"narjdal",msg:"on fait une game "},
        {id:4,userId:999,username:"test",msg:"vasy "},
        {id:5,userId:50213,username:"narjdal",msg:"Go"},
        {id:6,userId:50213,username:"narjdal",msg:"Go"},
        {id:7,userId:50213,username:"narjdal",msg:"Go"},
    ];
    const [HistoryMsg,SetHistory] = useState([]);
    // console.log("PROPS : " + props + props.contact.name + props.id)
    const SendMsg = (event) => {
        event.preventDefault();
        // console.log("Your DM IS " + event.target[0].value);

    };
    useEffect (() => {
        const vrcount = localStorage.getItem("Dmcount");
    // console.log("vrcount =>> " + JSON.stringify(vrcount));
        // SetClick
        // SetNbrPos(NbrPos + 1)
    // console.log("NbrPos =>> " + NbrPos);
        SetCount(vrcount);
    //     console.log("Inside count !" + count);
    // SetCount(count + 1);
    // if(count == 1)
    // SetCount(0);
    },[]);
    const HandleOpenDmBox = () => {
SetOpenDmBox(!OpenDmBox);
    };
    var MsgList =[...MsgHistory];
    return (
        
        <div>
            {OpenDmBox ? (
        <div className={count == "0" ? ("DmBox") : ( count == "1" ? ("SecondBox") : ("ThirdBox"))}>
        <div className='DmHeader'>
    <button onClick={HandleOpenDmBox}>  
    <span>
        {props.contact.name}
    </span>
    </button>
    </div>
        <div className="History">
        {MsgList.map(c => < MessageList  key = {c.id} user ={c} />)}
        </div>
      <form className="DmForm" onSubmit={SendMsg}>
      <input type="text"
       className="form-control" 
       placeholder="Message:" 
       onChange={event => setMsg(event.target.value)}
       value={Msg || ""}
       />
       </form>
       </div>
            ) : (
                <div className="History">
                <div className={count == "0" ? ("DmBar") : ( count == "1" ? ("SecondDmBar") : ("ThirdDmBar")) }>
                    <button  className="DmBarButton"onClick={HandleOpenDmBox}>
                        <span> {props.contact.name} </span></button>
                 </div>
                 </div>

            )}
             
        </div>
    );
};


export default DmWindow;