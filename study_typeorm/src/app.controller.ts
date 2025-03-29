import {Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Role, UserModel} from "./entity/user.entity";
import {
    Between,
    Equal,
    ILike, In, IsNull,
    LessThan,
    LessThanOrEqual,
    Like,
    MoreThan,
    MoreThanOrEqual,
    Not,
    Repository
} from "typeorm";
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
    async postUser() {
        for (let i=0; i<100; i++){
            await this.userRepository.save({
                email : `user-${i}.google.com`,
            })
        }
    }

    @Get('users')
    getUsers() {
        return this.userRepository.find({
            // OneToOne 에 옵션으로 eager:true를 넣어주면 아래의 relations 는 자동으로 생성됨.
            // relations : {
            //     profile: true,
            //     posts: true,
            // }

            //FindManyOption 옵션
            // select. 어떤 프로퍼티를 선택해서 가져올지.
            // select를 정의하지 않으면 기본으로 모든 프로퍼티를 가져온다.
            // 기본값. select : {}
            // select: {
            //     id: true,
            //     createdAt: true,
            //     updatedAt: true,
            //     //relations 추가한 이후
            //     profile : {
            //         id : true,
            //     }
            // },
            /*
            [
  {
    "id": 1,
    "createdAt": "2025-03-28T17:16:30.906Z",
    "updatedAt": "2025-03-28T17:16:30.906Z"
  },
  {
    "id": 2,
    "createdAt": "2025-03-28T17:16:57.730Z",
    "updatedAt": "2025-03-28T17:16:57.730Z"
  }] 형태로 리턴
             */

            // where. 필터링할 조건을 입력하게 된다.
            // and 형식으로 사용할 경우
            // where: {
            //     id: 1,
            //     version : 1,
            //     //relations 추가한 이후
            //     profile: {
            //         id : 1
            //     }
            // },
            /*
            [
  {
    "id": 1,
    "createdAt": "2025-03-28T17:16:30.906Z",
    "updatedAt": "2025-03-28T17:16:30.906Z"
  }
]
             */
            // // or 형식으로 사용할 경우
            // where : [
            //     { id : 1},{version : 1}
            // ]
            
            // WHERE 유틸리티
            where : {
                // id가 1이 아닌 경우
                // id : Not(1),
                
                // 작은경우
                // id : LessThan(10),
                
                // 작거나 같은경우
                // id : LessThanOrEqual(10),
                
                // 큰 경우
                // id : MoreThan(10),
                
                // 작거나 큰경우
                // id : MoreThanOrEqual(10),
                
                // 같은 경우
                // id : Equal(10),
                
                // 유사값
                // email : Like('google'), // 아무것도 안나옴.
                // email : Like('%google%'),
                
                // 대문자 소문자 구분없는 유사값
                // email : ILike('%GOOGLE%'),
                
                // 사이값
                // id : Between(10, 15),
                
                // 해당되는 여러개의 값
                // id : In([1,2,3,4,31]),
                
                // null인 경우
                // id : IsNull(),
                
                //isnull은 typeorm이 지원하나 isnotnull은 지원하지 않음. 이런경우 QueryBuilder 를 사용해야 함.
            }
            
            // 관계를 가져오는 법
            // relations : {
            //     profile : true
            // },
            
            // 순서
            // ASC : 오름차
            // DESC : 내림차
            // order : {
            //     id : 'ASC',
            // },
            
            // 처음 몇개를 제외할지
            // 기본값 0
            // skip : 2,
            
            // 몇개를 가져올지
            // 기본값. table의 전체. take : 0 과 동일
            // take : 1,
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
    async createUserAndProfile() {
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
            email: 'user@gmail.com',
            profile: {
                profileImg: 'img.png'
            }
        })

        return user;
    }

    @Post('user/post')
    async createUserAndPosts() {
        const user = await this.userRepository.save({
            email: 'userPost@gmail.com',
        });

        await this.postRepository.save({
            title: 'post1',
            author: user,
        });

        await this.postRepository.save({
            title: 'post2',
            author: user,
        });

        return user;
    }

    @Post('posts/tags')
    async createTag() {
        const post1 = await this.postRepository.save({
            title: 'tag test1',
        });

        const post2 = await this.postRepository.save({
            title: 'tag test2',
        });

        const tag1 = await this.tagRepository.save({
            name: 'tag 1',
            posts: [post1, post2],
        });

        const tag2 = await this.tagRepository.save({
            name: 'tag 2',
            posts: [post2],
        });

        const post3 = await this.postRepository.save({
            title: 'tag test3',
            tags: [tag1, tag2],
        });

        return true;
    }

    @Get('posts')
    getPosts() {
        return this.postRepository.find({
            relations: {
                tags: true,
            }
        })
    }

    @Get('tags')
    getTags() {
        return this.tagRepository.find({
            relations: {
                posts: true,
            }
        })
    }

    @Delete('user/profile/:id')
    async deleteProfile(@Param('id') id: string) {
        await this.profileRepository.delete(+id);

    }
}
