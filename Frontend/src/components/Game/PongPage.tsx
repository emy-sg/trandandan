import React, { useState }  from 'react';
import Game from '../Game/Game'

export type IroomsPong = {
  gameId : number,
  playerLeft: {
    name: string;
    score: number;
  };
  playerRight: {
    name: string;
    score: number;
  };
};

const Pong = () => {
  const [roomId, setRoomId] = React.useState(0);
  return (
    <>
    <div className='game-canvas'>
      {!roomId && <Game width = "600" height="400" />}
    </div>
    </>
  );
};

export default Pong;