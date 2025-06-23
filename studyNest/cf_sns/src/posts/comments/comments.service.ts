import {BadRequestException, Injectable} from '@nestjs/common';
import {CommonService} from "../../common/common.service";
import {PaginateCommentsDto} from "./dto/paginate-comments.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {CommentsModel} from "./entity/comments.entity";
import {Repository} from "typeorm";
import {CreateCommentsDto} from "./dto/create-comments.dto";
import {UsersModel} from "../../users/entity/users.entity";

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
                relations: {author: true,},
                where: {post: {id: postId}}
            }, `posts/${postId}/comments`
        );
    }

    async getCommentById(id: number) {
        const comment = await this.commentsRepository.findOne({
            where: {id},
            relations: {author: true}
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
}
