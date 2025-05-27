import {ClassSerializerInterceptor, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PostsModule} from './posts/posts.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PostsModel} from './posts/entities/posts.entity';
import {UsersModel} from "./users/entities/users.entity";
import {UsersModule} from "./users/users.module";
import {AuthModule} from './auth/auth.module';
import {CommonModule} from './common/common.module';
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [PostsModule, TypeOrmModule.forRoot({
        type: 'postgres', // 데이터베이스 타입
        host: 'localhost',// db 주소
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'postgres',
        entities: [
            PostsModel,
            UsersModel
        ], // db 연결될 모델들
        synchronize: true,  // nestjs와 db의 데이터구조 sync맞쳐줌. 개발환경에서는 true가 좋지만 실제환경에서는 false로 해주어야함. 무슨타입이 올지 모르기때문.

    }), UsersModule, AuthModule, CommonModule, ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),],
    controllers: [AppController],
    providers: [AppService, {provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor}],
})
export class AppModule {
}
