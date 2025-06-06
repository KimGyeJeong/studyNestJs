import {BadRequestException, MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {PostsService} from './posts.service';
import {PostsController} from './posts.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PostsModel} from './entities/posts.entity';
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";
import {CommonModule} from "../common/common.module";
import {ImageModel} from "../common/entities/image.entity";
import {PostsImagesService} from "./image/image.service";
import {LogMiddleware} from "../common/middleware/log.middleware";

@Module({
    controllers: [PostsController],
    providers: [PostsService, PostsImagesService],
    imports: [TypeOrmModule.forFeature([PostsModel, ImageModel]), AuthModule, UsersModule, CommonModule,
    ],
})
export class PostsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LogMiddleware).forRoutes({
            
            // 실제 경로가 /posts 인 것만 적용
            // path: 'posts',
            // posts 이후 모든것
            path: 'posts*',
            
            // 모든 요청  
            // method: RequestMethod.ALL
            // Get 요청
            method: RequestMethod.GET
        })
    }
}
