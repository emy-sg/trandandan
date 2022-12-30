import { Logger } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PlayerService } from "src/player/player.service";


//handle online users in array by socket
var onlineUsers = [];

@WebSocketGateway({
	cors: {
		origin: "*",
	},
})
export class EventsGateway {

	constructor(private readonly playerservice: PlayerService) { }


	@WebSocketServer() wss: Socket;
	async handleConnection(client: Socket, ...args: any[]) {
		// //if user connected add to online users array
		// onlineUsers.push(client.id);
		// //send online users to all clients
		// client.broadcast.emit('onlineUsersFront', onlineUsers);
		// //show all online users
		// console.log(onlineUsers);
	}

	async handleDisconnect(client: Socket) {
		//if user disconnected remove from online users array
		const index = onlineUsers.findIndex((u: any) => {
			return (u.client.includes(client.id));
		});

		if (index !== -1) {
			const ind = onlineUsers[index].client.indexOf(client.id)
			if (ind !== -1) {
				onlineUsers[index].client.splice(ind, 1);
				if (onlineUsers[index].client.length === 0) {
					// client.broadcast.emit('onlineUsersFront', onlineUsers[index].user);
					// console.log("log out this is user: ", onlineUsers[index].user);
					client.broadcast.emit('onlineUsersFront', onlineUsers.filter((u) => u.client.length > 0));
				}
			}
		}
	}

	@SubscribeMessage('onlineUsersBack')
	async handleOnlineUsers(client: Socket, data: any) {

		if (!data.user || !data.user.id)
			return;
		const user = this.playerservice.findPlayerById(data.user.id);
		if (!user)
			return;
		// console.log("this is user: ", user);

		//push userid and his socketato
		// [
		// 	{
		// 	  id: 'asdfasdf', // mlabrayj
		// 	  sockets: ['asdfasdfsa', 'asdfadsfasf', 'fqertewtrwet],
		// 	},
		// 	{
		// 	  id: 'asdfas', // wldlhaj
		// 	  sockets: ['ertyyertytrey'],
		// 	}
		//   ]
		const index = onlineUsers.findIndex((u: any) => {
			return (u.user === data.user.id);
		});
		if (index === -1)
			onlineUsers.push({ user: data.user.id, client: [client.id] });
		else
			onlineUsers[index].client.push(client.id);


		//send online users to all clients
		// client.broadcast.emit('onlineUsersFront', onlineUsers.filter((u) => u.client.length > 0));
		this.wss.emit('onlineUsersFront', onlineUsers.filter((u) => u.client.length > 0));
		//show all online users
		// console.log(onlineUsers);
	}

	//handle friend request
	// @SubscribeMessage('friendRequest')
	// async handleFriendRequest(client: Socket, data: any) {
	// 	//send friend request to the user
	// 	client.broadcast.emit('friendRequest', data);
	// }
}