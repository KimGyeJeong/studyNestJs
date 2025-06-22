import {Controller, Get, Param, ParseIntPipe, Query} from '@nestjs/common';
import {CommentsService} from './comments.service';
import {PaginateCommentsDto} from "./dto/paginate-comments.dto";

@Controller('posts/:postId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {
    }

    /**
     * 1) Entity 생성
     * author --> 작성자
     * post --> 귀속되는 포스트
     * comment --> 실제 댓글 내용
     * likeCount --> 좋아요 갯수
     *
     * id --> PrimaryGeneratedColumn
     * createdAt --> 생성일자
     * updatedAt --> 업데이트 일자
     *
     * 2) GET() pagination
     * 3) GET(':commentId') 특정 comment 만 하나 가져오는 기능
     * 4) Post() comment 생성하는 기능
     * 5) Patch(':commentId') 특정 comment 업데이트 하는 기능
     * 6) Delete(':commentId') 특정 comment 삭제하는 기능
     */

    @Get()
    getComments(
        @Param('postId', ParseIntPipe) postId: number,
        @Query() query: PaginateCommentsDto,
    ) {
        return this.commentsService.paginateComments(query, postId);
    }
}
