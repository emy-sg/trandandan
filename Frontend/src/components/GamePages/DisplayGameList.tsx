import React from "react";


const DisplayGameList = (props) => {

    return(
        <>
            <ul className="chat-room-list">
                <li>
                    GameList
         {/* <Link to={`/SpectateGame/${props.gameId}`}>{props.game.name}</Link>  */}
                </li>
            </ul>
        </>
    )
}

export default DisplayGameList;