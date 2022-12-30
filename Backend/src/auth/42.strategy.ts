import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class OauthStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private authService: AuthService) {


    super({
        clientID: process.env.UID,
        clientSecret: process.env.SECRET,
        callbackURL: process.env.callback,

        profileFields: {
            'nickname': 'login',
            'firstName': 'first_name',
            'lastName': 'last_name',
            'avatar': 'image.link',
            'email': 'email',
        }
    });
  }

  async validate(accessToken: String, refreshToken: String, profile: any, cb: any) {
    if (!profile)
    throw new UnauthorizedException("User not found");
    // return `${process.env.IP_URL}:${process.env.FRONT_PORT}`;
    return profile;
  }
}