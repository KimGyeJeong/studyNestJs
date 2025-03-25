import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';

export interface PostModel {
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


@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly  postsRepository : Repository<PostsModel>) {
  }
  
  async getAllPosts(){
    return await this.postsRepository.find();
  }
  
  getPostById(id: number){
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }
  
  createPost(author:string, title:string, content: string){
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

  updatePost(id: number, author: string | undefined, title: string | undefined, content: string | undefined){
    const post = posts.find((post) => post.id === id);

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

    posts = posts.map(prevPost => prevPost.id === id ? post : prevPost);

    return post;
  }
  
  deletePost(id: number){
    const post = posts.find((post) => post.id === id);

    if (!post) {
      throw new NotFoundException();
    }
    posts = posts.filter(posts => posts.id !== id);

    return id;
  }
}
