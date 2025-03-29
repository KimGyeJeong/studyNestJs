import {Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Role, UserModel} from "./entity/user.entity";
import {Repository} from "typeorm";
import {ProfileModel} from "./entity/profile.entity";
import {PostModel} from "./entity/post.entity";
import {TagModel} from "./entity/tag.entity";

@Controller()
export class AppController {
    constructor(
        @InjectRepository(UserModel)
        private readonly userRepository: Repository<UserModel>,
        
        @InjectRepository(ProfileModel)
        private readonly profileRepository: Repository<ProfileModel>,
        
        @InjectRepository(PostModel)
        private readonly postRepository: Repository<PostModel>,
        
        @InjectRepository(TagModel)
        private readonly tagRepository: Repository<TagModel>,
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
            // OneToOne 에 옵션으로 eager:true를 넣어주면 아래의 relations 는 자동으로 생성됨.
            // relations : {
            //     profile: true,
            //     posts: true,
            // }
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
        // const user = await this.userRepository.save({
        //     email : 'user@gmail.com',
        // });
        //
        // const profile = await this.profileRepository.save({
        //     profileImg : 'img.png',
        //     user,
        // });
        
        //OneToOne에 옵션으로 cascade:true 으로 지정시에 아래처럼 한꺼번에 저장가능.
        // 기본값 false 이기 때문에 위의 코드 const user, const profile으로 실행해야함.
        const user = await this.userRepository.save({
            email : 'user@gmail.com',
            profile: {
                profileImg : 'img.png'
            }
        })
        
        return user;
    }
    
    @Post('user/post')
    async createUserAndPosts(){
        const user = await this.userRepository.save({
            email: 'userPost@gmail.com',
        });
        
        await this.postRepository.save({
            title: 'post1',
            author : user,
        });
        
        await this.postRepository.save({
            title: 'post2',
            author : user,
        });
        
        return user;
    }
    
    @Post('posts/tags')
    async createTag(){
        const post1 = await this.postRepository.save({
            title: 'tag test1',
        });

        const post2 = await this.postRepository.save({
            title: 'tag test2',
        });
        
        const tag1 = await this.tagRepository.save({
            name: 'tag 1',
            posts : [post1, post2],
        });

        const tag2 = await this.tagRepository.save({
            name: 'tag 2',
            posts : [post2],
        });
        
        const post3 = await this.postRepository.save({
            title: 'tag test3',
            tags : [tag1, tag2],
        });
        
        return true;
    }
    
    @Get('posts')
    getPosts() {
        return this.postRepository.find({
            relations : {
                tags : true,
            }
        })
    }
    
    @Get('tags')
    getTags(){
        return this.tagRepository.find({
            relations : {
                posts : true,
            }
        })
    }
    
    @Delete('user/profile/:id')
    async deleteProfile(@Param('id') id: string) {
        await this.profileRepository.delete(+id);
        
    }
}
