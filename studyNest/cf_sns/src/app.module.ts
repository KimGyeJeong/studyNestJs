import {ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PostsModule} from './posts/posts.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PostsModel} from './posts/entity/posts.entity';
import {UsersModel} from "./users/entity/users.entity";
import {ImageModel} from "./common/entity/image.entity";
import {UsersModule} from "./users/users.module";
import {AuthModule} from './auth/auth.module';
import {CommonModule} from './common/common.module';
import {APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {ConfigModule} from "@nestjs/config";
import * as process from "node:process";
import {
    ENV_DB_DATABASE_KEY,
    ENV_DB_HOST_KEY,
    ENV_DB_PASSWORD_KEY,
    ENV_DB_PORT_KEY,
    ENV_DB_USERNAME_KEY
} from "./common/const/env-keys.const";
import {ServeStaticModule} from "@nestjs/serve-static";
import {PUBLIC_FOLDER_PATH} from "./common/const/path.const";
import {LogMiddleware} from "./common/middleware/log.middleware";
import {ChatsModule} from './chats/chats.module';
import {ChatsModel} from "./chats/entity/chats.entity";
import {MessagesModel} from "./chats/messages/entity/messages.entity";
import {CommentsModule} from './posts/comments/comments.module';
import {CommentsModel} from "./posts/comments/entity/comments.entity";
import {RolesGuard} from "./users/guard/roles.guard";

@Module({
    imports: [PostsModule, ServeStaticModule.forRoot({
        rootPath: PUBLIC_FOLDER_PATH,
        serveRoot: '/public'
    }), ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
        TypeOrmModule.forRoot({
            type: 'postgres', // 데이터베이스 타입
            host: process.env[ENV_DB_HOST_KEY],// db 주소
            port: parseInt(process.env[ENV_DB_PORT_KEY] ?? '5432'),
            username: process.env[ENV_DB_USERNAME_KEY],
            password: String(process.env[ENV_DB_PASSWORD_KEY]),
            database: process.env[ENV_DB_DATABASE_KEY],
            entities: [
                PostsModel,
                UsersModel,
                ImageModel,
                ChatsModel,
                MessagesModel,
                CommentsModel
            ], // db 연결될 모델들
            synchronize: true,  // nestjs와 db의 데이터구조 sync맞쳐줌. 개발환경에서는 true가 좋지만 실제환경에서는 false로 해주어야함. 무슨타입이 올지 모르기때문.

        }), UsersModule, AuthModule, CommonModule, ChatsModule, CommentsModule,],
    controllers: [AppController],
    providers: [AppService,
        {provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor},
        {provide: APP_GUARD, useClass: RolesGuard},
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LogMiddleware).forRoutes({
            // 모든 경로의 요청
            path: '*',

            // 모든 요청  
            method: RequestMethod.ALL
            // Get 요청
            // method: RequestMethod.GET
        })
    }
}
