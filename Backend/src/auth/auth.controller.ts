// import { Controller, Get, Req, Request, Res, Response, UseGuards } from '@nestjs/common';
import { Controller, Get, Post, Req, Body, Res, UnauthorizedException, UseGuards, HttpException, HttpStatus, Catch, UseFilters } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'http';
import { authenticator } from 'otplib';
import { VeriftyTfaDto} from './dtos/tfa.dto';
import { toFileStream } from 'qrcode';
import { intraExceptionFilter } from './auth.exceptionFilter';
// import * as cookieParser from 'cookie-parser';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('/signup')
	@UseGuards(AuthGuard('42'))
	async authentication() {
		// console.log("trying to auth")
	}

	@Get('/redirect')
	@UseGuards(AuthGuard('42'))
	@UseFilters(new intraExceptionFilter())
	async login(@Req() request, @Res({passthrough:true}) res: Response) {

		const user =  await this.authService.findORcreate(request.user);

		if (user.tfa === true) {
			// redirect to 2fa page
			// return res.status(200).send(user.id);
			res.cookie(
				'2fa',
				user.id,
				{httpOnly:true,}
			);
			// return res.status(302).redirect(`http://localhost:3000/verify`);   // url to 2fa page
			return res.status(302).redirect(`${process.env.IP_URL}:${process.env.FRONT_PORT}/verify`);
		}

		const token = await this.authService.JwtAccessToken(user.id);

		const secretData = {
			token,
		}

		//If you are setting the cookie on a response in a login route in express backend for JWT and are using 'httpOnly' option is true.
		res.cookie(
			process.env.AUTHCOOKIE,
			secretData.token,
			{httpOnly:true,}
		);

		// return res.status(302).redirect(`http://localhost:3000/`);
		return res.status(302).redirect(`${process.env.IP_URL}:${process.env.FRONT_PORT}/`);
	}

	@Get('/2fa/QrCode')
	async enable2fa(@Req() request, @Res() res) {
		// console.log("user.id", request.cookies['2fa']);
		const user = await this.authService.findById(request.cookies['2fa']);
		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		const  otpauth_url = await this.authService.generateQrCode(user.id);

		// // this.playerService.pipeQrCodeStream(otpauth_url, res);
        // return toFileStream(res, otpauth_url);
		// console.log("otpauth_url", otpauth_url);
		return res.status(200).send(otpauth_url);
        // return response.send(
        //     {
        //         "message": "2FA enabled"
        //     }
        // );
	}

	@Post('/2fa/verify')
	async verify2fa(@Body() body: VeriftyTfaDto, @Req() request, @Res() res: Response) {
		// console.log("user.id", request.cookies['2fa']);
		const user = await this.authService.findById(request.cookies['2fa']);
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		// const is_code_valid = this.authService.is2faCodeValid(user, request.body.code);

		if (!user.tfaSecret) {
			throw new UnauthorizedException('2fa not enabled');
		}
		// console.log("Before Verify", body.code, user.tfaSecret);
		const is_code_valid = await authenticator.verify({ token: body.code, secret: user.tfaSecret});
		if (!is_code_valid) {
			throw new UnauthorizedException('Invalid code');
		}
		// console.log("After Verify", body.code, user.tfaSecret);
		// return res.send({
		// 	message: '2fa verified'
		// });

		// res.clearCookie('2fa');

		const token = await this.authService.JwtAccessToken(user.id);

		const secretData = {
			token,
		}

		//If you are setting the cookie on a response in a login route in express backend for JWT and are using 'httpOnly' option is true.
		res.cookie(
			process.env.AUTHCOOKIE,
			secretData.token,
			{httpOnly:true,}
		);

		// return res.status(302).redirect(`http://localhost:3000/`);

        res.set({
            // 'Access-Control-Allow-Origin': 'http://localhost:3000'
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("-------------- Finish Request Friendship ------------------");
        res.status(200).send({
                message: "2FA verified"
            }
        );
	}

	@Get('/logout')
	@UseGuards(AuthGuard('jwt'))
	async logout(@Req() request, @Res({passthrough:true}) res: Response) {
		res.clearCookie(process.env.AUTHCOOKIE);
		// return res.status(302).redirect(`http://localhost:3000/`);
		return res.status(302).redirect(`${process.env.IP_URL}:${process.env.FRONT_PORT}/`);
	}
}