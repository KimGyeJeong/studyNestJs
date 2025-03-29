import {Controller, Get, Param, Patch, Post} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Role, UserModel} from "./entity/user.entity";
import {Repository} from "typeorm";
import {ProfileModel} from "./entity/profile.entity";

@Controller()
export class AppController {
    constructor(
        @InjectRepository(UserModel)
        private readonly userRepository: Repository<UserModel>,
        
        @InjectRepository(ProfileModel)
        private readonly profileRepository: Repository<ProfileModel>,
    ) {
    }

    @Post('users')
    postUser() {
        return this.userRepository.save({
            // title: 'test Title',
        });
    }

    @Get('users')
    getUsers() {
        return this.userRepository.find({
            relations : {
                profile: true,
            }
        });
    }

    @Patch('users/:id')
    async patchUser(@Param('id') id: string) {
        const user = await this.userRepository.findOne({
            where: {id: parseInt(id)}
        });

        return this.userRepository.save({
            ...user,
            // title: user?.title + '@',
        })
    }
    
    @Post('user/profile')
    async createUserAndProfile(){
        const user = await this.userRepository.save({
            email : 'user@gmail.com',
        });
        
        const profile = await this.profileRepository.save({
            profileImg : 'img.png',
            user,
        });
        
        return user;
    }
}
