import {BadRequestException, Module} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";
import {CommonModule} from "../common/common.module";
import {MulterModule} from "@nestjs/platform-express";
import {extname} from 'path';
import * as multer from "multer";
import {POST_IMAGE_PATH} from "../common/const/path.const";
import {v4 as uuid} from 'uuid';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [TypeOrmModule.forFeature([PostsModel]), AuthModule, UsersModule, CommonModule,
  MulterModule.register({
    limits: {
      fileSize: 100000000,
    },
    fileFilter: (req, file, cb) => {
      /**
       * cb(에러, boolean)
       * 첫번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다.
       * 두번째 파라미터는 파일을 받을지 말지 boolean을 넣어준다.
       */
      
      // xxx.jpg --> .jpg
      const ext = extname(file.originalname).toLowerCase();
      
      if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
        return cb(new BadRequestException('only jpg, png, jpeg can uploaded'), false);
      }
      return cb(null, true);
    },
    storage: multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, POST_IMAGE_PATH);
      },
      filename: function(req, file, cb) {
        cb(null, `${uuid()}${extname(file.originalname)}`);
      }
    }),
  })],
})
export class PostsModule {}
