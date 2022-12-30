import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage
} from '@nestjs/websockets';
// import Pong from './pong';
import  {Game} from './entities/game.entity';

import { Socket } from "socket.io";
import { GameService } from './game.service';
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { PlayerService } from "src/player/player.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

const replacerFunc = () => {
  const visited = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return;
      }
      visited.add(value);
    }
    return value;
  };
};

@WebSocketGateway({
	namespace: "game",
	cors: {
		origin: "*",
	},
})
export class GameGateway {
  @WebSocketServer() wss: Socket;
  private roomPrefix = 'roomGameSocket';
  private PlayersInQueue: any = [];

  private PlayersLoggedIn: any = [];

  private PlayersInvited: any = [];

  private PlayersAccept: any = [];

  private PlayersInGameFromInvite: any = [];



  private PlayerInGame: Map<string, Game> = new Map();


  // private PlayerInGame: Map<string, Pong> = new Map();


  private GetPlayerNicknameFromSocket: any = [];

  private Invates: any = [];

  private InvateId : number = 0;

// private playerservice: new PlayerService();






  constructor(
    private readonly gameService: GameService) {
    }
    

  async handleConnection(client: Socket, ...args: any[]) {
    // console.log("Client Game Connected", client.id);
  }

  
  async handleDisconnect(client: Socket) {

		// console.log("Client disconnected", client.id);

    if(this.PlayersInQueue[client.id])
    {
    // console.log("This Plyaer is In Plyaer List  ... ",this.PlayersInQueue[client.id])
    await this.handleLeaveGameAsPlayer(client,this.PlayersInQueue[client.id])
    // console.log("deleting from Logged In Users ! ");
    this.PlayersLoggedIn[this.PlayersInQueue[client.id]] = null;

    this.PlayersInQueue[client.id] = null;

    // this.PlayerInGame[client.id] = 0;

    // //  console.log("BBBB")
    // this.PlayerInGame[client.id] = null;

    // this.PlayerInGame.delete(this.PlayersInQueue[client.id]);
// 
    }
    if(this.PlayersInGameFromInvite[client.id])
    {
      // console.log("This Plyaer is In PlayersInGame List  ... ",this.PlayersInGameFromInvite[client.id])
    await this.handleLeaveGameAsPlayer(client,this.PlayersInGameFromInvite[client.id])
    // console.log("deleting from PlayersInQueue List ! ");
    // console.log('-----------------------------------------------');

    // console.log("Array : ",this.PlayersInvited);
    // this.PlayerInGame[client.id] = null;
     const leaver = this.PlayersInGameFromInvite[client.id]
     const parse = JSON.parse(leaver);
    this.PlayersInGameFromInvite[client.id] = null;
    this.PlayersInvited[parse.nickname] = null;
    this.PlayerInGame[client.id] = 0;

    // this.PlayerInGame.delete(parse.nickname);
    // console.log('-----------------------------------------------');

    //  console.log( "Leaver is  : ",leaver)
    //  console.log("Array : ",this.PlayersInvited);
    //  console.log("ID SOCK : ",client.id)
    //  this.PlayersInvited[leaver.username] = null;

    }


	}

  @SubscribeMessage("newPlayer")
  async handleNewPlayer(client: Socket, user: any): Promise<void> {
    // console.log("newPlayer", client.id, user);
    this.PlayersInQueue[client.id] = user;
    // this.PlayerInGame[client.id] = user.nickname
    // console.log("cheg", user);
    const tt = JSON.parse(user);
    if (!this.gameService.findPlayerById(tt.id))
     {
      return ;
    }
    this.PlayerInGame = this.gameService.newPlayer(client,user,this.PlayersInQueue);

    // console.log('-----------------------------------------------');
    // console.log(" PLAYERS IN PlayerInGame : ",this.PlayerInGame)

    // console.log('-----------------------------------------------');
    // console.log(" PLAYERS IN PlayerInGame : ",this.PlayersInQueue)

    // console.log('-----------------------------------------------');


    return ;
    
  }


  // @SubscribeMessage("onUpdate")
  // async handleOnUpdate(client: Socket, data: any): Promise<void> {
  //   return this.gameService.onUpdate(user, data.position);
  // }

