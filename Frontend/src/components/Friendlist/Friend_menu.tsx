import person from "../users/users.json"
import React from 'react';

const FriendMenu = () => {
  return (
    <div>
     <li className="list-group-item">
        <strong>Name:</strong> {person[0].name}
        <br></br>
        <strong> <img src={person[0].ProfilePic}/></strong>
     </li>
    </div>
  );
};
  
export default FriendMenu;