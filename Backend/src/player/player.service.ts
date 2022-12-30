//Add friend after blocking should not create another dm


import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import { compare, hash } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { RouterModule } from '@nestjs/core';
import { stat } from 'fs';
import { networkInterfaces } from 'os';
import { PrismaService } from 'src/prisma.service';
import { authenticator } from 'otplib';
import { MutePlayerInRoomDto, CreateProtectedRoomDto, JoinProtectedRoomDto, SetPwdToPublicChatRoomDto, UpdateProtectedPasswordDto } from './dtos/updatePlayer.dto';
import { getFileInfo } from 'prettier';

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLD_CLOUD_NAME,
    api_key: process.env.CLD_API_KEY,
    api_secret: process.env.CLD_API_SECRET,
});

@Injectable()
export class PlayerService {
    constructor(private prisma: PrismaService) { }

    // ------------------ 0- Find Player && get Player ------------------

    async getPlayerById(userId: string)//: Promise<any> {
    {
        // console.log("FindPlayerById", userId);  // userId ===> roomId
        if (!userId) {
            throw new NotFoundException('User Id is required');
        }
        // deleted await cuz found deleting promise
        const player = this.prisma.player.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                nickname: true,
                firstName: true,
                lastName: true,
                avatar: true,
                wins: true,
                loses: true,
                tfa: true,
            }
        });

        if (!player) {
            throw new NotFoundException("User Id is not found")
            // throw new HttpException('User ÷ found', HttpStatus.NOT_FOUND);
        }
        return player;
    }

    async findPlayerById(userId: string)//: Promise<any> {
    {
        // console.log("FindPlayerById", userId);  // userId ===> roomId
        if (!userId) {
            // throw new HttpException('User Id is required', 400);
            throw new NotFoundException('User Id is required');
        }
        // deleted await cuz found deleting promise
        const player = this.prisma.player.findUnique({
            where: {
                id: userId,
            }
        });

        if (!player) {
            throw new NotFoundException("User Id is not found")
            // throw new HttpException('User ÷ found', HttpStatus.NOT_FOUND);
        }
        return player;
    }

    async getPlayerByNickname(login: string)//: Promise<any> {
    {
        const player = await this.prisma.player.findUnique({
            where: {
                nickname: login
            },
            select: {
                id: true,
                nickname: true,
                firstName: true,
                lastName: true,
                avatar: true,
                wins: true,
                loses: true,
            }
        });

        if (!player) {
            throw new NotFoundException('Profile not found')
        }
        return player;
    }

    async findPlayerByNickname(login: string) //: Promise<any> {
    {
        // console.log("FindPlayerByNickname", login);  // userId ===> roomId
        const player = await this.prisma.player.findUnique({
            where: {
                nickname: login
            }
        });

        if (!player) {
            throw new NotFoundException('Profile not found')
        }
        return player;
    }

    async generate2faSecret(playerId: string) //: Promise<any> {
    {
        const player = await this.findPlayerById(playerId);
        if (!player) {
            throw new NotFoundException("Generate 2fa Secret User Id is not found");
        }
        if (player && player.tfa === true) {
            throw new NotFoundException("2FA is already enabled");
        }

        const secret = authenticator.generateSecret();

        const otpauth_url = authenticator.keyuri(player.email, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);

        await this.prisma.player.update({
            where: {
                id: playerId,
            },
            data: {
                tfa: true,
                tfaSecret: secret,
            }
        });

        return { secret, otpauth_url };
    }

    async disable2fa(playerId: string) //: Promise<any> {
    {
        const player = await this.findPlayerById(playerId);
        if (!player) {
            throw new NotFoundException("User Id is not found");
        }
        if (player && player.tfa === false) {
            throw new NotFoundException("2FA is already disabled");
        }
        const tfa = await this.prisma.player.update({
            where: {
                id: playerId,
            },
            data: {
                tfa: false,
                tfaSecret: null,
            }
        });
        return tfa;
    }

    async updateNickname(playerId: string, newname: string) //: Promise<any> {
    {
        // console.log("updateNickname", playerId, "   ", nickname);
        const exist = await this.prisma.player.findUnique({
            where: {
                nickname: newname,  //
            }
        });
        if (exist) {
            throw new UnauthorizedException("Nickname already exist")
        }

        const user = await this.prisma.player.findUnique({
            where: {
                id: playerId,
            }
        });
        if (!user) {
            throw new NotFoundException("User Id is not found")
        }
        
        const old_nickname = user.nickname;

        let pp;
        pp = await this.prisma.game_history.updateMany({
            where: {
                winner_name: old_nickname,
            },
            data:
            {
                winner_name: newname,
            }
        });
        pp = await this.prisma.game_history.updateMany({
            where: {
                looser_name: old_nickname,
            },
            data:
            {
                looser_name: newname,
            }
        });

        const player = await this.prisma.player.update({
            where: {
                id: playerId,
            },
            data: {
                nickname: newname,
            },
            select: {
                id: true,
                nickname: true,
                firstName: true,
                lastName: true,
                avatar: true,
                wins: true,
                loses: true,
            }
        });
        return player;
    }

    async uploadAvatar(playerId: string, avatar: Express.Multer.File) //: Promise<any> 
    {
        // console.log("uploadAvatar", playerId, "   ", password
        const player = await this.findPlayerById(playerId);
        // console.log("player", player)

        const uploadedImage = await cloudinary.uploader.upload(avatar.path, { folder: "uploads" })
        // console.log("uploadedImage", uploadedImage)

        const avatar_url = uploadedImage.secure_url;

        // console.log("avatar_url", avatar_url)
        // const avatar_url = "http://localhost:5000/" + avatar.path;
        // const avatar_url = avatar.path;


        // const avatar_url = await this.cloudinaryService.uploadImage(avatar.path, "avatars");

        const old_avatar = player.avatar;
        let user;
        user = await this.prisma.game_history.updateMany({
            where: {
                winner_avatar: old_avatar,
            },
            data:
            {
                winner_avatar: avatar_url,
            }
        });
        user = await this.prisma.game_history.updateMany({
            where: {
                looser_avatar: old_avatar,
            },
            data:
            {
                looser_avatar: avatar_url,
            }
        });
        const player_avatar = await this.prisma.player.update({
            where: {
                id: playerId,
            },
            data: {
                avatar: avatar_url,
            }
        });
        // console.log("player withe new avatar ", player_avatar)
        return player_avatar;
    }

    // ------------------- GET list of Rooms -------------------

    async findRoomById(roomId: string) //: Promise<boolean>
    {
        // console.log("-->", roomId);

        const room = await this.prisma.chatRoom.findUnique({
            where: {
                id: roomId,
            }
        });

        if (!room) {
            throw new NotFoundException("room not found");
        }
        return room;
    }

    async getTypeOfRoom(roomId: string) //: Promise<boolean>
    {
        // console.log("-->", roomId);
        const room = await this.findRoomById(roomId);
        let type = null;
        if (room.is_dm === true) {
            type = "dm";
        }
        else if (room.is_public === true) {
            type = "public";
        }
        else if (room.is_private === true) {
            type = "private";
        }
        else
            type = "protected";
        return type;
    }

    // Get room by id
    async getRoomById(userId: string, room_id: string) {
        // 1- Check if room exists
        const rooms_exist = await this.findRoomById(room_id);
        // 2- check if user is a member of the room
        const is_member = await this.getPermissions(userId, room_id);
        if (!is_member) {
            throw new UnauthorizedException("You are not a member of this room");
        }
        // if (is_member && is_member.is_banned === true)
        //     throw new UnauthorizedException("You are banned from this room");
        if (is_member && rooms_exist.is_dm === false && is_member.is_banned === true)
            return;
        // throw new UnauthorizedException("Get Room by id : You are banned from this room");
        // 3- return room
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: room_id,
            },
            select: {
                name: true,
                is_dm: true,
                is_public: true,
                is_private: true,
                is_protected: true,
                all_members: {
                    select: {
                        player: {
                            select: {
                                nickname: true,
                                id: true,
                            }
                        },
                    },
                },
            },
        }
        )
        return room;
    }



    async getRoomBetweenTwoPlayers(useId: string, login: string) //: Promise<boolean>
    {
        //  console.log("-->", friendId);
        const friend = await this.prisma.player.findUnique({
            where: {
                nickname: login
            }
        });
        if (!friend) {
            throw new NotFoundException('Profile not found')
        }

        const room = await this.prisma.chatRoom.findFirst({

            where: {
                is_dm: true,
                AND: [
                    {
                        all_members: {
                            some: {
                                playerId: useId,
                            }
                        }
                    },
                    {
                        all_members: {
                            some: {
                                playerId: friend.id,
                            }
                        }
                    },
                ]
            },


        })
        // console.log("room", room);
        return room;
    }

    async getAllRooms(userId: string) {
        // const me = await this.findPlayerById(userId);

        // ROOMS  + public

        const rooms = await this.prisma.chatRoom.findMany({
            where: {
                OR: [
                    { // member DM or private proctected
                        all_members: {
                            some: {
                                playerId: userId,
                                is_banned: false,
                            }
                        },
                    },
                    {
                        // is_dm: false,
                        is_public: true,
                    },
                    {
                        // is_dm: false,
                        is_protected: true,
                    },
                    {
                        is_dm: true,
                        all_members: {
                            some: {
                                playerId: userId,
                            }
                        },
                    }
                ],
            },
            include: {
                all_members: {
                    include: {
                        player: {
                            select: {
                                nickname: true,
                            }
                        },
                    }
                }
            }
        })
        // console.log(rooms);
        return rooms.map(room => {
            if (room.is_dm === true) {
                room.name = room.all_members.find(e => e.playerId !== userId)?.player.nickname;
            }
            return {
                id: room.id,
                name: room.name,
                is_dm: room.is_dm,
                is_public: room.is_public,
                is_private: room.is_private,
                is_protected: room.is_protected,
            }
        })
    }

    // -------------------------- 1- Get list of friends ------------------

    async getFriendshipStatus(userId: string, login: string) {

        // 1- Check if this login exist in the database
        // const friend = this.findPlayerByNickname(login);
        const friend = await this.prisma.player.findUnique({
            where: {
                nickname: login
            }
        });
        if (!friend) {
            throw new NotFoundException('Profile not found')
        }

        // 2- Check if this login is my friend or not
        // where me: sender or receiver && friend sender or receiver
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    {
                        senderId: userId,
                        receiverId: friend.id,
                    },

                    {
                        senderId: friend.id,
                        receiverId: userId,
                    }
                ],
            },
        });
        // It can return Null or Object
        return friendship;
    }

    async getFriendships(userId: string) {
        const me = await this.findPlayerById(userId);

        const friends = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        senderId: me.id,
                        status: "Friend",
                    },

                    {
                        receiverId: me.id,
                        status: "Friend",
                    }
                ]
            },
            // select is not working in this case, the explanation is below
        })

        // ==> We use map insted of select because select is not working in this case
        const friendsId = friends.map(user => {
            if (user.receiverId == me.id)
                return user.senderId
            return user.receiverId
        })
        // console.log(friendsId);
        return friendsId;
    }

    async getAllFriends(userId: string) {
        // console.log("Method Get All Friends, without the user himself");

        // 1- Get Friends Id from Friendship table
        const friendsId = await this.getFriendships(userId);
        // 2- Get Friends Profile from Player table
        const friends = await this.prisma.player.findMany({
            where: {
                id:
                {
                    in: friendsId,
                },
            },
            select: {
                id: true,
                nickname: true,
                avatar: true,
            }
        })
        // console.log(friends);
        return friends;
    }

    async getProfilesOfChatRooms(userId: string, room_id: string) {

        // console.log(" Method Get Profiles of Chat room, without the user himself", room_id);

        // 1- Check if this user member of this room
        const status = await this.getPermissions(userId, room_id);
        if (!status) {
            throw new NotFoundException("You are not member of this room");
        }
        // 2- Get all members of this room
        const members = await this.prisma.chatRoom.findUnique({
            where: {
                id: room_id
            },
            include: {
                all_members: {
                    where: {
                        playerId: {
                            not: userId,
                        }
                    },
                    include: {
                        player: {
                            select: {
                                nickname: true,
                                avatar: true,
                                id: true,
                            }
                        },
                    }
                }
            },
        })
        // console.log(members);
        return members.all_members.map(member => {  // all_members
            return {   // player
                id: member.playerId,
                nickname: member.player.nickname,
                avatar: member.player.avatar,
            }
        })
    }

    async getAllMembersOfThisRoom(userId: string, room_id: string) {
        // const me = await this.findPlayerById(userId); /// ERRor here
        // console.log(" MEthod one of get all members ", userId, " ", room_id);

        const ids = await this.prisma.chatRoom.findUnique({
            where: {
                id: room_id
            },
            select: {
                all_members: {
                    select: {
                        playerId: true
                    },
                    where: {
                        playerId: {
                            not: userId
                        },
                    },
                },
            },
        })
        // console.log(ids);
        return ids.all_members.map(user => user.playerId);
    }

    // 2 - list of friends that we can add to the chat room
    async getListOfFriendsToAddinThisRoom(userId: string, room_id: string) {
        // console.log("MEEEEEEThod two get all friends ", userId, room_id);

        // 1- Check if this user member of this room
        const status = await this.getPermissions(userId, room_id);
        if (!status) {
            throw new NotFoundException("You are not member of this room");
        }
        // 2- Get all members ids of this room except me
        const membersId = await this.getAllMembersOfThisRoom(userId, room_id);

        // 3- Get all friends
        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        senderId: userId,
                        status: "Friend",
                        NOT: {
                            receiverId: {
                                in: membersId,
                            },
                        },
                    },

                    {
                        receiverId: userId,
                        status: "Friend",
                        NOT: {
                            senderId: {
                                in: membersId,
                            },
                        },
                    }
                ]
            },

        })

        const friendsId = friendships.map(user => {
            if (user.receiverId == userId)
                return user.senderId
            return user.receiverId
        })

        // 3- Get all friends that are not members of this room
        const listFriendsToadd = await this.prisma.player.findMany({
            where: {
                id:
                {
                    in: friendsId,
                },
            },
            select: {
                nickname: true,
                avatar: true,
                // id: true,
            }
        })
        // console.log(" Method listFriendsToadd    FINIXHED");
        return listFriendsToadd;
    }

    ///////////////////////// HADCHI BA9i 5assou ytverifia /////////////////////////////////
    // 2 - list of friends that we can add to the chat room
    async getListOfFriendsToUpgradeAdmininThisRoom(userId: string, room_id: string) {
        const me = await this.findPlayerById(userId);
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: room_id
            },
            select: {
                all_members: {
                    select:
                    {
                        playerId: true
                    },
                    where:
                    {
                        AND:
                            [
                                {
                                    playerId: {
                                        not: me.id
                                    },
                                },
                                {
                                    statusMember: "member"
                                },
                                {
                                    is_banned: false,
                                },
                                {
                                    is_muted: false,
                                }
                            ],
                    },
                },
            },
        })
        return room.all_members.map(user => user.playerId);
    }

    // 2 - list of friends that we can add to the chat room
    async getListOfFriendsToMuteinThisRoom(userId: string, room_id: string) {
        const me = await this.findPlayerById(userId);
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: room_id
            },
            select: {
                all_members: {
                    select:
                    {
                        playerId: true
                    },
                    where:
                    {
                        AND:
                            [
                                {
                                    playerId: {
                                        not: me.id
                                    },
                                },
                                {
                                    statusMember: "member"
                                },
                                {
                                    is_banned: false,
                                },
                                {
                                    is_muted: false,
                                }
                            ],
                    },
                },
            },
        })
        return room.all_members.map(user => user.playerId);
    }

    // 2 - list of friends that we can add to the chat room
    async getListOfFriendsToUnmuteinThisRoom(userId: string, room_id: string) {
        const me = await this.findPlayerById(userId);
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: room_id
            },
            select: {
                all_members: {
                    select:
                    {
                        playerId: true
                    },
                    where:
                    {
                        AND:
                            [
                                {
                                    playerId: {
                                        not: me.id
                                    },
                                },
                                {
                                    statusMember: "member"
                                },
                                {
                                    is_banned: false,
                                },
                                {
                                    is_muted: true,
                                }
                            ],
                    },
                },
            },
        })
        return room.all_members.map(user => user.playerId);
    }

    // 2 - list of friends that we can add to the chat room
    async getListOfFriendsToBaninThisRoom(userId: string, room_id: string) {
        const me = await this.findPlayerById(userId);
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: room_id,
            },
            select: {
                all_members: {
                    select:
                    {
                        playerId: true
                    },
                    where:
                    {
                        AND:
                            [
                                {
                                    playerId: {
                                        not: me.id
                                    },
                                },
                                {
                                    statusMember: "member"
                                },
                                {
                                    is_banned: false,
                                },
                                {
                                    is_muted: false,
                                }
                            ],
                    },
                },
            },
        })
        return room.all_members.map(user => user.playerId);
    }

    // -------------------------- 2- Request FriendShip -------------------------------

    ///////////////////////////////// Ta hada mochkil 5asou yt7al ////////////////////////////////////////////

    // 1- create
    async createFriendship(userId: string, friendname: string) {

        // 1- Why i CAN'T use getPlayerByNickname ??
        const receiver = await this.prisma.player.findUnique({
            where: { nickname: friendname }
        });
        if (!receiver) {
            throw new NotFoundException("Nickname not found");
        }

        // 2- Send FriendShip Request
        const friends = await this.prisma.friendship.create({
            data: {
                senderId: userId,
                receiverId: receiver.id,
                status: "Pending"
            }
        })
        // return friends;
    }

    // 2- accept
    async acceptFriendship(userId: string, friendname: string) {
        const me = await this.findPlayerById(userId);
        const howa = await this.prisma.player.findUnique({
            where: { nickname: friendname },
        });
        if (!howa) {
            throw new NotFoundException("Nickname not found");
        }
        const ad = await this.prisma.friendship.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: howa.id,
                    receiverId: me.id
                }
            },
            // and status === friend
        })

        if (!ad)
            throw new NotFoundException("Request not found");

        const friendship = await this.prisma.friendship.update({
            where: {
                senderId_receiverId: {
                    senderId: howa.id,
                    receiverId: me.id
                }
            },
            // and status === friend
            data: {
                status: "Friend"
            }
        })

        // if (friendship) ==> status = friend
        // return friendship;
    }

    // 3- block // ana blockit howa[friendname]
    async blockFriendship(userId: string, friendname: string) {

        // const me = await this.findPlayerById(userId);
        const howa = await this.prisma.player.findUnique({
            where: { nickname: friendname },
        });
        if (!howa) {
            throw new NotFoundException("Profile not found");
        }

        // If no frienship exist create a friendship with status blocked
        const status = await this.getFriendshipStatus(userId, friendname);
        if (!status) {
            const friendship = await this.prisma.friendship.create({
                data: {
                    senderId: userId,
                    receiverId: howa.id,
                    status: "Block"
                }
            })
        }
        else {
            const friendship = await this.prisma.friendship.updateMany({

                where: {
                    OR: [
                        {
                            senderId: userId,
                            receiverId: howa.id,
                        },

                        {
                            senderId: howa.id,
                            receiverId: userId,
                        }
                    ]

                },
                // and status === friend
                data: {
                    status: "Block",
                    senderId: userId,
                    receiverId: howa.id,
                },
            })
        }
        // no return
    }

    // 4- delete aka unfriend [unblock]
    async deleteFriendship(userId: string, friendname: string) {
        const me = await this.findPlayerById(userId);
        const howa = await this.prisma.player.findUnique({
            where: { nickname: friendname },
        });
        if (!howa) {
            throw new NotFoundException("Profile not found");
        }

        const friendship = await this.prisma.friendship.delete({
            where: {
                senderId_receiverId: {
                    senderId: me.id,
                    receiverId: howa.id
                }
            },
        })

        // return friendship;
    }

    // 5- refuse
    async refuseFriendship(userId: string, friendname: string) {
        const me = await this.findPlayerById(userId);
        const howa = await this.prisma.player.findUnique({
            where: { nickname: friendname },
        });
        if (!howa) {
            throw new NotFoundException("Profile not found");
        }

        const friendship = await this.prisma.friendship.delete({
            where: {
                senderId_receiverId: {
                    senderId: howa.id,
                    receiverId: me.id
                }
            },
        })

        // return friendship;
    }


    // ------------------------------ 3- Chat ---------------------------------------------

    // 0- Create a chat room

    // function to create a chat room between two players if they are friends
    async createPublicChatRoom(userId: string, nameOfRoom: string) {
        // console.log("createPublicChatRoom");
        // console.log(" ---  -- -- -- - -- --  userId>>\n", userId);
        const me = await this.findPlayerById(userId);

        // owner create a room 
        // while creating the room create a member type(permission) and set it to owner

        const room = await this.prisma.chatRoom.create({
            data:
            {
                is_dm: false,
                is_public: true,
                name: nameOfRoom,

                all_members: {
                    create: [
                        {
                            statusMember: "owner",
                            // muted_until:new Date(),
                            // player:  {
                            //     connect:{
                            //        id: userId,
                            //     }
                            // },
                            muted_since: new Date(),
                            playerId: userId
                            // connect && include 
                        },
                    ],
                },
            },
        })
        // console.log("room\n", room);
        return room;
    }

    async createPrivateChatRoom(userId: string, nameOfRoom: string) {
        // const me = await this.findPlayerById(userId);

        // owner create a room 
        // while creating the room create a member type(permission) and set it to owner

        const room = await this.prisma.chatRoom.create({
            data:
            {
                is_dm: false,
                is_private: true,
                name: nameOfRoom,

                all_members: {
                    create: [
                        {
                            statusMember: "owner",
                            // muted_until:new Date(),
                            player: {
                                connect: {
                                    id: userId,
                                }
                            },
                            muted_since: new Date(),
                            // playerId: userId,
                            // connect && include 
                        },
                    ],
                },
            },
        })
        return room;
    }

    async createProtectedChatRoom(userId: string, Body: CreateProtectedRoomDto) {

        const room = await this.prisma.chatRoom.create({
            data:
            {
                is_dm: false,
                name: Body.name,
                is_protected: true,
                password: await bcrypt.hash(Body.pwd, 10),

                all_members: {
                    create: [
                        {
                            statusMember: "owner",
                            muted_since: new Date(),
                            playerId: userId,
                        },
                    ],
                },
            },
            select: {
                id: true,
                name: true,
                is_dm: true,
                is_protected: true,
                is_private: true,
                is_public: true,
                // all_members: {
                //     select: {
                //         statusMember: true,
                //         muted_until: true,
                //     },
                // },
            },
        })
        return room;
    }

    async DeletePwdToProtectedChatRoom(userId: string, room_id: string) {
        // console.log("room_id", room_id);

        // 1- check if this room exists and is protected
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: room_id,
                is_protected: true,
            },
            select: {
                id: true,
                name: true,
                is_dm: true,
                is_public: true,
                is_private: true,
                is_protected: true,
            }
        })
        if (!room) {
            throw new NotFoundException("Room not found");
        }

        // 2- check if the user is the owner of the room
        const permision = await this.prisma.permission.findFirst({
            where: {
                playerId: userId,
                roomId: room_id,
                statusMember: "owner",
            },
        })
        if (!permision) {
            throw new NotFoundException("You are not the owner of this room");
        }

        // 3- delete the password and update the room to be unprotected [is_protected = false] && [is_public = true]
        const roomUpdated = await this.prisma.chatRoom.update({
            where: {
                id: room_id,
            },
            data: {
                is_protected: false,
                is_public: true,
                password: null,
            },
        })
        return roomUpdated;
    }

    async SetPwdToPublicChatRoom(userId: string, Body: SetPwdToPublicChatRoomDto) {

        // 1- check if this room exists and is public
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: Body.room_id,
                is_public: true,
            },
            select: {
                id: true,
                name: true,
                is_dm: true,
                is_public: true,
                is_private: true,
                is_protected: true,
            }
        })
        if (!room) {
            throw new NotFoundException("Room not found");
        }

        // 2- check if the user is the owner of the room
        const permision = await this.prisma.permission.findFirst({
            where: {
                playerId: userId,
                roomId: Body.room_id,
                statusMember: "owner",
            },
        })
        if (!permision) {
            throw new NotFoundException("You are not the owner of this room");
        }

        // 3- set the password and update the room to be protected [is_public = false] && [is_protected = true]
        const roomUpdated = await this.prisma.chatRoom.update({
            where: {
                id: Body.room_id,
            },
            data: {
                is_protected: true,
                is_public: false,
                password: await bcrypt.hash(Body.pwd, 10),
            },
            select: {
                id: true,
                name: true,
                is_dm: true,
                is_public: true,
                is_private: true,
                is_protected: true,
                // all_members: {
                //     select: {
                //         statusMember: true,
                //         playerId: true,
                //     },
                // },
            }
        })
        return roomUpdated;
    }

    async UpdatePwdProtectedChatRoom(userId: string, Body: UpdateProtectedPasswordDto) {

        // 1- check if this room exists and is protected
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: Body.room_id,
                is_protected: true,
            },
        })
        if (!room) {
            throw new NotFoundException("Room not found");
        }

        // 2- check if the user is the owner of the room
        const permision = await this.prisma.permission.findFirst({
            where: {
                playerId: userId,
                roomId: Body.room_id,
                statusMember: "owner",
            },
        })
        if (!permision) {
            throw new NotFoundException("You are not the owner of this room");
        }

        // console.log("Body.new_password", Body.new_password);
        // 4- update the password of the room
        const roomUpdated = await this.prisma.chatRoom.update({
            where: {
                id: Body.room_id,
            },
            data: {
                password: await bcrypt.hash(Body.new_password, 10)
            },
            select: {
                id: true,
                name: true,
                is_dm: true,
                is_public: true,
                is_private: true,
                is_protected: true,
                // all_members: {
                //     select: {
                //         statusMember: true,
                //         playerId: true,
                //     },
                // },
            }
        })
        return roomUpdated;
    }

    // if type == DM
    async createDMRoom(userId: string, friendname: string) {
        // const sender = await this.findPlayerById(userId);
        const receiver = await this.prisma.player.findUnique({
            where: { nickname: friendname }
        });
        const room = await this.prisma.chatRoom.create({
            data:
            {
                name: friendname,
                all_members: {
                    create: [
                        {
                            statusMember: "member",
                            //muted_until:new Date(),
                            // player:  {
                            //     connect:{
                            //        id: me.id,
                            //     }
                            // },
                            muted_since: new Date(),
                            playerId: userId,
                            // connect && include 
                        },
                        {
                            statusMember: "member",
                            //muted_until:new Date(),
                            // player:  {
                            //     connect:{
                            //        id: me.id,
                            //     }
                            // },
                            muted_since: new Date(),
                            playerId: receiver.id
                            // connect && include 
                        },
                    ],
                },
            },
        })
        return room;
    }

    // 1- Get Permissions of the user in the room

    async getPermissions(userId: string, id_room: string) {
        // console.log("------------------------getPermissions------------------");
        let status = null;

        status = await this.prisma.permission.findFirst({
            where: {
                AND: [
                    { playerId: userId },
                    { roomId: id_room },
                ]
            },
            // select: {
            //     statusMember: true,
            //     is_banned: true,
            //     is_muted: true,
            // }
        })
        if (status && status.is_muted === true) {
            // console.log("status.duration", status.duration); // en minutes
            // console.log("status.muted_since.getTime() + 1000 * 60 * status.duration", status.muted_since.getTime() + 1000 * 60 * status.duration);
            // console.log("new Date().getTime()", new Date().getTime());
            if (status.muted_since.getTime() + 1000 * 60 * status.duration < new Date().getTime())
                status = await this.prisma.permission.update({
                    where: {
                        playerId_roomId: {
                            playerId: userId,
                            roomId: id_room,
                        },
                    },
                    data: {
                        is_muted: false,
                    },
                    select: {
                        statusMember: true,
                        is_banned: true,
                        is_muted: true,
                    }
                })
        }
        else (
            status = await this.prisma.permission.findFirst({
                where: {
                    AND: [
                        { playerId: userId },
                        { roomId: id_room },
                    ]
                },
                select: {
                    statusMember: true,
                    is_banned: true,
                    is_muted: true,
                }
            })
        )

        return status;
    }

    // 2- get history messages of a room

    // async getMessagesOfDM(user: any, id_room: any) {
    //     const me = await this.findPlayerById(user.nickname);

    //     const messages = await this.prisma.message.findMany({
    //         where: {
    //             AND: [
    //                 { senderId: me.id },
    //                 { roomId: id_room },
    //             ]
    //         },
    //     })
    //     return messages;
    // }

    async getMessagesOfRoom(userId: string, id_room: string) {
        const status = await this.prisma.permission.findUnique({
            where: {
                playerId_roomId: {
                    playerId: userId,
                    roomId: id_room
                }
            }
        })
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: id_room,
            },
        })
        if (status === null) {
            throw new NotFoundException("You can not a get a msgs of this room bcuz you are not member");
        }
        if (status && status.is_banned === true && room.is_dm === false)
            return [];
        // You can check if banned
        const blocked_list = await this.prisma.friendship.findMany({
            where: {
                AND: [
                    { status: "Block" },
                    {
                        OR: [
                            {
                                senderId: userId,
                            },
                            {
                                receiverId: userId,
                            },
                        ]
                    },
                ],
            }
        })
        // foreach vs map https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
        const blockedId = blocked_list.map(user => {
            if (user.receiverId == userId)
                return user.senderId
            return user.receiverId
        })
        const result = await this.prisma.message.findMany({
            where:
            {
                AND: [
                    {
                        roomId: id_room,
                    },
                    {
                        NOT: {
                            senderId: {
                                in: blockedId
                            },
                        },
                    },
                ],
            },
            orderBy:
            {
                createdAt: 'asc',
            },
            select: {
                sender: {
                    select: {
                        id: true,
                        nickname: true,
                        avatar: true,
                    }
                },
                id: true,
                msg: true,
                senderId: true,
                createdAt: true,
            },
        })
        return result;
    }

    // 3- send message in chat room 

    // async sendMessage(userId: string, room_id: string, message: string) {
    //     const me = await this.findPlayerById(userId);
    //     // const room = await this.prisma.chatRoom.findUnique({
    //     //     where: { id: room_id }
    //     // });

    //     // ASlan wa faslan makatcrea DM room ta receiver accept accept Friendship request
    //     // if friendship status is blocked
    //     // else (friendship status is friend)
    //     const messageSent = await this.prisma.message.create({
    //         data: {
    //             msg: message,
    //             senderId: me.id,
    //             roomId: room_id
    //         }
    //     })
    //     return messageSent;
    // }

    async sendMessageinRoom(userId: string, message: string, room_id: string) {
        const user = await this.findPlayerById(userId);
        const status = await this.prisma.permission.findUnique({
            where: {
                playerId_roomId: {
                    playerId: userId,
                    roomId: room_id,
                }
            }
        })

        if (status.is_banned === true)
            return [];
        if (status && status.is_muted === true) {
            if (status.muted_since.getTime() + 1000 * 60 * status.duration < new Date().getTime()) {
                await this.prisma.permission.update({
                    where: {
                        playerId_roomId: {
                            playerId: userId,
                            roomId: room_id,
                        },
                    },
                    data: {
                        is_muted: false,
                    }
                })
            }
            else
                return [];
        }
        const messageSent = await this.prisma.message.create({
            data: {
                msg: message,
                senderId: user.id,
                roomId: room_id
            }
        })
        return messageSent;
    }

    // 4- add new member to a chat room 

    async addMember(login: string, room_id: string) {
        // console.log("addMember ", login);
        const palyer = await this.findPlayerByNickname(login);
        const permission = await this.prisma.permission.create({
            data: {
                statusMember: "member",
                is_muted: false,
                muted_since: new Date(),
                is_banned: false,
                playerId: palyer.id,
                roomId: room_id,

            }
        })
        // console.log("permission ===>", permission);
        return permission;
    }

    // async joinDM(userId: string, login: string)
    // {
    //     // 0- check if login exists
    //     const user = await this.findPlayerById(login);

    //     let room = null;
    //     // 1- check if room already exists between those 2 users
    //     room = await this.getRoomBetweenTwoPlayers(userId, login);
    //     // 2- if not create a new room
    //     if (room === null)
    //     {
    //         const friendship = await this.getFriendshipStatus(userId, login);
    //         if (!friendship) {
    //             room = await this.createDMRoom(userId, login);
    //         }
    //         // status friendship: 0: Friend, 1: Pending, 2: Block
    //         else if (friendship.status === 'Pending') {
    //             room = await this.createDMRoom(userId, login);
    //         }
    //         else if (friendship.status === 'Block') {
    //             throw new NotFoundException("You can not send a message to this player");
    //         }
    //     }
    //     return await this.getRoomById(userId, room.id);
    // }

    async joinDM(userId: string, room_id: string) {
        const user = await this.findPlayerById(userId);

        let DM = null;
        // 1- check if DM already exists between those 2 users
        DM = await this.getRoomBetweenTwoPlayers(userId, user.nickname);
        // 2- if not create a new room
        if (DM === null) {
            const friendship = await this.getFriendshipStatus(userId, user.nickname);
            if (!friendship) {
                DM = await this.createDMRoom(userId, user.nickname);
            }
            // status friendship: 0: Friend, 1: Pending, 2: Block
            else if (friendship.status === 'Pending') {
                DM = await this.createDMRoom(userId, user.nickname);
            }
            else if (friendship.status === 'Block') {
                throw new NotFoundException("You can not send a message to this player");
            }
        }
        // return await this.getRoomById(userId, room.id);
        // const room = await this.getRoomById(userId, room_id);
        // console.log("room_id ===>", room_id);
        // const room = await this.findRoomById(room_id);
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: room_id,
            },
            select: {
                name: true,
                is_dm: true,
                is_public: true,
                is_private: true,
                is_protected: true,
                all_members: {
                    select: {
                        player: {
                            select: {
                                nickname: true,
                                id: true,
                            }
                        },
                    },
                },
            },
        }
        )
        if (room && room.is_dm === false) {
            throw new NotFoundException("This is not a DM room");
        }
        return room;
    }

    async joinRoom(userId: string, room_id: string) {
        // 1- find Room
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: room_id }
        });
        if (!room) {
            throw new NotFoundException("Room not found");
        }
        // 2- check if The Room is not a dm
        if (room.is_dm === true) {
            // create or getRoomID
            throw new NotFoundException("Cannot join a DM");
        }
        // 2- check if the Room is not protected
        if (room.is_protected === true) {
            throw new NotFoundException("You can't join a protected room");
        }
        // 3- create a permission to user to join the room if not created before
        const member = await this.getPermissions(userId, room_id);
        if (member && member.is_banned === true) {
            throw new UnauthorizedException("You are banned from this room");
        }
        if (!member && room.is_private === true) {
            throw new UnauthorizedException("You can't join a private room");
        }
        else if (!member && room.is_private === false) {
            const permission = await this.prisma.permission.create({
                data: {
                    playerId: userId,
                    roomId: room_id,
                    statusMember: "member",
                    is_muted: false,
                    muted_since: new Date(),
                    is_banned: false,
                }
            })
            // return permission;
        }
        return await this.getRoomById(userId, room.id);
    }

    async joinProtectedRoom(userId: string, { room_id, pwd }: JoinProtectedRoomDto) {
        // 1- find Room
        const room = await this.prisma.chatRoom.findFirst({
            where: { id: room_id }
        });
        if (!room) {
            throw new NotFoundException("Room not found");
        }
        // console.log("room", room);
        // 2- check if The Room is not a dm
        if (room.is_dm === true) {
            throw new NotFoundException("Cannot join a DM");
        }
        if (room.is_protected === false) {
            throw new NotFoundException("This is a not a protected room");
        }
        // 3- compare passwords
        // console.log("pwd", pwd);
        const areEqual = await bcrypt.compare(pwd, room.password);
        if (!areEqual) {
            throw new UnauthorizedException("Wrong password");
        }
        // 4- create a permission to user to join the room if not created before
        const member = await this.getPermissions(userId, room_id);
        if (member && member.is_banned === true) {
            throw new UnauthorizedException("You are banned from this room");
        }
        else if (!member) {
            const permission = await this.prisma.permission.create({
                data: {
                    playerId: userId,
                    roomId: room_id,
                    statusMember: "member",
                    is_muted: false,
                    muted_since: new Date(),
                    is_banned: false,
                }
            })
            return permission;
        }
        return await this.getRoomById(userId, room.id);
    }

    // 5- set member as admin if u are admin or owner

    async setAdmin(login: string, room_id: string) {
        const palyer = await this.findPlayerByNickname(login);

        const room = await this.prisma.permission.updateMany({
            where: {
                AND: [
                    { playerId: palyer.id },
                    { roomId: room_id }
                ],

            },
            data: {
                statusMember: "admin",
            },
        });
        // no return
    }

    async unsetAdmin(login: string, room_id: string) {
        const palyer = await this.findPlayerByNickname(login);

        const room = await this.prisma.permission.updateMany({
            where: {
                AND: [
                    { playerId: palyer.id },
                    { roomId: room_id }
                ],

            },
            data: {
                statusMember: "member",
            },
        });
        // no return
    }

    // 6- ban member if u are admin or owner

    async banMember(login: string, room_id: string/*, fix_date: Date*/) {
        // console.log("user login", login, "room id ", room_id);

        const palyer = await this.findPlayerByNickname(login);
        // if(!palyer)
        //   return ;

        const room = await this.prisma.permission.updateMany({
            where: {
                AND: [
                    { playerId: palyer.id },
                    { roomId: room_id }
                ],

            },
            data: {
                is_banned: true,
            },
        });
        // no return
    }

    // 6- ban member if u are admin or owner

    async kickMember(login: string, room_id: string) {
        const palyer = await this.findPlayerByNickname(login);

        const room = await this.prisma.permission.deleteMany({
            where: {
                AND: [
                    { playerId: palyer.id },
                    { roomId: room_id }
                ],

            },
        });
        // no return
    }

    // 7- mute OR umute member if u are admin or owner

    async muteMember(login: string, room_id: string, time: number) {
        const palyer = await this.findPlayerByNickname(login);

        // console.log("time", time);

        const room = await this.prisma.permission.updateMany({
            where: {
                AND: [
                    { playerId: palyer.id },
                    { roomId: room_id }
                ],

            },
            data: {
                is_muted: true,
                muted_since: new Date(),
                duration: time,
            },
        });
        // no return
    }

    async unmuteMember(login: string, room_id: string) {
        const palyer = await this.findPlayerByNickname(login);

        const room = await this.prisma.permission.updateMany({
            where: {
                AND: [
                    { playerId: palyer.id },
                    { roomId: room_id }
                ],

            },
            data: {
                is_muted: false,
                muted_since: new Date(),
            },
        });
        // no return
    }

    // 8- leave channel // delete the player from the permision

    async leaveChannel(userId: string, room_id: string) {
        const palyer = await this.findPlayerById(userId);

        const room = await this.prisma.permission.deleteMany({
            where: {
                AND: [
                    { playerId: palyer.id },
                    { roomId: room_id }
                ],

            },
        });
        // no return
    }

    //--------------------------------------------------------------------------------------------------------------------
    // A- get all games history

    async getAllGamesHistory() {
        const gameHistory = await this.prisma.game_history.findMany();
        // console.log("GAme History : ", gameHistory)
        return gameHistory;
    }

    // B - get games history By user
    async getGamesHistoryByUser(login: string) {
        // console.log('-----------------------------------------------');

        const palyer = await this.findPlayerByNickname(login);
        // console.log("The Player Of History is : ", palyer);
        // console.log('-----------------------------------------------');

        const gameHistory = await this.prisma.game_history.findMany({
            where:
            {
                OR: [
                    {
                        winner_id: palyer.id
                        //   {
                        //     // endsWith: 'prisma.io',
                        //   },
                    },
                    { looser_id: palyer.id },
                ],
                //   winner_id: palyer.id ,
                //     // AND: [
                //   OR:[
                //     {looser_id:palyer.id},
                //   ]
                // { looser_id: palyer.id },
                // ],
            }
        });

        const LostHistory = await this.prisma.game_history.findMany({
            where:
            {
                // AND: [
                looser_id: palyer.id,
                //   OR:[
                //     {looser_id:palyer.id},
                //   ]
                // { looser_id: palyer.id },
                // ],
            }
        });
        // console.log('-----------------------------------------------');
        // const history =  {
        //     ...gameHistory,
        //     ...LostHistory
        // }
        // console.log("--------------  Finish  getGamesHistoryByUser --------------------", gameHistory, " : ", palyer);
        // console.log("--------------  Finish  LostHistory --------------------",LostHistory," : ");

        // console.log('-----------------------------------------------');

        return gameHistory;
    }

    // C - get getAchivements by user
    async getAchivements(login: string) {
        const palyer = await this.findPlayerByNickname(login);

        const achievements = await this.prisma.achievements.findMany({
            where:
            {
                playerId: palyer.id,
            }
        });
        return achievements;
    }

}