  @SubscribeMessage("update")
	async handleUpdate(client: Socket, user: any): Promise<void> {
    // console.log ("Handle update",user)
    return this.gameService.update(client, user);
	}

  @SubscribeMessage("getAllGames")
	async handleGetAllGames(client: Socket, data: any): Promise<void> {
    // let user = await this.checkUSer(data.user);
    // if (user === null)
    //   return;
    // console.log("inside get all games ",data)
    return this.gameService.getAllGames(client);
	}

  @SubscribeMessage("watchGame")
	async handleWatchGame(client: Socket, data: any): Promise<void> {
    // let user = await this.checkUSer(data.user);
    // if (user === null)
    //   return;
    // console.log("Inside Watch game !",data);
    return this.gameService.watchGame(client, data.user, data.gameId);
	}

  @SubscribeMessage("leaveGameAsPlayer")
	async handleLeaveGameAsPlayer(client: Socket, data: any): Promise<void> {
    // let user = await this.checkUSer(data.user);
    // if (user === null)
    //   return;
    // console.log("Inside Handle Leave Game",data)
    // console.log('-----------------------------------------------');

    // console.log("This Player leave the game !" ,data)
    // console.log('-----------------------------------------------');
     this.PlayerInGame = await this.gameService.leaveGameAsPlayer(client,data);
    //  console.log("Updated PlayersInGame fron LeaveGame : ",this.PlayerInGame)
    // return this.gameService.leaveGameAsPlayer(client,data);
	}

  @SubscribeMessage("AcceptGame")
  async HandleAcceptInviteGame (client : Socket,data : any): Promise<void> 
  {
    
    // console.log("Accepting the game ! ",data)

    this.PlayersInGameFromInvite[client.id] = data.user;


 this.PlayerInGame =  await this.gameService.acceptInvite(client,data.user,data.sender,this.PlayersInvited,this.PlayersAccept)
    // const parsed = JSON.parse(data.user);
    // this.PlayersLoggedIn[parsed.nickname] = client;
    // console.log("Adding To LoggedIn " , parsed)
    // const parsed = JSON.parse(data.user);
    // const nick : string = parsed.nickname

    this.PlayersInvited[data.sender] = null;
    const parsed = JSON.parse(data.user);
    const sender  : string = data.sender;


    // this.PlayerInGame[client.id] = parsed.nickname;


    let inviteeNickname  : string = parsed.nickname;
    // console.log('-----------------------------------------------');
    // // console.log("Deleting the invitation of this sender : ",sender)
    // // const text = '"user":"' + sender + '"'

    // // const result = this.Invates.includes(text)
    // // console.log("This Invates : ",result,"nick : ",sender)

    // console.log('-----------------------------------------------');
    // const obj =  this.Invates[parsed.nickname];
    // console.log( "OBJ : ",obj);

    // const invite = data.invite
    // const user =JSON.parse(data.user).nickname
    // console.log("Inviter :  : ",inviteeNickname, "sender ",sender)
    const obj = {
      invite:inviteeNickname,
      user:sender
    }

    for (var i = 0; i < this.Invates.length; i++) { 

      if (this.Invates[i].invite == inviteeNickname && this.Invates[i].user == sender)
      {
        this.Invates[i] = 0;
      }
      // console.log(" br br " , this.Invates[i])
      // console.log(xs[i]); 
    }
    // const clientobj = { user, client }
    // this.Invates[] = null;
    // this.PlayersInvited[data.user] = null;
    this.PlayersAccept[inviteeNickname] = null;



  }


