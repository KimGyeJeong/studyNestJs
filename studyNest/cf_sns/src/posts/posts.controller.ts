import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post, UseGuards, Request, Query, UseInterceptors, UploadedFile, InternalServerErrorException
} from '@nestjs/common';
import {PostsService} from './posts.service';
import {AccessTokenGuard} from "src/auth/guard/bearer-token.guard";
import {User} from "src/users/decorator/user.decorator";
import {UsersModel} from "../users/entities/users.entity";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate_post.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {ImageModelType} from "../common/entities/image.entity";
import {DataSource} from "typeorm";
import {PostsImagesService} from "./image/image.service";
import {LogInterceptor} from "../common/interceptor/log.interceptor";


@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService,
                private readonly dataSource: DataSource,
                private readonly postsImagesService : PostsImagesService,
                ) {
    }

    // 1) GET /posts
    // 모든 post 가져오기
    @Get()
    @UseInterceptors(LogInterceptor)
    getPosts(@Query() query: PaginatePostDto) {
        // return this.postsService.getAllPosts();
        return this.postsService.paginatePosts(query);
    }

    // 2) GET /posts/:id
    // id에 해당하는 post 가져오기.
    @Get(':id')
    getPost(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.getPostById(id);
    }

    // ParseIntPipe 시 int형이 아닌 문자형(예. asdf)이 들어오면
    // {
    // "message": "Validation failed (numeric string is expected)",
    // "error": "Bad Request",
    // "statusCode": 400
    // }
    // 가 발생

    // 3) POST /posts
    // post 생성
    // DTO - Data Transfer Object
    @Post()
    @UseGuards(AccessTokenGuard)
    async postPosts(
        @User('id') userId: number,
        // @Body('title') title: string,
        // @Body('content') content: string,
        @Body() body: CreatePostDto,
    ) {
        
        // 이제 로직을 실행.
        try{
            const post = await this.postsService.createPost(userId, body, qr);

            for (let i = 0; i < body.images.length; i++) {

                await this.postsImagesService.createPostImage({
                    post, order: i, path: body.images[i], type: ImageModelType.POST_IMAGE
                }, qr);
            }
            
            await qr.commitTransaction();
            await qr.release();

            return this.postsService.getPostById(post.id);
        }catch (err){
            console.log('error : ', err);
            // 어떤 에러든 에러가 던져지면
            //트랜잭션을 종료하고 원래 상태로 되돌린다.
            await qr.rollbackTransaction();
            await qr.release();
            
            throw new InternalServerErrorException('ERROR')
        }
        
    }

    // 4) Patch /posts/:id
    // post 수정
    @Patch(':id')
    patchPost(
        @Param('id', ParseIntPipe) id: number,
        // @Body('title') title?: string,
        // @Body('content') content?: string,
        @Body() body: UpdatePostDto
    ) {
        return this.postsService.updatePost(id, body);
    }

    // 5) DELETE /posts/:id
    // post 삭제
    @Delete(':id')
    deletePost(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.postsService.deletePost(id);
    }

    // Create Sample
    // /posts/random
    @Post('random')
    @UseGuards(AccessTokenGuard)
    async postPostsRandom(@User() user: UsersModel) {
        await this.postsService.generateRandomPost(user.id);

        return true;
    }

}
