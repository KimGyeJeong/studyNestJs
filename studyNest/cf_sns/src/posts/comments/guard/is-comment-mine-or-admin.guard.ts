import {CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException} from "@nestjs/common";
import {Request} from "express";
import {UsersModel} from "../../../users/entity/users.entity";
import {RolesEnum} from "../../../users/const/roles.const";
import {CommentsService} from "../comments.service";

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
    constructor(private readonly commentsService: CommentsService) {
    }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest() as Request & { user: UsersModel };

        const {user} = req;

        if (!user) {
            throw new UnauthorizedException(`user does not exist`);
        }

        if (user.role === RolesEnum.ADMIN) {
            return true;
        }

        const commentId = req.params.commentId;

        const isMine = await this.commentsService.isCommentMine(user.id, parseInt(commentId));

        if (!isMine) {
            throw new ForbiddenException(`no authenticated comment id ${commentId}`);
        }

        return true;
    }
}