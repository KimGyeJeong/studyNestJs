import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions : {
      enableImplicitConversion : true // classValidator 기반으로 number등의 형식으로 데코레이터를 통과시켜줌. @Type(()=>Number) 를 사용하지 않아도 원하는대로 작동함
    }
  }));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
