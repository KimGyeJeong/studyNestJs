import {Injectable} from '@nestjs/common';
import {CommonService} from "../../common/common.service";
import {PaginateCommentsDto} from "./dto/paginate-comments.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {CommentsModel} from "./entity/comments.entity";
import {Repository} from "typeorm";

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
            dto, this.commentsRepository, {where: {post: {id: postId}}}, `posts/${postId}/comments`
        );
    }
}
