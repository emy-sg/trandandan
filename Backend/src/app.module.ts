import { Module } from '@nestjs/common';
import { PlayerModule } from './player/player.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './chat/chat.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [PlayerModule, AuthModule, MessagesModule,GameModule],
})
export class AppModule {}
