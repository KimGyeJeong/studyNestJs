import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from "./users/users.module";
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_FOLDER_PATH } from "./common/const/path.const";
import { LogMiddleware } from "./common/middleware/log.middleware";
import { ChatsModule } from './chats/chats.module';
import { CommentsModule } from './posts/comments/comments.module';
import { RolesGuard } from "./users/guard/roles.guard";
import { AccessTokenGuard } from "./auth/guard/bearer-token.guard";

// 분리된 DatabaseModule 임포트
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [
        // --- 핵심 모듈 설정 ---
        ConfigModule.forRoot({
            envFilePath: '.env', // .env 파일 경로 지정
            isGlobal: true,      // 환경 변수를 전역적으로 사용 가능하게 함
        }),
        ServeStaticModule.forRoot({
            rootPath: PUBLIC_FOLDER_PATH, // 정적 파일을 제공할 경로
            serveRoot: '/public'         // 클라이언트가 접근할 URL 경로
        }),
        // --- 데이터베이스 모듈 (SSH 터널링 포함) ---
        DatabaseModule, // 모든 TypeORM 설정 및 SSH 터널링 로직이 이 모듈에 캡슐화됨

        // --- 기능별 모듈 ---
        PostsModule,
        UsersModule,
        AuthModule,
        CommonModule,
        ChatsModule,
        CommentsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // 인터셉터: ClassSerializerInterceptor는 DTO 변환 시 유용합니다.
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
        // 가드: 인증 및 권한 부여
        { provide: APP_GUARD, useClass: AccessTokenGuard },   // 모든 요청에 AccessTokenGuard 적용
        { provide: APP_GUARD, useClass: RolesGuard },         // 모든 요청에 RolesGuard 적용 (AccessTokenGuard 이후 실행)
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // 미들웨어: 모든 요청에 LogMiddleware 적용
        consumer.apply(LogMiddleware).forRoutes({
            path: '*', // 모든 경로
            method: RequestMethod.ALL // 모든 HTTP 메서드
        });
    }
}