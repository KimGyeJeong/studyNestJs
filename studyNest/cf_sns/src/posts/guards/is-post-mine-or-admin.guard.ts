import {BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {RolesEnum} from "../../users/const/roles.const";
import {PostsService} from "../posts.service";
import {UsersModel} from "../../users/entity/users.entity";
import { Request } from 'express';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
    constructor(
        private readonly postsService: PostsService
    ) {

    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest() as Request & { user: UsersModel };

        const {user} = req;

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        /**
         * admin인 경우 그냥 패스
         */
        if (user.role === RolesEnum.ADMIN) {
            return true;
        }

        const postId = req.params.postId;
        
        if (!postId){
            throw new BadRequestException(`postId must be provided`);
        }


        return this.postsService.isPostMine(user.id, parseInt(postId));
    }
}