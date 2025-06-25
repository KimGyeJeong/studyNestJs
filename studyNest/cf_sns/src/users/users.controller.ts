import {Body, ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors} from '@nestjs/common';
import { UsersService } from './users.service';
import {RolesEnum} from "./const/roles.const";
import {Roles} from "./decorator/roles.decorator";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  // @Post()
  // postUser(@Body('nickname') nickname: string, 
  //          @Body('email') email: string, 
  //          @Body('password') password: string) {
  //   return this.usersService.createUser({nickname, email, password});
  // }
  
  @Get()
  @Roles(RolesEnum.ADMIN)
  // appModule에서 사용
  // @UseInterceptors(ClassSerializerInterceptor)
  /**
   * Serialization --> 직렬화
   * 현재 시스템(nestJS)에서 사용되는 데이터의 구조를 다른 시스템에서도 쉽게 사용할 수 있는 포멧으로 변환
   *  --> Class의 Object를 JSON 포멧으로 변환
   *  
   * DeSerialization --> 역직렬화
   */
  getUsers(){
    return this.usersService.getAllUsers();
  }
}
