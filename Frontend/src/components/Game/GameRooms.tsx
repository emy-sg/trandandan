import { useState } from "react";

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

export default function GameRooms(props: any) {
  const [rooms, setRooms] = useState<any>([]);

  return (
    <>
      <h1>Game Rooms</h1>
      {rooms.forEach((room: any) => {
        <div className="room__name" onClick={(props.roomId = room.idRoom)}>
          {room.player_1} VS {room.player_2}
        </div>;
      })}
    </>
  );
}
