import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { OauthStrategy } from './42.strategy';
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy';

@Module({
	imports: [
  		PassportModule,
		JwtModule.register({
			secret: process.env.JWTSECRET,
			signOptions: {
			  expiresIn: process.env.JWTEXPIRATION
			},
		})
	],
  	controllers: [AuthController],
  	providers: [
		AuthService,
		PrismaService,
		OauthStrategy,
		JwtStrategy,
	],
})
export class AuthModule {}
