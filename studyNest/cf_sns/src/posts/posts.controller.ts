import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { PostsService } from './posts.service';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {
  }

  // 1) GET /posts
  // 모든 post 가져오기
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  // id에 해당하는 post 가져오기.
  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  // 3) POST /posts
  // post 생성
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(author, title, content);
  }

  // 4) Patch /posts/:id
  // post 수정
  @Patch(':id')
  patchPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, author, title, content);
  }

  // 5) DELETE /posts/:id
  // post 삭제
  @Delete(':id')
  deletePost(
    @Param('id') id: string,
  ) {
    return this.postsService.deletePost(+id);
  }

}
