import {BadRequestException, Module} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";
import {CommonModule} from "../common/common.module";

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [TypeOrmModule.forFeature([PostsModel]), AuthModule, UsersModule, CommonModule,
  ],
})
export class PostsModule {}
