import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface Post{
  author:string;
  title:string;
  content:string;
  likeCount:number;
  commentCount:number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
