/*
	Open the module file, and import the PrismaService, and add it to the array of providers
*/

import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { jwtauthGuard } from 'src/auth/jwt-oauth.guard';

@Module({
	providers: [JwtStrategy, PrismaService, PlayerService],
	controllers: [PlayerController]
})
export class PlayerModule {}
