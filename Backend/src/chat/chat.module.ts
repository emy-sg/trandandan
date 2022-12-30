import { Module } from '@nestjs/common';
import { MessagesService } from './chat.service';
import {  ChatGateway } from './chat.gateway';
import { PrismaService } from 'src/prisma.service';
import { PlayerService } from 'src/player/player.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [ChatGateway, MessagesService, PrismaService, PlayerService, EventsGateway],
})
export class MessagesModule {}
