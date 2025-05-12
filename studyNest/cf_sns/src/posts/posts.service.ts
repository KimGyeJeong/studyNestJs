import {Injectable, NotFoundException} from '@nestjs/common';
import {MoreThan, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {PostsModel} from './entities/posts.entity';
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate_post.dto";
import {HOST, PROTOCOL} from "../common/const/env.const";

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

    async generateRandomPost(userId: number) {
        for (let i = 0; i < 100; i++) {
            await this.createPost(userId, {
                title: `sample title ${i}`,
                content: `sample content ${i}`,
            });
        }
    }

    // 1) 오름차순으로 정렬하는 pagination만 구현
    async paginatePosts(dto: PaginatePostDto) {
        const posts = await this.postsRepository.find({
            where: {
                id: MoreThan(dto.where__id_more_than ?? 0),
            },
            order: {
                createdAt: dto.order__createdAt
            },
            take: dto.take,
        });
        /**
         * Response
         *
         * data: Data[]
         * cursor: {
         *     after: 마지막 data의 id
         * },
         * count: 응답한 데이터의 갯수
         * next: 다음 요청을 할때 사용할 URL
         */

            // 해당되는 포스트가 0개 이상이면
            // 마지막 포스트를가져오고 아니면 null을 반환한다.
        const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null;

        // const nextUrl = lastItem && new URL('http://localhost:3000/posts');
        const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);

        if (nextUrl) {
            /**
             * dto의 키값들을 루프돌면서
             * 키값에 해당되는 벨류가 존재하면
             * param에 그대로 붙여 넣는다.
             *
             * 단. where__id_more_than값만 lastItem의 마지막 값으로 넣어준다.
             */
            for (const key of Object.keys(dto)) {
                if (dto[key]) {
                    if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
                        nextUrl.searchParams.append(key, dto[key]);
                    }
                }
            }
            // let key = 'where__id_more_than';
            //
            // if (dto.order__createdAt === 'DESC')
            //     key = 'where__id_less_than';
            
            let key : string | null = null;
            
            if (dto.order__createdAt === 'ASC')
                key = 'where__id_more_than';
            else if (dto.order__createdAt === 'DESC')
                key = 'where__id_less_than';
            
            nextUrl.searchParams.append(key ?? '', lastItem.id.toString());
        }
        return {
            data: posts,
            cursor: {after: lastItem?.id ?? null},
            count: posts.length,
            next: nextUrl?.toString() ?? null,
        }
    }

    async getPostById(id: number) {
        const post = await this.postsRepository.findOne({where: {id}, relations: ['author']});

        if (!post) {
            throw new NotFoundException();
        }
        return post;
    }

    async createPost(authorId: number, postDTO: CreatePostDto) {
        // create --> db에 맞는 객체 생성
        // save --> db에 create로 생성한 객체 저장

        const post = this.postsRepository.create({
            author: {id: authorId}, ...postDTO, likeCount: 0, commentCount: 0,
        });

        return await this.postsRepository.save(post);
    }

    async updatePost(id: number, postDTO: UpdatePostDto) {
        const {title, content} = postDTO;
        // save 의 기능
        // 1. 만약에 데이터가 존재하지 않는다면 (id기준으로) 새로 생성함.
        // 2. 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트 한다.

        const post = await this.postsRepository.findOne({where: {id}});

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
        const post = await this.postsRepository.findOne({where: {id}});

        if (!post) {
            throw new NotFoundException();
        }

        await this.postsRepository.delete(post.id);

        return post.id;
    }
}
