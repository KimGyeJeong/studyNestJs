import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PostsService } from './posts.service';

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: '작가1',
    title: '제목1',
    content: '글1',
    likeCount: 999,
    commentCount: 103,
  },
  {
    id: 2,
    author: '작가2',
    title: '제목2',
    content: '글2',
    likeCount: 994,
    commentCount: 111,
  },
  {
    id: 3,
    author: '작가3',
    title: '제목3',
    content: '글3',
    likeCount: 3,
    commentCount: 23,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {
  }

  // 1) GET /posts
  // 모든 post 가져오기
  @Get()
  getPosts(){
    return posts;
  }
  
  // 2) GET /posts/:id
  // id에 해당하는 post 가져오기.
  @Get(':id')
  getPost(@Param('id') id: string) {
    const post = posts.find((post) => post.id === +id);
    
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }
  
  // 3) POST /posts
  // post 생성
  
  // 4) PUT /posts/:id
  // post 수정
  
  // 5) DELETE /posts/:id
  // post 삭제

}
