import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

interface Post{
  author:string;
  title:string;
  content:string;
  likeCount:number;
  commentCount:number;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPost(): Post {
    return {
      author : "글쓴이",
      title: "제목",
      content : "내용",
      likeCount : 999,
      commentCount : 2003,
    };
  }
}
