import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  
  // @Get('/')
  @Get()
  getHome(){
    return 'Home Page';
  }
  
  @Get('post')
  getPost(){
    return 'Post Page';
  }
  
  @Get('user')
  getUser(){
    return 'User Page';
  }
}
