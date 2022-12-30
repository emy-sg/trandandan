import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from 'src/prisma.service';
import Pong from './Pong';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

// import { Player } from '@prisma/client';
import { Socket } from 'socket.io';
// import pong from './pong';
import { Game } from './entities/game.entity';

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

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();
  private queue: any[] = [];
  private PlayersGames: any = [];
  private currentGames: any = [];

  private currentGamesIDSock: any = [];

  private invitationArray: any = [];

  private PlayerInGame: Map<string, Game> = new Map();



  private invitationGames:Map<any, any> = new Map()
  private prisma: PrismaService = new PrismaService();

  private WatchersGames: any = [];
  private roomPrefix = 'roomGameSocket';

  newPlayer(client: Socket, user: any,PlayersInQueue:any[]): Map<string, Pong>  {
    // console.log('Adding a new Player.', user);
    // if(PlayersInQueue[client.id])
 
    this.queue.push({ user: user, client });
    // console.log('this is the)
    if (this.queue.length === 2) {

      const obj  : any= (this.queue[0])
      const obj2  : any= (this.queue[1]) 

      // console.log("New Player : Players In  QUeue Qrr  ",PlayersInQueue)
      if(!PlayersInQueue[this.queue.at(0).client.id])
      {

        // console.log( " 1st User is not in the queue qnymore ! ")
        this.queue.shift();
        return this.PlayersGames;
      }

      if(this.PlayerInGame.get(JSON.parse(this.queue.at(0).user).nickname))
      { 
        // console.log("HE WAS ALREADY IN GAME ! ")
        const Pleave = this.queue.shift();
        Pleave.client.emit('AlreadyInGame')
        // this.queue.shift();
        return this.PlayerInGame;
      }

      if(this.PlayerInGame.get(JSON.parse(this.queue.at(1).user).nickname))
      { 
        // console.log("HE WAS ALREADY IN GAME user 1  ! ")
        const Pleave = this.queue.pop();
        Pleave.client.emit('AlreadyInGame')
        
        return  this.PlayerInGame;
      }

      // if(!PlayersInQueue[this.queue.at(1).client.id])
      // {
      //   console.log( " Queue 1 OF THEM IS NOT IN QUEUE ANYMORE ")
      // }
      if(this.queue.at(0).user === this.queue.at(1).user)
      {
        this.queue.shift();
        // console.log(" This user was already in the queue ! ",this.queue )

        return this.PlayersGames;

        // return ;
      }
      const gameId = uuidv4();
      // console.log('QUEUE IS FULL .');

      const playerLeft = this.queue.shift();
      const playerRight = this.queue.shift();
      const game = new Game(
        gameId,
        JSON.parse(playerLeft.user).nickname,
        JSON.parse(playerRight.user).nickname,
      );
      this.games.set(gameId, game);

      this.PlayersGames[playerLeft] = gameId;
      this.PlayersGames[playerRight] = gameId;
      
      this.PlayerInGame.set(game.player_left.id, playerLeft);
      this.PlayerInGame.set(game.player_right.id, playerRight);

      this.currentGames[playerLeft.user] = gameId;
      this.currentGames[playerRight.user] = gameId;

      this.currentGamesIDSock[playerLeft.client.id] = gameId;
      this.currentGamesIDSock[playerRight.client.id] = gameId;


      const LeftSock: Socket = playerLeft.client;
      const RightSock: Socket = playerRight.client;
      LeftSock.join(this.roomPrefix + gameId);
      RightSock.join(this.roomPrefix + gameId);
      // console.log('-----------------------------------------------');
      // console.log('PlayerLeft : ', playerLeft);
      // console.log('PlayerRight : ', playerRight);
      // console.log('-----------------------------------------------');
      // console.log('Game : ', game);
      //   playerLeft.client.join(this.roomPrefix + gameId);
      //   playerRight.client.join(this.roomPrefix + gameId);
  

      const PlayerRightString = JSON.stringify(playerRight.user, replacerFunc());
      const playerLeftString = JSON.stringify(playerLeft.user, replacerFunc());

      const pongData = JSON.stringify(game.update(game.player_left.id), replacerFunc());
      const rightData = JSON.stringify(game.update(game.player_right.id), replacerFunc());
      // console.log(" => " , rightData)
      // console.log('gameId : ', gameId);





      // this.PlayerInGame.push({game.player_left.id : playerLeft}) 
      // this.PlayerInGame.push(game.player_right.id,playerRight) 
      // this.PlayerInGame[game.player_left.id] = playerLeftString;
      // this.PlayerInGame[game.player_right.id] = PlayerRightString;
      
      // const PlayersInGameString = JSON.stringify(this.PlayerInGame, replacerFunc());
      let Ingame = [];

      this.PlayerInGame.forEach((game, key) => {
        Ingame.push({
          id: key,
          player_left: game.player_left,
          player_right: game.player_right,
        });
      });
      

      // console.log(" EMTING USERS IN GAME " ,this.PlayerInGame)
      client.broadcast.emit('UsersInGame',{
       data :Ingame
        // playerLeft: PlayerLeftString,
        // playerRight:PlayerRightString,
        // data:{
        //   JSON.stringify/,
        //   playerRight
        // }
      })
      LeftSock.to(this.roomPrefix + gameId).emit('matchFound', {
        // id: gameId,
        // player_left: PlayerLeftString,
        // player_right: PlayerRightString,
        // player_left: game.player_left.id,
        // player_right: game.player_right.id,
        pongData: pongData,
      });
      RightSock.to(this.roomPrefix + gameId).emit('matchFound', {
        // id: gameId,
        // player_left: this.games[gameId].player_left.id,
        // player_right: this.games[gameId].player_right.id,
        pongData: rightData,
      });
    }

    return  this.PlayerInGame;
  }

  update(client: Socket, user: any): any {
    // console.log("Inside  update ! " ,user.user);
    
    const parsed = JSON.parse(user.user);
    // console.log("Inside  Position ! " ,user.positon);

    // console.log("Parsed  update ! " ,user);
    const gameId = this.currentGames[user.user];
    // console.log("Update GameId ",gameId)
    const game = this.games.get(gameId);
    if (game) {

      // console.log("Sending the infos ! ",game)
      // const PlayerLeftString = JSON.stringify(game.player_left, replacerFunc());
      // const PlayerRightString = JSON.stringify(game.player_right, replacerFunc());

       // const LeftSock: Socket = game.player_left.id.client;
      // const RightSock: Socket = game.player_left.id.client;

         // LeftSock.to(this.roomPrefix + gameId).emit('update', {
      //   pongData:pongData
      // });
      // RightSock.to(this.roomPrefix + gameId).emit('update', 
      // {pongData:pongData});
      if(parsed.nickname == game.player_left.id)
      {
        // console.log("its left" + game.player_left.id)
      game.onUpdate(game.player_left.id,user.positon)

      }
      else if (parsed.nickname == game.player_right.id)
      {
        // console.log("its right" + game.player_right.id)

        game.onUpdate(game.player_right.id,user.positon)

      }

      const pongData = JSON.stringify(game.update(parsed.nickname), replacerFunc());
      
       client.to(this.roomPrefix + gameId).emit('update', {
        pongData:pongData
      });

      if (game.getPongData().isPlaying === false){
        // this.gameHistory(game.getGameHistory())
        // this.gameAchievements(game.getGameHistory());
        // this.games.delete(game.gameId);
      }

    }
    // return game.update(user);
  }

  getAllGames(client:Socket): any{
    let games = [];

    this.games.forEach((game, key) => {
      games.push({
        id: key,
        player_left: game.player_left,
        player_right: game.player_right,
      });
    });

    client.emit('getAllGames', {
    games:games
      });
    return games;
  }

  watchGame(client: Socket, user:any, gameId:any): any {
    this.watchGame[user] = gameId;
    // console.log("USer infos ",user)

    // console.log("Game infos ",gameId)

    const game = this.games.get(gameId);
    if (game) 
    {
      // console.log("Game Exist Joining user" , game)
      // console.log("User : ",user)
      const parsed = JSON.parse(user)
      client.join(this.roomPrefix + gameId);
      game.spectators.add(user);
      // console.log("Before Pong Data ",user.nickname)
      const gameUpData = game.update(parsed.nickname);

      const pongData = JSON.stringify(game.update(game.player_left.id), replacerFunc());
      // console.log("pongData => " ,pongData)
      client.emit('WatchUpdate', {
        pongData:pongData
      });
   
    }
    else if (!game)
    {
      // console.log("Game not found !");
      client.emit('GameNotFound', {
        message:"Game Not found ! "
      });
   
    }
  }

  leaveGameAsWatcher(client: Socket, userId:any): void {
    const gameId = this.watchGame[userId];
    const game = this.games.get(gameId);
    if (game) {
      if (client.in(this.roomPrefix + gameId))
        client.leave(this.roomPrefix + gameId);
      game.spectators.delete(userId);
    }
  }

  leaveGameAsPlayer(client: Socket,user:any): Map<string, Pong>  {
    // console.log('-----------------------------------------------');
    // console.log("User : ",user)
    const gameId = this.currentGamesIDSock[client.id];
    const parsed = JSON.parse(user);

    // console.log("Inside PlayerGames",this.currentGames)
    // console.log('-----------------------------------------------');

  const nickname= parsed.nickname
    // const gameId = this.PlayersGames[user];

    // console.log("Inside LeaveGameAsPlayer",gameId)

    const game = this.games.get(gameId);

    if (game) 
    {

      this.PlayerInGame.delete(game.player_left.id) ;
      this.PlayerInGame.delete(game.player_right.id) ;


      // this.PlayerInGame.erase(game.player_left.id)
      // this.PlayerInGame.erase(game.player_right.id)
      
      if (game.player_left.id == nickname)
       {

      const upd = game.update(game.player_left.id)


         const pongData = JSON.stringify(game.update(game.player_right.id), replacerFunc());

         client.to(this.roomPrefix + gameId).emit('update', {
           ffs:true,
         leaver:game.player_left.id,
          pongData:pongData
        });

        // console.log("Deleting the left ! " ,game.player_left.id)

       

        // this.PlayerInGame[game.player_right.id] = playerRight;
        if(upd.isPlaying)
        {
          // console.log("they wre still playing !")
        // console.log("they wre still playing !",game.player_left ,"left   left updating right ")

          game.player_right.score = 20;
        }
        else
        {
          // console.log("Game Already Ended  !")
          
        }
      }
      else if (game.player_right.id == nickname)
      {
        // this.PlayerInGame[game.player_right.id] = 0;
        // this.PlayerInGame[game.player_left.id] = 0;
        // this.PlayerInGame.erase(game.player_left.id)
        // this.PlayerInGame.erase(game.player_right.id)





      // console.log("Deleting the right ! "   ,game.player_right.id)

      const upd = game.update(game.player_left.id)

      const pongData = JSON.stringify(game.update(game.player_left.id), replacerFunc());

      client.to(this.roomPrefix + gameId).emit('update', {
        ffs:true,
        leaver:game.player_right.id,
        pongData:pongData
      });

      if(upd.isPlaying)
      {
        // console.log("they wre still playing !",game.player_right ,"right   left updating left ")
        game.player_left.score = 20;
      }
      else
      {
        // console.log("Game Already Ended  !")
        
      }
      }
   
      // console.log(" EMTING USERS IN GAME FROM LEFT PLAYER ",this.PlayerInGame)
      const PlayersInGameString = JSON.stringify(this.PlayerInGame, replacerFunc());

      client.broadcast.emit('UsersInGame',{
        data : {
          PlayersInGame :PlayersInGameString
        }
        // playerLeft: PlayerLeftString,
        // playerRight:PlayerRightString,
        // data:{
        //   JSON.stringify/,
        //   playerRight
        // }
      })
      // console.log('-----------------------------------------------');
      // console.log("Pushing to History : ",game.getGameHistory())
      this.gameHistory(game.getGameHistory())
      this.gameAchievements(game.getGameHistory());
      this.games.delete(game.gameId);
      this.currentGames[user] = null;
      this.currentGamesIDSock[client.id] = null;
      // console.log('-----------------------------------------------');
    }
    // if (this.queue.includes({ user: user, client })){
    //   this.queue.splice(this.queue.indexOf({ user: user, client }), 1);
    //   console.log("Removing from Queue !")
    // }

    // client.id.client(this.roomPrefix + gameId).forEach((s: any) =>
    // {
    //   s.leave(this.roomPrefix + gameId);
    // })
return this.PlayerInGame;
  }

  inviteGame(client: Socket, user: any, inviteeNickname: string,PlayersLoggedIn:any[]){
    const parsed = JSON.parse(user)
    const inviterNickname : string= parsed.nickname;
    // console.log("Setting the Invite User ",inviteeNickname)
    // console.log("Setting the inviterNickname  ",inviterNickname)

    // console.log(" User :  ",user)

    // Here  Sending a socket to receiver User . 
    const friendSock : Socket = PlayersLoggedIn[inviteeNickname];

    if(friendSock)
    {
      const parsed = JSON.parse(user);
      friendSock.emit('ReceivedInvite',{
      Sendernickname : parsed.nickname

      })
      client.emit('InviteUpdate',{
        logged:true,
        sender:inviterNickname,
        inviteeNickname:inviteeNickname

      })
    }
    else  {
      // console.log("  not logged ")
      client.emit('InviteUpdate',{
        logged:false,
        sender:inviterNickname,
        inviteeNickname:inviteeNickname

      })

    }
    const objAsKey = { inviterNickname, inviteeNickname }
    const clientobj = { user, client }

    // console.log("obj" ,objAsKey)
    this.invitationArray[JSON.stringify(objAsKey)] = clientobj;
    this.invitationGames.set(objAsKey,
                            { user: user, client })
                            
        
                      
  }

  acceptInvite(client: Socket, user: any, inviterNickname: string,PlayersInvited:any[],PlayersAccept:any[])
  {
    const parsed = JSON.parse(user);
    let inviteeNickname  : string = parsed.nickname;

    const objAsKey = { inviterNickname, inviteeNickname }
    // console.log("AcceptObj => " ,objAsKey)

    // let invitation = this.invitationGames.get(objAsKey);
    const invitation = this.invitationArray[JSON.stringify(objAsKey)];
    // console.log('-----------------------------------------------');

      // console.log("Invit :  ",invitation)
      // console.log("inviteeNickname :  ",inviteeNickname)
      // console.log("inviterNickname :  ",inviterNickname)
      // console.log("InvitGames  :  ",this.invitationGames)
      // console.log('-----------------------------------------------');

      // console.log("Test :  ",test)





    if (invitation){
      // console.log('-----------------------------------------------');

      // console.log("Inside Invitations !",invitation)

      // if (invitation.client.id)

      const gameId = uuidv4();
      // console.log('an invitaion was accepted .');
      // console.log("InvitGames  :  ",this.invitationGames)
      // console.log('-----------------------------------------------');

      // console.log(" There is a  Invite ")
      const SocketInviter  = PlayersInvited[inviterNickname] ;
      // console.log(" Socket Player Right ! ",SocketInviter);
    
      // console.log('-----------------------------------------------');

      const SocketAccept  = PlayersAccept[inviteeNickname] ;
      
   
      // console.log(" SocketAccept  ! ",SocketAccept);
      // console.log(" PlayersAccept  ! ",PlayersAccept);


      // console.log('-----------------------------------------------');

      // const PlayerRight = { user : SocketInviter.data.user,
      //   client: SocketInviter.client}
      // const playerRight = this.queue.shift();
      // console.log("PlayerRight  :  ",this.invitationGames)

      const game = new Pong(
        gameId,
        JSON.parse(invitation.user).nickname,
        JSON.parse(user).nickname,
      );
      // console.log('-----------------------------------------------');
      // console.log("Game  :  ",game)
        
     
  

    
      
      if(!SocketAccept)
      {
      const RightSock: Socket = SocketInviter.client;

        // console.log("No Socket Accept")
        // const sock :Socket =  SocketAccept.client
    // console.log('-----------------------------------------------');

      // RightSock.join(this.roomPrefix + gameId);
      // RightSock.to(this.roomPrefix + gameId).emit('OponentLeft', {
      //   left: true,
      // });
    // console.log('-----------------------------------------------');

        // const sock :Socket =  SocketInviter.client
        client.emit('OponentLeft',{
          left:"true",
          leaver:inviteeNickname
        })
        // this.games.delete()

        return this.PlayerInGame;
      }

      if(!SocketInviter)
      {
      const LeftSock: Socket = SocketAccept.client;
        // console.log("No Socket inviter")
        // const sock :Socket =  SocketAccept.client
    // console.log('-----------------------------------------------');

      // LeftSock.join(this.roomPrefix + gameId);
      // // client.join(this.roomPrefix + gameId);

      // LeftSock.to(this.roomPrefix + gameId).emit('OponentLeft', {
      //   left: true,
      // });
      client.emit('OponentLeft', {
        left: "true",
        leaver:inviterNickname
      });
    // console.log('-----------------------------------------------');

        // client.emit('OponentLeft',{
        //   left:true
        // })
      return  this.PlayerInGame;

      }


      // console.log("user : ",invitation.client.id)
      this.currentGamesIDSock[invitation.client.id] = gameId;


      this.invitationGames.delete({inviterNickname, inviteeNickname});

      this.games.set(gameId, game);
      this.PlayersGames[invitation.user] = gameId;
      this.PlayersGames[user] = gameId;

      this.currentGames[invitation.user] = gameId;
      this.currentGames[user] = gameId;
  


      this.currentGamesIDSock[client.id] = gameId;

      
      const LeftSock: Socket = SocketAccept.client;
      const RightSock: Socket = SocketInviter.client;
      LeftSock.join(this.roomPrefix + gameId);
      RightSock.join(this.roomPrefix + gameId);


      this.PlayerInGame.set(game.player_left.id, game.player_left);
      this.PlayerInGame.set(game.player_right.id, game.player_right);

      const pongData = JSON.stringify(game.update(game.player_left.id), replacerFunc());
      const rightData = JSON.stringify(game.update(game.player_right.id), replacerFunc());

      // console.log(" R => " , rightData)
      // console.log('-----------------------------------------------');

      // console.log("P  => " , pongData)

      // console.log('gameId : ', gameId);
      let Ingame = [];

      this.PlayerInGame.forEach((game, key) => {
        Ingame.push({
          id: key,
          player_left: game.player_left,
          player_right: game.player_right,
        });
      });
      

      // console.log(" EMTING USERS IN GAME " ,this.PlayerInGame)
      client.broadcast.emit('UsersInGame',{
       data :Ingame
        // playerLeft: PlayerLeftString,
        // playerRight:PlayerRightString,
        // data:{
        //   JSON.stringify/,
        //   playerRight
        // }
      })

      LeftSock.to(this.roomPrefix + gameId).emit('matchFound', {
        pongData: pongData,
      });
      RightSock.to(this.roomPrefix + gameId).emit('matchFound', {
        pongData: rightData,
      });
    }
    // console.log('-----------------------------------------------');
return this.PlayerInGame
  }

  async gameHistory(data:any){
    // console.log('gameHistory findPlayerByNickname : ', data)
    const _winner = await this.findPlayerByNickname(data.winner);
    const _loser = await this.findPlayerByNickname(data.loser);
      // console.log('winner  gameHistory : ', _winner);
      // console.log('loser  gameHistory : ', _loser);
    if(_winner  && _loser) {
      
    const game_history = await this.prisma.game_history.create({

      data: {
        winner_id : _winner.id,
        winner_name:_winner.nickname,
        winner_avatar:_winner.avatar,
        winner_score : data.winnerScore,
        looser_id : _loser.id,
        looser_name:_loser.nickname,
        looser_avatar:_loser.avatar,
        losser_score : data.loserScore,
      }
    })
    const winner = await this.prisma.player.update({
      where: {
        id: _winner.id,
      },
      data: {
        wins: {
          increment: 1,
        },
      },
    })
    const loser = await this.prisma.player.update({
      where: {
        id: _loser.id,
      },
      data: {

        loses: {
          increment: 1,
        },
      },
    });
  }

    // console.log('History Created  game_history : ', game_history);
  }

  async gameAchievements(data:any){
    // console.log("this prisma achivemenvt", this.prisma.achievements)
    const _winner = await this.findPlayerByNickname(data.winner);
    const _loser = await this.findPlayerByNickname(data.loser);
    if(_winner  && _loser) {
    if (data.loserScore === 0){
      const cleanSheetExists = await this.prisma.achievements.findMany({
        where: {
          name: "Boono",
          playerId: _winner.id,
        }
      })
      if (cleanSheetExists.length === 0) { 
        const CleanSheet = await this.prisma.achievements.create({
          data: {
            name : "Boono",
            description:"Win a game without taking a goal",
            avatar:"https://ladosedunet.com/wp-content/uploads/2022/12/01gkm8v04fmaep02sks2.webp",
            playerId: _winner.id,
          }
        });
      }
    }
    if (data.winnerScore === 5){
      const fiveGoalsExists = await this.prisma.achievements.findMany({
        where: {
          name: "Ziyach",
          playerId: _winner.id,
        }
      })
      if (fiveGoalsExists.length === 0) {
        const ziyach = await this.prisma.achievements.create({
          data: {
        name : "Ziyach",
        description:"Win a game",
        avatar:"data:image/jpeg;base64,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",
        playerId : _winner.id,
          }
      });
    }
  }
  if (data.losser_score === 4 ) {
    const loserWithFour = await this.prisma.achievements.findMany({
      where: {
        playerId: _loser.id,
        name: "Hamda Llah"
      }
    });
   if (loserWithFour.length === 0) {
    const hamdaLlah = await this.prisma.achievements.create({
      data: {
        name : "Hamda Llah",
        description:"lose a game by one goal",
        avatar:"https://www.welovebuzz.com/wp-content/uploads/2020/01/1577693971Abderrazak__Hamdallah_vuC96Fd.image_corps_article.jpg",
        playerId : _loser.id,
      }
    })
  };
}
  }
  }
  async findPlayerById(userId: string)//: Promise<any> {
    {
        // console.log("FindPlayerById", userId);  // userId ===> roomId
        if (!userId) {
            // throw new HttpException('User Id is required', 400);
            throw new NotFoundException('hadu User Id is required');
        }
       // deleted await cuz found deleting promise
        const player =  await this.prisma.player.findUnique({
            where: {
                id: userId,
            }
        });
        // console.log("the player is ",player)
        if (!player) {
            // throw new NotFoundException("User Id is notd 000 found")
            // throw new HttpException('User ÷ found', HttpStatus.NOT_FOUND);
            return false;
        }
        return player;
  }
  async findPlayerByNickname(login: string) //: Promise<any> {
    {
      // console.log('nickname', login);
        const player = await this.prisma.player.findUnique({
            where: {
                nickname: login
            }
        });
        if (!player) {
            return null;
        }
        return player;
  }
}

