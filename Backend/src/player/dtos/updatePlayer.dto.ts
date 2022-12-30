import {ApiProperty} from "@nestjs/swagger";
import { Player } from "@prisma/client";
import { 
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsAlphanumeric,
    IsUUID,
    IsUrl
} from "class-validator";

export class MutePlayerInRoomDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    room_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber() // IsNumberString()
    time: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString() //@IsAlphanumeric()
    login: string;
}

export class CreateNonProtectedRoomDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsAlphanumeric()
    name: string;
}

export class CreateProtectedRoomDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsAlphanumeric()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()  // IsAlphanumeric
    pwd: string;
}

export class SetPwdToPublicChatRoomDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    room_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    pwd: string;
}

export class DeletePwdToProtectedChatRoomDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    room_id: string;
}

export class JoinProtectedRoomDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    room_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString() 
    pwd: string;
}

export class UpdateProtectedPasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    room_id: string;    

    @ApiProperty()
    @IsNotEmpty() 
    @IsString() 
    new_password: string;

}

export class  UpdatePlayerDto implements Partial<Player> {
   
    @ApiProperty()
    @IsNotEmpty()
    @IsString() //@IsAlphanumeric()    /// have to check n
    nickname: string;

    
    // @IsOptional()
    // @IsString()
    // @IsNotEmpty()
    // password:string;


    // @IsNotEmpty ( ) @IsString ( ) @IsOptional ( ) readonly name : string ; @IsNotEmpty ( ) @IsString ( ) @IsOptional ( ) readonly email : string ; @IsNotEmpty ( ) @IsString ( ) @IsOptional ( ) readonly phone : string ; @IsNotEmpty ( ) @IsString ( ) @IsOptional ( ) readonly ranking : string ; @IsNotEmpty ( ) @IsString ( ) @IsOptional ( ) readonly position : string ; }
    // constructor(parameters) {
        
    // }

}