  @SubscribeMessage("OnlineGameUsersBack")
  async HandleAddOnlineGameUsersBack (client : Socket,data : any): Promise<void> 
  {
    
    const parsed = JSON.parse(data.user);
    this.PlayersLoggedIn[parsed.nickname] = client;
    // if(this.Invate)
    const nick : string = parsed.nickname
    // console.log("Inside OnluneGameUsersBack")
    // console.log('-----------------------------------------------');
    const obj = {
      invite:nick
    }
    const text =  JSON.stringify(obj)

    // const result = this.Invates.find(text)
    // (customers.find(c => c.credit > 100)
    for (var i = 0; i < this.Invates.length; i++) { 

      if (this.Invates[i].invite == nick)
      {
  
      client.emit('ReceivedInvite',{
        Sendernickname : this.Invates[i].user
  
        })
      }
      // console.log(" br br " , this.Invates[i])
      // console.log(xs[i]); 
    }
  
    // console.log(" Inside ONlne UserBack :")
    let Ingame = [];

      this.PlayerInGame.forEach((game, key) => {
        Ingame.push({
          id: key,
          player_left: game.player_left,
          player_right: game.player_right,
        });
      });

    // console.log(" EMTING USERS IN GAME FROM LEFT PLAYER ",this.PlayerInGame)
    const PlayersInGameString = JSON.stringify(this.PlayerInGame, replacerFunc());

    
    client.emit('UsersInGame',{
      data :Ingame
      // data : {
      //   PlayersInGame :PlayersInGameString
      // }
      // playerLeft: PlayerLeftString,
      // playerRight:PlayerRightString,
      // data:{
      //   JSON.stringify/,
      //   playerRight
      // }
    })
    // let srch = this.Invates.filter((m: any) => {
    //   console.log(" M IS : ",m)
    //   // if (m.includes(text))
    //   // {
    //   //   console.log(" GGGGG")
    //   //   return m;
    //   // }
    //   return m.includes(text)
    // })[0] 
    // if(srch)
    // {
    //     console.log(" THIS USER  HAS PENDING INVITES   ",srch)
    // }
    // else
    // {
    //     console.log( " THIS FRIEND  HAS NO INVITES  IN ");
    // }
  //  const result =  this.Invates.filter(c => c.invite === nick)
  // console.log('-----------------------------------------------');

  // console.log("PlayersAccept : ",this.PlayersAccept)

  // console.log('-----------------------------------------------');

  // console.log("PlayersInvited : ",this.PlayersInvited)

  // console.log('-----------------------------------------------');

  
  // console.log("  : ",this.PlayersInGameFromInvite)


    // console.log("Length : " , this.Invates.length, "This Invates : ",result,"nick : ",nick,"text: ",text)
    // console.log('-----------------------------------------------');

    // console.log("This Invates : ",this.Invates,)

    // console.log('-----------------------------------------------');
  
    // console.log("Adding To LoggedIn " , parsed)

  }

  @SubscribeMessage("inviteGame")
	async handleInviteGame(client: Socket, data: any): Promise<void> {
    // let user = await this.checkUSer(data.user);
    // if (user === null)
    //   return;

    this.PlayersInGameFromInvite[client.id] = data.user;


    
    // console.log("Inside inviteGame  !",data);
    
    // this.Invates[data.invite] = data.invite;
    const invite = data.invite
    const user =JSON.parse(data.user).nickname
    this.PlayerInGame[client.id] = user;

    // console.log("User : ",user, "invite ",invite)
    const obj = {
      invite:invite,
      user:user
    }


    // const clientobj = { user, client }
    const text = JSON.stringify(obj);
    this.Invates[this.InvateId++] = obj

    return this.gameService.inviteGame(client, data.user, data.invite,this.PlayersLoggedIn);
	}


  @SubscribeMessage("UserAcceptGame")
	async HandleUserAcceptGame(client: Socket, data: any): Promise<void> {
    // let user = await this.checkUSer(data.user);
    // if (user === null)
    //   return;
    // console.log("Inside UserAcceptGame  !",data);
    const parsed = JSON.parse(data.user);
    // console.log(" : ",parsed.nickname)

    this.PlayersAccept[parsed.nickname] = {
      data,
      client
    }

    // return this.gameService.inviteGame(client, data.user, data.invite,this.PlayersLoggedIn);
	}
  @SubscribeMessage("InvitedUser")
	async HandleInvitedUser(client: Socket, data: any): Promise<void> {
    // let user = await this.checkUSer(data.user);
    // if (user === null)
    //   return;

    // console.log("Inside InvitedUser  !",data);
    const parsed = JSON.parse(data.user);
    // console.log(" : ",parsed.nickname)
    this.PlayersInvited[parsed.nickname] = {
      data,
      client
    }



    // return this.gameService.inviteGame(client, data.user, data.invite,this.PlayersLoggedIn);
	}
  // async checkUSer(user:any): Promise<any>{
  //   if (!user)
	// 		return (null);
	// 	const User = await this.playerservice.findPlayerById(user.id);
	// 	if (!user)
	// 		return (null);
  //   return (User);
  // }
}

