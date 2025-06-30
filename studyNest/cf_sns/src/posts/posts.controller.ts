import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch, UseFilters,
    Post, UseGuards, Request, Query, UseInterceptors, UploadedFile, InternalServerErrorException, BadRequestException
} from '@nestjs/common';
import {PostsService} from './posts.service';
import {AccessTokenGuard} from "src/auth/guard/bearer-token.guard";
import {User} from "src/users/decorator/user.decorator";
import {UsersModel} from "../users/entity/users.entity";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate_post.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {ImageModelType} from "../common/entity/image.entity";
import {DataSource, QueryRunner as QR} from "typeorm";
import {PostsImagesService} from "./image/image.service";
import {LogInterceptor} from "../common/interceptor/log.interceptor";
import {TransactionInterceptor} from "../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../common/decorator/query-runner.decorator";
import {HttpExceptionFilter} from "../common/exception-filter/http.exception-filter";
import {Roles} from "../users/decorator/roles.decorator";
import {RolesEnum} from "../users/const/roles.const";
import {IsPublic} from "../common/decorator/is-public.decorator";
import {IsPostMineOrAdminGuard} from "./guards/is-post-mine-or-admin.guard";


@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService,
                private readonly dataSource: DataSource,
                private readonly postsImagesService: PostsImagesService,
    ) {
    }

    // 1) GET /posts
    // 모든 post 가져오기
    @Get()
    @IsPublic()
    @UseInterceptors(LogInterceptor)
    // @UseFilters(HttpExceptionFilter)
    getPosts(@Query() query: PaginatePostDto) {
        // 강제 에러 발생
        // throw new BadRequestException('Test Error');
        
        
        // return this.postsService.getAllPosts();
        return this.postsService.paginatePosts(query);
    }

    // 2) GET /posts/:id
    // id에 해당하는 post 가져오기.
    @Get(':id')
    @IsPublic()
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
    @UseInterceptors(TransactionInterceptor)
    async postPosts(
        @User('id') userId: number,
        // @Body('title') title: string,
        // @Body('content') content: string,
        @Body() body: CreatePostDto,
        @QueryRunner() qr: QR
    ) {

        const post = await this.postsService.createPost(userId, body, qr);

        // console.log('postPosts : ', post);
        for (let i = 0; i < body.images.length; i++) {

            await this.postsImagesService.createPostImage({
                post, order: i, path: body.images[i], type: ImageModelType.POST_IMAGE
            }, qr);
        }

        return await this.postsService.getPostById(post.id, qr);
    }

    // 4) Patch /posts/:postId
    // post 수정
    @Patch(':postId')
    @UseGuards(IsPostMineOrAdminGuard)
    patchPost(
        @Param('postId', ParseIntPipe) postId: number,
        // @Body('title') title?: string,
        // @Body('content') content?: string,
        @Body() body: UpdatePostDto
    ) {
        return this.postsService.updatePost(postId, body);
    }

    // 5) DELETE /posts/:id
    // post 삭제
    @Delete(':id')
    @Roles(RolesEnum.ADMIN) // 역할이 admin 인 경우에만 삭제 가능
    deletePost(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.postsService.deletePost(id);
    }

    // Create Sample
    // /posts/random
    @Post('random')
    async postPostsRandom(@User() user: UsersModel) {
        await this.postsService.generateRandomPost(user.id);

        return true;
    }
    
    // RBAC--> Role-Based Access Control

}
