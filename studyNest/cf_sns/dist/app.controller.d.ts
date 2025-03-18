import { Post } from '@nestjs/common';
import { AppService } from './app.service';
interface Post {
    author: string;
    title: string;
    content: string;
    likeCount: number;
    commentCount: number;
}
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getPost(): Post;
}
export {};
