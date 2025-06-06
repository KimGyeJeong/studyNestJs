import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {HttpExceptionFilter} from "./common/exception-filter/http.exception-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions : {
      enableImplicitConversion : true // classValidator 기반으로 number등의 형식으로 데코레이터를 통과시켜줌. @Type(()=>Number) 를 사용하지 않아도 원하는대로 작동함
    },
    whitelist: true,
    forbidNonWhitelisted: true, // 존재하지 않는 값이면 400 에러를 발생시킴
  }));
  
  // 전체 필터로 만들기. 모든 http-exception 관련된 에러가 httpexceptionfilter 을 탐
  // app.useGlobalFilters(new HttpExceptionFilter());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
