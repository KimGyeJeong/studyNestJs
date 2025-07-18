import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {FindOptionsWhere, LessThan, MoreThan, QueryRunner, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {PostsModel} from './entity/posts.entity';
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate_post.dto";
import {CommonService} from "../common/common.service";
import {ConfigService} from "@nestjs/config";
import {ENV_HOST_KEY, ENV_PROTOCOL_KEY} from "../common/const/env-keys.const";
import {join, basename} from "path";
import {POST_IMAGE_PATH, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH} from "../common/const/path.const";
import {promises} from 'fs';
import {CreatePostImageDto} from "./image/dto/create-image.dto";
import {ImageModel} from "../common/entity/image.entity";
import {DEFAULT_POST_FIND_OPTIONS} from "./const/default-post-find-options.const";

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostsModel)
        private readonly postsRepository: Repository<PostsModel>,
        @InjectRepository(ImageModel)
        private readonly imageRepository: Repository<ImageModel>,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
    ) {
    }

    async getAllPosts() {
        return await this.postsRepository.find({
            ...DEFAULT_POST_FIND_OPTIONS
        });
    }

    async generateRandomPost(userId: number) {
        for (let i = 0; i < 100; i++) {
            await this.createPost(userId, {
                title: `sample title ${i}`,
                content: `sample content ${i}`,
                images: [],
            });
        }
    }

    // 1) 오름차순으로 정렬하는 pagination만 구현
    async paginatePosts(dto: PaginatePostDto) {
        // if (dto.page) {
        //     return this.pagePaginatePosts(dto);
        // } else {
        //     return this.cursorPaginatePosts(dto)
        // }
        return this.commonService.paginate(dto, this.postsRepository, {
            ...DEFAULT_POST_FIND_OPTIONS,
        }, 'posts');

    }

    async pagePaginatePosts(dto: PaginatePostDto) {
        /**
         * data : Data[],
         * total: number,
         * next: ?? (url 넣어주어도 괜찮음) --> 잘쓰이지는 않음
         *
         * [1] [2] [3]... 형식으로 화면에 페이지들이 구현되어있음
         */

        const [posts, count] = await this.postsRepository.findAndCount({
            order: {
                createdAt: dto.order__createdAt,
            },
            take: dto.take,
            skip: dto.take * ((dto.page ?? 1) - 1),
        });

        return {data: posts, total: count,};
    }

    async cursorPaginatePosts(dto: PaginatePostDto) {
        const where: FindOptionsWhere<PostsModel> = {};

        if (dto.where__id__less_than) {
            where.id = LessThan(dto.where__id__less_than);
        } else if (dto.where__id__more_than) {
            where.id = MoreThan(dto.where__id__more_than);
        }

        const posts = await this.postsRepository.find({
            where,
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
        const nextUrl = lastItem && new URL(`${this.configService.get<string>(ENV_PROTOCOL_KEY)}://${this.configService.get<string>(ENV_HOST_KEY)}/posts`);

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
                    if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
                        nextUrl.searchParams.append(key, dto[key]);
                    }
                }
            }
            // let key = 'where__id_more_than';
            //
            // if (dto.order__createdAt === 'DESC')
            //     key = 'where__id_less_than';

            let key: string | null = null;

            if (dto.order__createdAt === 'ASC')
                key = 'where__id__more_than';
            else if (dto.order__createdAt === 'DESC')
                key = 'where__id__less_than';

            nextUrl.searchParams.append(key ?? '', lastItem.id.toString());
        }
        return {
            data: posts,
            cursor: {after: lastItem?.id ?? null},
            count: posts.length,
            next: nextUrl?.toString() ?? null,
        }
    }

    async getPostById(id: number, qr?: QueryRunner) {
        const repository = this.getRepository(qr);

        const post = await repository.findOne({
            ...DEFAULT_POST_FIND_OPTIONS,
            where: {id},
        });

        if (!post) {
            throw new NotFoundException();
        }
        return post;
    }

    getRepository(qr?: QueryRunner) {
        return qr ? qr.manager.getRepository<PostsModel>(PostsModel) : this.postsRepository;
    }

    async createPost(authorId: number, postDTO: CreatePostDto, qr?: QueryRunner) {
        // create --> db에 맞는 객체 생성
        // save --> db에 create로 생성한 객체 저장

        const repository = this.getRepository(qr);

        const post = repository.create({
            author: {id: authorId}, ...postDTO, images: [], likeCount: 0, commentCount: 0,
        });

        return await repository.save(post);
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

    async checkPostExistsIsById(id: number) {
        return await this.postsRepository.exists({where: {id}});
    }

    async isPostMine(userId: number, postId: number) {
        return this.postsRepository.exists({
            where: {
                id: postId,
                author: {
                    id: userId
                }
            },
            relations: {
                author: true
            }
        })
    }

    async incrementCommentCount(postId: number, qr?: QueryRunner) {
        const repository = this.getRepository(qr);

        await repository.increment({id: postId}, 'commentCount', 1);
    }

    async decrementCommentCount(postId: number, qr?: QueryRunner) {
        const repository = this.getRepository(qr);

        await repository.decrement({id: postId}, 'commentCount', 1);
    }
}
