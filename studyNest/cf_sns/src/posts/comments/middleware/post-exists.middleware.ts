import {BadRequestException, Injectable, NestMiddleware, NotFoundException} from "@nestjs/common";
import {NextFunction, Request, Response} from "express";
import {PostsService} from "../../posts.service";

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
    constructor(private readonly postsService: PostsService) {
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const postId = req.params.postId;

        if (!postId) {
            throw new BadRequestException("PostId must be provided");
        }
        
        const exists = await this.postsService.checkPostExistsIsById(parseInt(postId));

        if (!exists) {
            throw new NotFoundException("PostId not found");
        }
        
        // next() 가 존재해야만 다음 단계로 넘어감.
        next();
    }
    
}