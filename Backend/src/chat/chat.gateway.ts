

import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

//get the client id by jwt token
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { PlayerService } from "src/player/player.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


function getIdUserFromToken(cookie: string) {

	if (!cookie) {
		// if the user not connected with intranet return null
		return null;
	}
	const cookieArray = cookie.split(';');
	const cookieObject = {};

	if (cookieArray.length === 0)
		return null;

	cookieArray.forEach((cookie) => {
		const cookieKeyValue = cookie.split('=');
		cookieObject[cookieKeyValue[0]] = decodeURIComponent(cookieKeyValue[1]);
	}
	);

	// get user id from jwt token
	const token = cookieObject['auth-cookie'];
	const tokenArray = token.split('.');
	const tokenObject = JSON.parse(atob(tokenArray[1]));

	return (tokenObject);
}

//

// @UseGuards(AuthGuard('jwt'))
@WebSocketGateway({
	namespace: "chat",
	cors: {
		origin: "*",
	},
})
export class ChatGateway {
	@WebSocketServer() wss: Socket;
	private roomPrefix = 'roomSocket';
	private allRooms = {};

	constructor(private readonly playerservice: PlayerService) { }

	async handleConnection(client: Socket, ...args: any[]) {
		// emyconsole.log("Client connected", client.id);

		// let userLog = getIdUserFromToken(client.handshake.headers.cookie)

		// discconnect socket
		// if(!userLog){
		//   this.wss.to(client.id).emit("EventAlmerdi", "You are not connected");
		//   client.disconnect(); 
		//   return;
		// }

		// get user id from jwt token from frontend
		// userLog = { id: "3c2d8759-126c-4d2a-b8bb-83475c0b8e63", nickname: "mlabrayj" }


		// const allrooms = await this.playerservice.getAllRooms(userLog.id);
		// let allmsgs = [];

		// // room
		// for (let room of allrooms) {
		// 	let roomId = this.roomPrefix + room.id;
		// 	client.join(roomId);

		// 	const msgofroom = await this.playerservice.getMessagesOfRoom(userLog, room.id);

		// 	allmsgs.push({
		// 		...room,
		// 		messages: msgofroom,
		// 	});
		// }

		// console.log('ALL ROOMS WITH MSGS ', allmsgs[0]);

		// this.wss.to(client.id).emit("La7sen", allmsgs); // listen to this event in frontend to get all rooms with messages fot the fisrt time connection
	}

	@SubscribeMessage("joinroom")
	async handleJoinRoom(client: Socket, data: any): Promise<void> {
		// emyconsole.log("joinroom", data);

		// validate user object passed in data
		if (!data.user)
			return;
		const user = await this.playerservice.findPlayerById(data.user.id);
		// exception if user not found
		if (!user)
			return;

		//emyconsole.log('SOCKET JOIN', data);

		// validate room object passed in data
		if (!data.room)
			return;
		// join room
		const room = await this.playerservice.getRoomById(data.user.id, data.room);
		if (!room)
			return;

		const perm = await this.playerservice.getPermissions(user.id, data.room);
		if (perm.is_banned)
			return;

		// client.join(this.roomPrefix + data.room);
		//create un array of rooms

		if (!this.allRooms[this.roomPrefix + data.room])
			this.allRooms[this.roomPrefix + data.room] = [];
		this.allRooms[this.roomPrefix + data.room].push({ userId: user.id, socket: client.id });
		// console.log('ALL ROOMS', this.allRooms);

	}

