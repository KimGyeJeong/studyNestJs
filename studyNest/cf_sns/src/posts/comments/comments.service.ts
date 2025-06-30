import {BadRequestException, Injectable} from '@nestjs/common';
import {CommonService} from "../../common/common.service";
import {PaginateCommentsDto} from "./dto/paginate-comments.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {CommentsModel} from "./entity/comments.entity";
import {Repository} from "typeorm";
import {CreateCommentsDto} from "./dto/create-comments.dto";
import {UsersModel} from "../../users/entity/users.entity";
import {DEFAULT_POST_FIND_OPTIONS} from "./const/default-comment-find-options.const";
import {UpdateCommentsDto} from "./dto/update-comments.dto";

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(CommentsModel)
        private readonly commentsRepository: Repository<CommentsModel>,
        private readonly commonService: CommonService,
    ) {
    }

    paginateComments(
        dto: PaginateCommentsDto,
        postId: number
    ) {
        return this.commonService.paginate(
            dto, this.commentsRepository, {
                ...DEFAULT_POST_FIND_OPTIONS,
                where: {post: {id: postId}},
            }, `posts/${postId}/comments`
        );
    }

    async getCommentById(id: number) {
        const comment = await this.commentsRepository.findOne({
            ...DEFAULT_POST_FIND_OPTIONS,
            where: {id},
        })

        if (!comment) {
            throw new BadRequestException(`id: ${id} not found`);
        }

        return comment;
    }

    async createComment(dto: CreateCommentsDto, postId: number, author: UsersModel,) {
        return this.commentsRepository.save({
            ...dto,
            post: {
                id: postId,
            },
            author,
        })
    }

    async updateComment(dto: UpdateCommentsDto, commentId: number) {
        const prevComment = await this.commentsRepository.preload({
            id: commentId,
            ...dto,
        });

        if (!prevComment) {
            throw new BadRequestException(`id: ${commentId} not found`);
        }

        return await this.commentsRepository.save(
            prevComment,
        );
    }

    async deleteComment(id: number) {

        const comment = await this.commentsRepository.findOne({
            where: {id}
        });

        if (!comment) {
            throw new BadRequestException(`id: comment ${id} not found`);
        }

        await this.commentsRepository.delete({
            id
        });

        return id;
    }

    async isCommentMine(userId: number, commentId: number) {
        return await this.commentsRepository.exists({
            where: {
                id: commentId,
                author: {id: userId}
            },
            relations: {
                author: true,
            }
        });
    }
}
