import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import {CreatePostDto} from "./dto/create-post.dto";

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
    private readonly postsRepository: Repository<PostsModel>) {
  }

  async getAllPosts() {
    return await this.postsRepository.find({
      relations: ['author'],
    });
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({ where: { id }, relations: ['author'] });

    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async createPost(authorId: number, postDTO: CreatePostDto) {
    // create --> db에 맞는 객체 생성
    // save --> db에 create로 생성한 객체 저장

    const post = this.postsRepository.create({
      author:{id: authorId}, ...postDTO, likeCount: 0, commentCount: 0,
    });

    return await this.postsRepository.save(post);
  }

  async updatePost(id: number, title: string | undefined, content: string | undefined) {
    // save 의 기능
    // 1. 만약에 데이터가 존재하지 않는다면 (id기준으로) 새로 생성함.
    // 2. 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트 한다.
    
    const post = await this.postsRepository.findOne({where: { id }});

    if (!post) {
      throw new NotFoundException();
    }
    
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    // update
    return await this.postsRepository.save(post);
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException();
    }
    
    await this.postsRepository.delete(post.id);

    return post.id;
  }
}
