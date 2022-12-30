import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/chat.entity';

@Injectable()
export class MessagesService {
  messages: Message[] = [];
  ClientToUser = {};

  identify(name: string, clientId: string){
    this.ClientToUser[clientId] = name;

    return Object.values(this.ClientToUser);
  }

  getClientName(clientId: string){
    return this.ClientToUser[clientId];
  }

  create(createMessageDto: CreateMessageDto, clientId: string) {
    const message = {   // inform client new msg
      
      name: this.ClientToUser[clientId],
      text: createMessageDto.text,
    }; 
    this.messages.push(message); // who join room || cannot chang e their name
    return message;
  }

  findAll() {
    console.log();
    
    return this.messages; // db query to get messages
  }
}




// import { Injectable } from '@nestjs/common';
// import { CreateMessageDto } from './dto/create-message.dto';
// import { PrismaService } from 'src/prisma.service';

// @Injectable()
// export class MessagesService {
//   constructor(private prisma: PrismaService) {}

//   // const data = {
//   //     room: ,
//   //     user: ,
//   //     message: ,
//   // }
//   async createMessage(data: CreateMessageDto) {

//     // user exists
//     console.log('user exists', data);
    
//     const userExists = await this.prisma.player.findUnique({
//       where: {
//         id: Number(data.senderId),
//       },
//     });
//     if (!userExists) {
//       return {
//         error: 'User does not exist',
//       };
//       // throw new Error('User does not exist');
//     }

//     // room exists
//     const roomExists = await this.prisma.chatRoom.findUnique({
//       where: {
//         id: data.roomId,
//       },
//     });
//     if (!roomExists) {
//       return {
//         error: 'Room does not exist',
//       };
//     }

//     return this.prisma.message.create({
//       data: {
//         senderId: data.senderId,
//         roomId: data.roomId,
//         msg: data.message
//       },
//     });
//   }


//   // get messages of dm room
//   async getMessages(friendId: number, userId: number) {

//     // check if room exists
//     const roomExists = await this.prisma.chatRoom.findUnique({
//       where: {
        
//       },
//     });
//     if (!roomExists) {
//       return {
//         error: 'Room does not exist',
//       };
//     }

//     // get messages
//     return this.prisma.message.findMany({
//       where: {
//         roomId: friendId,
//       },
//       include: {
//         sender: true,
//       },
//     });

//   }
// }