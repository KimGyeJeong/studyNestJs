import { Body, Controller, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
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
  getPosts() {
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
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    // posts.push(post);
    posts = [...posts, post];
    return post;
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
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }
    
    posts = posts.map(prevPost => prevPost.id === +id ? post : prevPost);
    
    return post;
  }

  // 5) DELETE /posts/:id
  // post 삭제

}