	@SubscribeMessage("newmessage")
	async handleMessage(client: Socket, data: any) {
		// emyconsole.log("Message received", data); //data contains the message sent and room from client (frontend)

		// 
		// ALWAYS - VALIDATION
		// 
		// let userLog:any // = getIdUserFromToken(client.handshake.headers.cookie)
		// discconnect socket
		// if(!userLog){
		//   this.wss.to(client.id).emit("EventAlmerdi", "You are not connected");
		//   client.disconnect(); 
		//   return;
		// }

		// IF ROOM EXISTS
		if (!data.room)
			return;
		const room = await this.playerservice.getRoomById(data.user.id, data.room);
		if (!room) {
			// if user is member
			return;
		}

		// ALWAYS - VALIDATION
		// 

		// user: Current_User, msgTxt: inputMsg, room: props.room.id

		const newMessage = await this.playerservice.sendMessageinRoom(data.user.id, data.msgTxt, data.room);
		// const oldMessage = await this.playerservice.getMessagesOfRoom(data.user.id, data.room);

		if (!newMessage) {
			return;
		}

		/*
		{
			id          Message Id
			sender      Player
			senderId    Id Player
			msg         Text
			createdAt   Time
		}
		*/


		//jdid
		// for(var sck of this.roomPrefix){
		// 	// if user muted
		// 	if(data.user.muted || data.user.banned){
		// 		throw new WsException ("You are muted or banned");
		// 	}
		// 		this.wss.to(sck + data.roomId).emit("addmsg", 
		// 		{
		// 			sender:{
		// 				id: data.user.id,
		// 				avatar: data.user.avatar,
		// 				nickname: data.user.nickname
		// 			},
		// 			message: newMessage // event name 
		// 		});
		// }

		//get users in room
		// const users = await this.playerservice.getAllMembersOfThisRoom(data.user.id, data.room);
		// const numUsers = users ? users.length : 0;
		// for(const user of users){
		// 	const usersocket 

		// var MutedUsers = [];
		// var userPermissions = await this.playerservice.getPermissions(data.user.id, data.room);
		// if(userPermissions.statusMember == "muted"){
		// 	MutedUsers.push(data.user.id);
		// }
		// console.log(await this.playerservice.getPermissions(data.user.id, data.room));
		// console.log(userPermissions.statusMember);
		//9dima

		const BlockFriends = [];

		const all_member = await this.playerservice.getAllMembersOfThisRoom(data.user.id, data.room);
		// console.log("all_member", all_member);
		for (const member of all_member) {
			const fid = await this.playerservice.findPlayerById(member);
			const fs = await this.playerservice.getFriendshipStatus(data.user.id, fid.nickname);
			// console.log("fs", fs);
			if (fs && fs.status == "Block")
				BlockFriends.push(fid.id);
		}

		for (var sck of this.allRooms[this.roomPrefix + data.room]) {

			// const BFriends = [];
			// const all_members = await this.playerservice.getAllMembersOfThisRoom(sck.userId, data.room);
			// for (const member of all_members) {
			// 	const fs = await this.playerservice.getFriendshipStatus(sck.userId, member.nickname);
			// 	if (fs.status == "Block")
			// }

			const perm = await this.playerservice.getPermissions(sck.userId, data.room);
			if (!perm.is_banned && !BlockFriends.includes(sck.userId)) {
				// console.log("perm", perm, "sck", sck);

				this.wss.to(sck.socket).emit("addmsg",
					{
						sender: {
							id: data.user.id,
							avatar: data.user.avatar,
							nickname: data.user.nickname,
						},
						// OldMessages: oldMessage,
						// muteduser: MutedUsers,
						message: newMessage // event name 
					});
			}
		}



		// this.wss.to(this.roomPrefix + data.room).emit("addmsg",
		// 			{
		// 				sender: {
		// 					id: data.user.id,
		// 					avatar: data.user.avatar,
		// 					nickname: data.user.nickname,
		// 				},
		// 				// OldMessages: oldMessage,
		// 				// muteduser: MutedUsers,
		// 				message: newMessage // event name 
		// 			});


	}

	// @SubscribeMessage("message")
	// handleMessage(client: Socket, payload: any): void {
	// 	console.log("Message received", payload);
	// 	this.wss.to(client.id).emit("EventAlmerdi", payload);
	// }

	async handleDisconnect(client: Socket) {
		// emyconsole.log("Client disconnected", client.id);
	}
}