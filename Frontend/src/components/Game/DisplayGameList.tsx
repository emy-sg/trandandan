import React from "react";
import { Link } from "react-router-dom";

const DisplayGameList = (props:any) => {

    // console.log("the props is : ",props)
    return(
        <>
            <ul className="chat-room-list">
                <li>
         <Link to={`/SpectateGame/${props.game.id}`}> {props.game.player_left.id} VS {props.game.player_right.id}</Link> 
                </li>
            </ul>
        </>
    )
}

export default DisplayGameList;