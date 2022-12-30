import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
 
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(){
        super({
            ignoreExpiration: false,
            secretOrKey: process.env.JWTSECRET,
            jwtFromRequest:ExtractJwt.fromExtractors([(request:Request) => {
                let data = request?.cookies[process.env.AUTHCOOKIE];
                if(!data){
                    return null;
                }
                return data;  ///  data is the token to return in request maybe
            }])
        });
    }
 

//  https://docs.nestjs.com/exception-filters
//  https://medium.com/@abeythilakeudara3/nestjs-exception-filters-part-02-24afcbe116cf
//  https://progressivecoder.com/nestjs-exception-handling-learn-nestjs-series-part-6/
//  https://www.youtube.com/watch?v=jOCvdC9BBqY&ab_channel=AmitavRoy

//   throw new HttpException(msg, code) ==> import { HttpException, HttpStatus } from "@nestjs/common"

    async validate(payload:any){
        // You have to use HTTPExcepiton
        
        // if(payload === null){
        //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        // }

        if (payload === null) {
            throw new UnauthorizedException("Token not found");
        }
        return payload;
    }
}