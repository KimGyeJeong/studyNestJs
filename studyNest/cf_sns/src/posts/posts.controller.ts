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
    Post, UseGuards, Request, Query
} from '@nestjs/common';
import {PostsService} from './posts.service';
import {AccessTokenGuard} from "src/auth/guard/bearer-token.guard";
import {User} from "src/users/decorator/user.decorator";
import {UsersModel} from "../users/entities/users.entity";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate_post.dto";


@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {
    }

    // 1) GET /posts
    // 모든 post 가져오기
    @Get()
    getPosts(@Query() query: PaginatePostDto) {
        return this.postsService.getAllPosts();
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
    postPosts(
        @User('id') userId: number,
        // @Body('title') title: string,
        // @Body('content') content: string,
        @Body() body: CreatePostDto
    ) {
        return this.postsService.createPost(userId, body);
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

}
