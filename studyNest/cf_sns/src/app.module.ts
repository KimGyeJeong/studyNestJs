import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';

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
    ], // db 연결될 모델들
    synchronize: true,  // nestjs와 db의 데이터구조 sync맞쳐줌. 개발환경에서는 true가 좋지만 실제환경에서는 false로 해주어야함. 무슨타입이 올지 모르기때문.
    
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
