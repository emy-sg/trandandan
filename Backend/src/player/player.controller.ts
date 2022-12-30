import {
    Body, ParseFilePipe, ParseUUIDPipe,
    FileTypeValidator,
    MaxFileSizeValidator, Controller, Get, Param, Post, Req, Request, Res, UseGuards, NotFoundException, BadRequestException, UnauthorizedException
} from '@nestjs/common';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { toFileStream } from 'qrcode';
import { diskStorage } from 'multer';
// import { Response } from 'express';
import { PlayerService } from './player.service';
import { AuthGuard } from '@nestjs/passport';
import { userInfo } from 'os';
import { resourceUsage } from 'process';
// import { PrismaService } from 'src/prisma.service';
import {
    UpdatePlayerDto,
    MutePlayerInRoomDto,
    CreateNonProtectedRoomDto,
    CreateProtectedRoomDto, 
    JoinProtectedRoomDto,
    SetPwdToPublicChatRoomDto, 
    DeletePwdToProtectedChatRoomDto,
    UpdateProtectedPasswordDto } from './dtos/updatePlayer.dto';
import { response } from 'express';
import { extname } from 'path';

@Controller('player')
@UseGuards(AuthGuard('jwt'))
// JWT Guard return in user object
export class PlayerController {
    constructor(private readonly playerService: PlayerService) { }


