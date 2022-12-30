import React from "react";

import Contact from "./Contact";
import { useState ,useEffect} from "react";
import './ContactList.css'
import SearchBar from '../users/SearchBar'

const ContactList = (props) => 
{

    const [user42,SetUser42] = useState<any>([])
    const [contacts ,setContacts] = useState <any>([]);
    useEffect(() => {
        const loggeduser = localStorage.getItem("user");
    
        if(loggeduser)
        {
          var Current_User = JSON.parse(loggeduser);
          SetUser42(Current_User);
          setContacts(props.contacts);
        }
        // eslint-disable-next-line
    },[]);


    const handleSelect = (e) => {
        // e.code == "select"
        e.preventDefault();
        // console.log("inside Handle Select ",localStorage.getItem("Dmcount"));
      };

    return (
        
        <div className="FriendList-container">
        
             <div className="search">
          <SearchBar/>
      {user42 && (
        <div className="userChat" onClick={handleSelect}>
          <div className="userChatInfo">
       
            <span>{contacts.map(c => < Contact  key = {c.nickname} user ={c} />)}</span>

          </div>
        </div>
      )}
    </div>
</div>
    );
};
export default ContactList;