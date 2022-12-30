import {ApiProperty} from "@nestjs/swagger";
// import { Player } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class VeriftyTfaDto {
    // @ApiProperty()
    // @IsString()
    // @IsNotEmpty()  player_id: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()   code: string;
}