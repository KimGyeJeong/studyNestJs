import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UsersModel} from "./entity/users.entity";
import {Repository} from "typeorm";
import {UserFollowersModel} from "./entity/user-followers.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel)
        private readonly usersRepository: Repository<UsersModel>,
        @InjectRepository(UserFollowersModel)
        private readonly userFollowersRepository: Repository<UserFollowersModel>,
    ) {
    }

    async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
        // 1. 닉네임 중복 확인. exists() 사용. 값이있으면 true 반환
        const isExistsNickName = await this.usersRepository.exists({
            where: {nickname: user.nickname},
        })
        if (isExistsNickName) {
            throw new BadRequestException('Nickname already exists');
        }
        // 2. 이메일 중복 확인.
        const isExistsEmail = await this.usersRepository.exists({
            where: {email: user.email},
        });
        if (isExistsEmail) {
            throw new BadRequestException('Email already exists');
        }
        const userObject = this.usersRepository.create({
            nickname: user.nickname,
            email: user.email,
            password: user.password,
        });

        const savedUser = await this.usersRepository.save(user);

        return savedUser;
    }

    async getAllUsers() {
        return await this.usersRepository.find();
    }

    async getUserByEmail(email: string) {
        return this.usersRepository.findOne({
            where: {
                email,
            },
        });
    }

    async followUser(followerId: number, followeeId: number) {
        const result = await this.userFollowersRepository.save({
            follower: {
                id: followerId,
            },
            followee: {
                id: followeeId,
            }
        });

        return true;
    }

    async getFollowers(userId: number, includedNotConfirmed: boolean) {
        
        const where = {
            followee: {
                id: userId,
            },
        };
        
        if (!includedNotConfirmed){
            where['isConfirmed'] = true;
        }
        
        const result = await this.userFollowersRepository.find({
            where,
            relations: {
                follower: true,
                followee: true,
            }
        })

        if (!result) {
            throw new BadRequestException(`follower ${userId} not found}`);
        }

        return result.map((x) => ({
            id: x.follower.id,
            nickname : x.follower.nickname,
            email : x.follower.email,
            isConfirmed : x.isConfirmed
        }));
    }

    async confirmFollow(followerId: number, followeeId: number) {
        const existing = await this.userFollowersRepository.findOne({
            where: {
                follower: {id: followerId},
                followee: {id: followeeId},
            },
            relations : {follower : true, followee : true}
        });
        
        if (!existing) {
            throw new BadRequestException(`none exist follow request`);
        }
        
        await this.userFollowersRepository.save({
            ...existing,
            isConfirmed : true,
        });
        
        return true;
    }
    
    async deleteFollow(followerId: number, followeeId: number){
        await this.userFollowersRepository.delete({
            follower : {id : followerId},
            followee : {id: followeeId}
        });
        
        return true;
    }
}
