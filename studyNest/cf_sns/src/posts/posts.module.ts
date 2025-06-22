import {BadRequestException, MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {PostsService} from './posts.service';
import {PostsController} from './posts.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PostsModel} from './entity/posts.entity';
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";
import {CommonModule} from "../common/common.module";
import {ImageModel} from "../common/entity/image.entity";
import {PostsImagesService} from "./image/image.service";
import {LogMiddleware} from "../common/middleware/log.middleware";

@Module({
    controllers: [PostsController],
    providers: [PostsService, PostsImagesService],
    imports: [TypeOrmModule.forFeature([PostsModel, ImageModel]), AuthModule, UsersModule, CommonModule,
    ],
})
export class PostsModule {

}