    @Get('/2fa/enable')
    async enable2fa(@Req() request, @Res() res) {
        // const user = await this.playerService.findPlayerById(request.user.id);
        const { otpauth_url } = await this.playerService.generate2faSecret(request.user.playerId);

        // this.playerService.pipeQrCodeStream(otpauth_url, res);

        res.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })
        // return toFileStream(res, otpauth_url);
        return res.status(200).send(
            {
                "message": "2FA enabled"
            }
        );
    }

    @Get('/2fa/disable')
    async disable2fa(@Req() request, @Res() res) {
        // console.log("disable2fa");
        // const user = await this.playerService.findPlayerById(request.user.id);
        const user = await this.playerService.disable2fa(request.user.playerId);

        res.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })
        return res.status(200).send(
            {
                "message": "2FA disabled"
            }
        );
    }


    @Get('myprofile') // localhost:3000/account 
    async login(@Req() request, @Res() response) //:Promise<Profile>
    {
        // console.log("----------------- myprofile -----------------", request.user.playerId);
        const profile = await this.playerService.getPlayerById(request.user.playerId);

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("----------------- Finish myprofile -----------------", profile.nickname);
        response.status(200).send(profile);
    }

    @Post('update/nickname') // localhost:3000/account 
    async updateNickname(@Req() request, @Body() body: UpdatePlayerDto, @Res() response) //:Promise<Profile>
    {
        // console.log("----------------- updateNickname -----------------", request.user.playerId);
        // console.log(body.nickname, " ", request.user.playerId);
        const user = await this.playerService.findPlayerById(request.user.playerId);

        // const nickname = await this.playerService.findPlayerByNickname(body.nickname);
        // if (nickname) {
        //     throw new UnauthorizedException("Nickname already exist")
        // }
        const profile = await this.playerService.updateNickname(request.user.playerId, body.nickname);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("----------------- Finish myprofile -----------------", profile.nickname);
        response.status(200).send(profile);
    }

    @Post('update/avatar')
    @UseInterceptors(FileInterceptor('file',
        {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
                    const ext = extname(file.originalname)
                    cb(null, uniqueSuffix + ext)
                }
            }),
        }
    ))
    async upload(@Req() request, @Res() response, /*@Body() file: UpdatePlayerDto,*/ @UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
            ],
        }),) file: Express.Multer.File) //:Promise<Profile>
    {
        // console.log("----------------- updateAvatar -----------------", request.user.playerId);
        // const profile = await this.playerService.updateAvatar(request.user.playerId, body.avatar);
        const new_avatar = await this.playerService.uploadAvatar(request.user.playerId, file);
        // console.log(new_avatar.avatar);

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("----------------- Finish myprofile -----------------", profile.nickname);
        response.status(200).send({
            image_url: new_avatar.avatar
        });
    }

    // This is for guetting player profile
    @Get('/profile/:id') // id is player
    async getProfile(@Param('id') nickname: string, @Req() request, @Res() response) //:Promise<Profile>
    {

        //check if nickname not empty and not null
        if (!nickname || (nickname.length > 8 && nickname.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!nickname.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        // console.log("----------------- Profile of this nickname -----------------", request.user.playerId, " ", nickname);
        const profile = await this.playerService.getPlayerByNickname(nickname);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })
        // console.log("----------------- Finish Profile of this nickname -----------------");
        response.status(200).send(profile);
    }

    // ---------------------------------- Frienships ----------------------------------

    @Get('/isBlock/:id') // id is player
    async isBlocked(@Param('id') login: string, @Req() request, @Res() response) //:Promise<Profile>
    {

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Login must be alphanumeric + '-'")
        }

        // console.log("----------------- isFriend -----------------", request.user.playerId, " ", login);
        const isFriend = await this.playerService.getFriendshipStatus(request.user.playerId, login);
        if (isFriend && isFriend.status === "Block") {
            response.status(200).send(true);
        }
        else {
            response.status(200).send(false);
        }
    }

    @Get('/statusFriendship/:id') // check if nickname exist
    async checkStatusFriendship(@Param('id') login: string, @Req() request, @Res() response) {
        // console.log("--------------- Status -----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        const membership = await this.playerService.getFriendshipStatus(request.user.playerId, login);

        let choices: Array<String> = [];

        if (!membership) {
            choices = ['addFriend'];
        }
        else if (membership && membership.status === "Friend") // condition
        {
            choices = ['blockFriend'];
        }
        else if (membership && membership.status === "Block" && membership.senderId === request.user.playerId) // condition
        {
            choices = ['unblockFriend'];
        }
        else if (membership && membership.status === "Block" && membership.receiverId === request.user.playerId) // condition
        {
            choices = ['YourBlocked'];
        }
        else if (membership && membership.status === "Pending" && membership.senderId === request.user.playerId) // condition
        {
            choices = ['pendingFriend'];
        }
        else if (membership && membership.status === "Pending" && membership.receiverId === request.user.playerId) // condition
        {
            choices = ['acceptFriend', 'refuseFriend'];
        }
        else { // they used to be blocked now they wanna be friends again
            choices = [''];
        }

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("---------- Finish Status-----------------");
        response.status(200).send(choices);
    }

    @Get('/requestFriendship/:id') // check if nickname exist
    async RequestFriendship(@Param('id') login: string, @Req() request, @Res() response) {
        // console.log("-------------- Request Friendship ----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        const room = await this.playerService.getFriendshipStatus(request.user.playerId, login);
        if (room) {
            throw new UnauthorizedException("Already Exist")
        }

        await this.playerService.createFriendship(request.user.playerId, login);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("-------------- Finish Request Friendship ------------------");
        response.status(200).send({
            message: "Friendship request sent"
        }
        );
    }

    @Get('/acceptFriendship/:id') // check if nickname exist
    async AcceptFriendship(@Param('id') login: string, @Req() request, @Res() response) {
        // console.log("---------------- Accept Friendship ----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        // 1- check login exist
        const friend = await this.playerService.acceptFriendship(request.user.playerId, login);
        // 2- Check if their is a room chat between them
        const room = await this.playerService.getRoomBetweenTwoPlayers(request.user.playerId, login);
        if (room === null) {
            // 2.1- if not create a room chat between them
            await this.playerService.createDMRoom(request.user.playerId, login);
        }

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("---------------- Finish Accept Friendship ------------------");
        response.status(200).send({
            message: "Friendship Accepted"
        });
    }

    @Get('/refuseFriendship/:id') // check if nickname exist
    async RefuseFriendship(@Param('id') login: string, @Req() request, @Res() response) {
        // console.log("----------------- Refuse Friendship ----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        const room = await this.playerService.getFriendshipStatus(request.user.playerId, login);
        if (room === null) {
            throw new UnauthorizedException("There is no Request to refuse")
        }

        const friend = await this.playerService.refuseFriendship(request.user.playerId, login);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("----------------- Finish Refuse Friendship ------------------");
        response.status(200).send(
            {
                message: "Friendship refused"
            });
    }

    @Get('/blockFriendship/:id') // check if nickname exist
    async BlockFriendship(@Param('id') login: string, @Req() request, @Res() response) {
        // console.log("------------------ Block Friendship ----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        const friend = await this.playerService.blockFriendship(request.user.playerId, login);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("------------------ Finish Block Friendship ------------------");
        response.status(200).send({
            message: "Friendship blocked"
        }
        );
    }

    @Get('/unblockFriendship/:id') // check if nickname exist
    async UnblockFriendship(@Param('id') login: string, @Req() request, @Res() response) {
        // console.log("---------------- Unblock Friendship ----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        const room = await this.playerService.getFriendshipStatus(request.user.playerId, login);
        if (room === null) {
            throw new UnauthorizedException("There is no friendship to Unblock");
        }
        const friend = await this.playerService.deleteFriendship(request.user.playerId, login);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("---------------- Finish Unblock Friendship ------------------");
        response.status(200).send({
            message: "Friendship unblocked"
        });
    }

    // ----------------------------- List of Members ----------------

    @Get('/listOfFriends') // no checks for now
    async GetListOfFriends(@Req() request, @Res() response) {
        // console.log("---------------- List of Friends ----------------", request.user.playerId);
        const friends = await this.playerService.getAllFriends(request.user.playerId);
        // console.log("List of Friends", friends);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("-------------  Finish List of Friends   -------------------");
        response.status(200).send(friends);
    }

    @Get('/listOfMembers/:id') // check if id room exists ==> getProfilesOfChatRooms
    async GetListOfMembers(@Param('id', ParseUUIDPipe) id_room: string, @Req() request, @Res() response) {
        // console.log("-------------------List of Members-------------------");

        // console.log("List of Members id_room", id_room);
        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(id_room);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 3- check if the user is in the room
        const permision = await this.playerService.getPermissions(request.user.playerId, id_room);
        if (permision === null) {
            throw new NotFoundException("You are not in this room");
        }
        // 4- Get list of members of this room, and check if I am member of this room
        const friends = await this.playerService.getProfilesOfChatRooms(request.user.playerId, id_room);

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("------------ Finish List of Members---------------");
        response.status(200).send(friends);
    }

    @Get('/listToAddFriend/:id') // check if id room exists
    async GetListOfAddFriends(@Param('id', ParseUUIDPipe) id_room: string, @Req() request, @Res() response) {
        // console.log("\n---------------List To ADD Friends -----------------", request.user.playerId, " ", id_room);

        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(id_room);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 3- check if the user is in the room
        const permision = await this.playerService.getPermissions(request.user.playerId, id_room);
        if (permision === null) {
            throw new NotFoundException("You are not in this room");
        }
        // 4- Get list of members to add in this room, and check if I am member of this room
        const friends = await this.playerService.getListOfFriendsToAddinThisRoom(request.user.playerId, id_room); /// PRRRRRRR

        // console.dir(friends, { depth: null });

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("-------------- FINISH getListOfFriendsTo ------------------");
        response.status(200).send(friends);
    }

    // //endpoint for setting a member as admin
    @Get('/addMember/:id1/:id2')
    async addMember(@Param('id1') login: string, @Param('id2', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("------------------ Add Member ------------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(room_id);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 3- check if nickname is not a member of room_id already
        const member = await this.playerService.findPlayerByNickname(login);
        const status = await this.playerService.getPermissions(member.id, room_id);
        if (status) {
            throw new NotFoundException("This player is already a member of this room");
        }
        // 4- check if user status permission is an owner or admin
        const admin = await this.playerService.getPermissions(request.user.playerId, room_id);
        if (!admin) {
            throw new NotFoundException("You are not a member of this room");
        }
        if (admin && admin.statusMember === "member" && room.is_private === true) {
            throw new NotFoundException("It's a private room and you don't have the permission to add a member");
        }
        // 5- add member to room
        await this.playerService.addMember(login, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("------------------ Finish Add Member ------------------");
        // response.status(200).send(admin);
        response.send({
            message: "Member added"
        });
    }


    // //endpoint for setting a member as admin
    @Get('/setAdmin/:id1/:id2')
    async setAdmin(@Param('id1') login: string, @Param('id2', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("---------------- Set Admin ----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        // 1- check if room_id exists and is not a DM
        const room = await this.playerService.findRoomById(room_id);
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 2- check if login is member of this room
        const member = await this.playerService.findPlayerByNickname(login);
        const status = await this.playerService.getPermissions(member.id, room_id);
        if (!status) {
            throw new NotFoundException("This player is not a member of this room");
        }
        // 3- check if login status is member and NOT Muted
        if (status.statusMember !== "member" || status.is_banned === true) // || status.is_muted === true)
        {
            throw new NotFoundException("Cannot set this player as Admin bcuz is not a member and maybe he is muted or banned");
        }
        // 4- check if user status permission is an owner or admin
        const admin = await this.playerService.getPermissions(request.user.playerId, room_id);
        if (!admin) {
            throw new NotFoundException("You are not a member of this room");
        }
        if (admin && admin.statusMember !== "owner") {
            throw new NotFoundException("You cannot set this player as Admin, you are not the Owner");
        }

        const result = await this.playerService.setAdmin(login, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        response.status(200).send({
            message: "Admin set"
        });
    }

    // //endpoint for setting a member as admin
    @Get('/unsetAdmin/:id1/:id2')
    async unsetAdmin(@Param('id1') login: string, @Param('id2', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("---------------- Set Admin ----------------");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        // 1- check if room_id exists and is not a DM
        const room = await this.playerService.findRoomById(room_id);
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 2- check if login is member of this room
        const member = await this.playerService.findPlayerByNickname(login);
        const status = await this.playerService.getPermissions(member.id, room_id);
        if (!status) {
            throw new NotFoundException("This player is not a member of this room");
        }
        // 3- check if login status is an admin
        if (status.statusMember !== "admin" || status.is_banned === true) {
            throw new NotFoundException("This player is not an admin or is banned");
        }
        // 4- check if user status permission is an owner or admin
        const admin = await this.playerService.getPermissions(request.user.playerId, room_id);
        if (!admin) {
            throw new NotFoundException("You are not a member of this room");
        }
        if (admin && admin.statusMember !== "owner") {
            throw new NotFoundException("You cannot unset this player from Admin position, you are not the Owner");
        }

        const result = await this.playerService.unsetAdmin(login, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        response.status(200).send({
            message: "Admin set"
        });
    }

    // //endpoint for muting member
    @Post('/muteMember')  //    @Get('/muteMember/:id1/:id2')
    async muteMember(@Body() Body: MutePlayerInRoomDto, @Req() request, @Res() response) {
        // console.log("Mute Member");

        // console.log("Body.room_id", Body.room_id);
        // console.log("Body.time", Body.time);
        // console.log("Body.login", Body.login);

        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(Body.room_id);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 3- check if login is member of this room
        const member = await this.playerService.findPlayerByNickname(Body.login);
        const status = await this.playerService.getPermissions(member.id, Body.room_id);
        if (!status) {
            throw new NotFoundException("This player is not a member of this room");
        }
        //4- check if nickname is a status in room_id with status member And Muted
        if (status && status.is_muted == true) {
            throw new NotFoundException("Cannot mute this player bcuz he is muted");
        }
        if (status && status.is_banned == true) {
            throw new NotFoundException("Cannot mute this player bcuz he is banned");
        }
        //5- check if user status permission is an owner or admin
        const admin = await this.playerService.getPermissions(request.user.playerId, Body.room_id);
        if (!admin) {
            throw new NotFoundException("You are not a member of this room");
        }
        // console.log("admin.statusMember", admin.statusMember);
        if (admin && admin.statusMember === "member") {
            throw new NotFoundException("You cannot mute this player, bcuz you're not admin or owner");
        }
        if (admin && admin.statusMember === "admin" && status.statusMember === "owner") {
            throw new NotFoundException("You cannot mute the owner");
        }
        if (admin && admin.statusMember === "admin" && status.statusMember === "admin") {
            throw new NotFoundException("You cannot mute another admin");
        }
        if (admin && admin.statusMember === "owner" && status.statusMember === "owner") {
            throw new NotFoundException("The owner cannot mute himself");
        }
        //6- mute member
        const mute = await this.playerService.muteMember(Body.login, Body.room_id, Body.time);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )

        response.status(200).send({
            message: "Member muted"
        });
    }

    @Get('/unmuteMember/:id1/:id2')
    async unmuteMember(@Param('id1') nickname: string, @Param('id2', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("Mute Member");

        // console.log("nickname", nickname['id1']);
        // console.log("room_id", room_id);

        if (!nickname || (nickname.length > 8 && nickname.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!nickname.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(room_id);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 3- check if login is member of this room
        const member = await this.playerService.findPlayerByNickname(nickname);
        const status = await this.playerService.getPermissions(member.id, room_id);
        if (status === null) {
            throw new NotFoundException("This player is not a member of this room");
        }
        // 4- check if nickname is a status in room_id with status member And Muted
        if (status && status.is_muted === false) {
            throw new NotFoundException("This player is not muted");
        }
        //5- check if user status permission is an owner or admin
        const admin = await this.playerService.getPermissions(request.user.playerId, room_id);
        if (admin === null) {
            throw new NotFoundException("You are not a member of this room");
        }
        if (admin.statusMember === "member") {
            throw new NotFoundException("You cannot unmute this player, bcuz you're not admin or owner");
        }
        if (admin.statusMember === "admin" && status.statusMember === "owner") {
            throw new NotFoundException("You cannot unmute the owner");
        }
        if (admin.statusMember === "admin" && status.statusMember === "admin") {
            throw new NotFoundException("You cannot unmute another admin");
        }
        //6- unmute member
        const mute = await this.playerService.unmuteMember(nickname, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })

        response.status(200).send({
            message: "Member unmuted"
        });
    }

    //endpoint for banning member
    @Get('/banMember/:id1/:id2')
    async banMember(@Param('id1') login: string, @Param('id2', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("Ban Member");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(room_id);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Is a DM");
        }
        // 3- check if login is member of this room
        const member = await this.playerService.findPlayerByNickname(login);
        const status = await this.playerService.getPermissions(member.id, room_id);
        if (status === null) {
            throw new NotFoundException("This player is not a member of this room");
        }
        //4- check if nickname is a status in room_id with status member And Muted
        if (status && status.is_banned === true) {
            throw new NotFoundException("This player is already banned");
        }
        //5- check if user status permission is an owner or admin
        const admin = await this.playerService.getPermissions(request.user.playerId, room_id);
        if (admin === null) {
            throw new NotFoundException("You are not a member of this room");
        }
        if (admin.statusMember === "member") {
            throw new NotFoundException("You cannot ban this player, bcuz you're not admin or owner");
        }
        if (admin.statusMember === "admin" && status.statusMember === "owner") {
            throw new NotFoundException("You cannot ban the owner");
        }
        if (admin.statusMember === "admin" && status.statusMember === "admin") {
            throw new NotFoundException("You cannot ban another admin");
        }
        if (admin.statusMember === "owner" && status.statusMember === "owner") {
            throw new NotFoundException("owner can not ban himself");
        }
        //6- ban
        const ban = await this.playerService.banMember(login, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        response.status(200).send({
            message: "Member banned"
        });
    }

    @Get('/kickMember/:id1/:id2') // kick member or admin
    async kickMember(@Param('id1') login: string, @Param('id2', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("Kick Member");
        // 1- check if room_id exists

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }


        const room = await this.playerService.findRoomById(room_id);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("It's a DM");
        }

        // 3- check if login is member of this room
        const member = await this.playerService.findPlayerByNickname(login);
        const status = await this.playerService.getPermissions(member.id, room_id);
        if (status === null) {
            throw new NotFoundException("This player is not a member of this room");
        }

        //4- check if nickname status in room_id with status member And Muted
        if (status && status.is_banned === true) {
            throw new NotFoundException("Cannot kick this player, bcuz he is banned from this room");
        }

        //5- check if user status permission is an owner or admin
        const admin = await this.playerService.getPermissions(request.user.playerId, room_id);
        if (admin === null) {
            throw new NotFoundException("Cannot kick this player");
        }
        if (admin && admin.statusMember === "member") {
            throw new NotFoundException("You cannot kick this player, bcuz you're not admin or owner");
        }
        if (admin && admin.statusMember === "admin" && status.statusMember === "owner") {
            throw new NotFoundException("You cannot kcik the owner");
        }
        if (admin && admin.statusMember === "admin" && status.statusMember === "admin") {
            throw new NotFoundException("You cannot kick another admin");
        }
        if (admin && admin.statusMember === "owner" && status.statusMember === "owner") {
            throw new NotFoundException("The owner cannot kick himself");
        }
        //6- kick member
        const kick = await this.playerService.kickMember(login, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        response.status(200).send({
            message: "Member kicked"
        });
    }

    // ---------------------------------- CONTROLLER Permission in room ---------------------------------- //

    @Get('/Permission/:id') //POST REQUEST // id is roon id 
    async GetPermission(@Param('id', ParseUUIDPipe) id_room: string, @Req() request, @Res() response) {
        // console.log("------------------- Get Permission-------------------");
        const permission = await this.playerService.getPermissions(request.user.playerId, id_room);
        // console.log(permission)
        if (permission == null) {
            throw new NotFoundException("Permission denied, you are not a member of this room");
        }
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("------------------- Finish Get Permission-------------------");
        response.status(200).send(permission);
    }

    @Get('/listOfRooms') // no check to do 
    async GetListOfRooms(@Req() request, @Res() response) {
        // console.log("--------------- List of Rooms -----------------");
        const rooms = await this.playerService.getAllRooms(request.user.playerId);

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("---------- Finish List of Rooms-----------------");
        response.status(200).send(rooms);
    }

    @Post('/createChatRoom/Public') // no check if name exist choose another name 
    async CreatePublicChatRoom(@Body() Body: CreateNonProtectedRoomDto, @Req() request, @Res() response) {
        // console.log("----------------- Create Public Chat Room -----------------");
        // console.log("request  ", request.user);
        const room = await this.playerService.createPublicChatRoom(request.user.playerId, Body.name);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("----------------- Finish Create Public Chat Room ------------------");
        response.status(200).send({
            message: "Public chat room created"
        });
    }

    @Post('/SetPwdToPublicChatRoom') // no check if name exist choose another name 
    async SetPwdToPublicChatRoom(@Body() Body: SetPwdToPublicChatRoomDto, @Req() request, @Res() response) {
        // console.log("----------------- Create Public Chat Room -----------------");
        const room = await this.playerService.SetPwdToPublicChatRoom(request.user.playerId, Body);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("----------------- Finish Create Public Chat Room ------------------");
        response.status(200).send({
            message: "pwd set to public chat room"
        });
    }

    @Post('/createChatRoom/Private')
    async CreatePrivateChatRoom(@Body() Body: CreateNonProtectedRoomDto, @Req() request, @Res() response) {
        // console.log("---------------- Create Private Chat Room ----------------");
        const room = await this.playerService.createPrivateChatRoom(request.user.playerId, Body.name);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("---------------- Finish Create Private Chat Room ------------------");
        response.status(200).send({
            message: "Private chat room created"
        });
    }

    ///////////////////////////////////////// New //////////////////////////////////////////////////////////

    @Post('/createChatRoom/Protected')
    async CreateProtectedChatRoom(@Body() Body: CreateProtectedRoomDto, @Req() request, @Res() response) {
        // console.log("------------------- Create Protected Chat Room -------------------");
        const room = await this.playerService.createProtectedChatRoom(request.user.playerId, Body);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("-------------Finish Creatte Protected Chat Room-----------");
        response.status(200).send({
            message: "Protected chat room created"
        });
    }

    @Post('/UpdatePwdProtectedChatRoom')
    async UpdatePwdProtectedChatRoom(@Body() Body: UpdateProtectedPasswordDto, @Req() request, @Res() response) {
        // console.log("------------------- Create Protected Chat Room -------------------");

        // console.log("Body.room_id : ", Body.room_id);
        // console.log("Body.new_password : ", Body.new_password);

        const room = await this.playerService.UpdatePwdProtectedChatRoom(request.user.playerId, Body);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("-------------Finish Creatte Protected Chat Room-----------");
        response.status(200).send({
            message: "pwd of Protected chat room updated"
        });
    }

    @Post('/DeletePwdProtectedChatRoom')
    async DeletePwdProtectedChatRoom(@Body() roomId: DeletePwdToProtectedChatRoomDto, @Req() request, @Res() response) {
        // console.log("------------------- Create Protected Chat Room -------------------");
        const room = await this.playerService.DeletePwdToProtectedChatRoom(request.user.playerId, roomId.room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("-------------Finish Creatte Protected Chat Room-----------");
        response.status(200).send({
            message: "pwd of Protected chat room deleted"
        });
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////

    @Get('/GetTypeOfRoom/:id')
    async GetTypeOfRoom(@Param('id', ParseUUIDPipe) id_room: string, @Req() request, @Res() response) {
        // console.log("------------------- Get Type Of Room -------------------");
        const type = await this.playerService.getTypeOfRoom(id_room);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("------------------- Finish Get Type Of Room -------------------");
        response.status(200).send(type);
    }

    // //endpoint for leaving a room
    @Get('/leaveRoom/:id')
    async leaveRoom(@Param('id', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("Leave Room");

        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(room_id);
        // 2- check if room_id is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Cannot leave a DM");
        }
        // 3- check if user is member of this room
        const member = await this.playerService.getPermissions(request.user.playerId, room_id);
        // 4- then leave room
        const leave = await this.playerService.leaveChannel(request.user.playerId, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )

        response.status(200).send({
            message: "Room leaved"
        });
    }

    @Get('/getmessages/:id')
    async getMessages(@Param('id', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("----------------------- Get Messages -----------------------", room_id);

        // console.log("get Messages id_room", room_id);
        // 1- check if room_id exists
        const room = await this.playerService.findRoomById(room_id);
        if (!room) {
            throw new NotFoundException("Room not found");
        }
        // 3- get messages
        const messages = await this.playerService.getMessagesOfRoom(request.user.playerId, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        // console.log("----------------------- Finish Get Messages -----------------------");
        response.status(200).send(messages);
    }

    @Get('/sendMessageButton/:id')
    async SendMessageButton(@Param('id') login: string, @Req() request, @Res() response) {
        // console.log("Send Message");

        if (!login || (login.length > 8 && login.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!login.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }


        // 0- check if login exists
        const user = await this.playerService.findPlayerByNickname(login);

        let room = null;
        // 1- check if room already exists between those 2 users
        room = await this.playerService.getRoomBetweenTwoPlayers(request.user.playerId, login);
        // 2- if not create a new room
        if (room === null) {
            const friendship = await this.playerService.getFriendshipStatus(request.user.playerId, login);
            if (!friendship) {
                room = await this.playerService.createDMRoom(request.user.playerId, login);
            }
            // status friendship: 0: Friend, 1: Pending, 2: Block
            else if (friendship.status === 'Pending') {
                room = await this.playerService.createDMRoom(request.user.playerId, login);
            }
            else if (friendship.status === 'Block') {
                throw new NotFoundException("You can not send a message to this player");
            }
        }

        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        }
        )
        response.status(200).send(room.id);
    }

    @Get('joinDM/:id')
    async joinDM(@Param('id', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("---------------- Join DM ----------------", login['id']);
        // console.log("Join DM, login: ", room_id);

        const room = await this.playerService.joinDM(request.user.playerId, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })
        // console.log("--------------  Finish Join Room--------------------");
        return response.status(200).send({ room });
    }

    @Get('/joinNonProtectedRoom/:id')
    async joinNonProtectedRoom(@Param('id', ParseUUIDPipe) room_id: string, @Req() request, @Res() response) {
        // console.log("---------------- Join Room ----------------", room_id);

        const room = await this.playerService.joinRoom(request.user.playerId, room_id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })
        // console.log("--------------  Finish Join Room--------------------");
        return response.status(200).send({ room });
    }

    @Post('/joinProtectedRoom')
    async joinProtectedRoom(@Body() roomId_pwd: JoinProtectedRoomDto, @Req() request, @Res() response) {
        // console.log("---------------- Join Room ----------------", room_id);

        // 4- then join room
        const room = await this.playerService.joinProtectedRoom(request.user.playerId, roomId_pwd);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })
        // console.log("--------------  Finish Join Room--------------------");
        return response.status(200).send({ room });
    }
    //---------------------------------------------------------------------------------------------
    @Get('/allGameHistory')
    async allGameHistory(@Req() request, @Res() response) {
        // console.log("---------------- Game History ----------------");
        // console.log("allGameHistory, login: ", request.user.playerId);

        const history = await this.playerService.getAllGamesHistory();
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        })
        // console.log("--------------  Finish allGameHistory--------------------");
        return response.status(200).send({ history });
    }

    @Get('/gameHistoryById/:id')
    async gameHistoryById(@Param('id') id: string, @Req() request, @Res() response) { // id is nickanme
        // console.log("---------------- Game History ById ----------------", id);
        // console.log("Game History ById, login: ", request.user.playerId);

        if (!(id || id.length > 8 && id.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!id.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        const history = await this.playerService.getGamesHistoryByUser(id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        });

        // console.log("--------------  Finish Game History ById--------------------", history);
        return response.status(200).send({ history });
    }

    @Get('/achivement/:id')
    async achivement(@Param('id') id: string, @Req() request, @Res() response) {  // id is a Nickname
        // console.log("---------------- Game achivement ----------------");
        // console.log("achivement, login: ", request.user.playerId);

        if (!(id || id.length > 8 && id.length < 3)) {
            throw new UnauthorizedException("Nickname is empty or too long")
        }

        //nickeame must be alphanumeric + '-'
        if (!id.match(/^[a-zA-Z0-9-]+$/)) {
            throw new UnauthorizedException("Nickname must be alphanumeric + '-'")
        }

        const getAchivements = await this.playerService.getAchivements(id);
        response.set({
            'Access-Control-Allow-Origin': `${process.env.IP_URL}:${process.env.FRONT_PORT}`
        });
        // console.log("--------------  Finish achivement --------------------");
        return response.status(200).send({ getAchivements });
    }
}

