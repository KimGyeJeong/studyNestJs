import {
    Body,
    ClassSerializerInterceptor,
    Controller, DefaultValuePipe, Delete,
    Get,
    Param, ParseBoolPipe,
    ParseIntPipe, Patch,
    Post, Query,
    UseInterceptors
} from '@nestjs/common';
import {UsersService} from './users.service';
import {RolesEnum} from "./const/roles.const";
import {Roles} from "./decorator/roles.decorator";
import {User} from "./decorator/user.decorator";
import {UsersModel} from "./entity/users.entity";
import {TransactionInterceptor} from "../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

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
    getUsers() {
        return this.usersService.getAllUsers();
    }

    @Post('follow/:id')
    async postFollow(
        @User() user: UsersModel,
        @Param('id', ParseIntPipe) followeeId: number,
    ) {
        await this.usersService.followUser(user.id, followeeId);

        return true;
    }

    @Get('follow/me')
    async getFollow(
        @User() user: UsersModel,
        @Query('includedNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe) includedNotConfirmed: boolean,
    ) {
        return this.usersService.getFollowers(user.id, includedNotConfirmed);
    }

    @Patch('follow/:id/confirm')
    @UseInterceptors(TransactionInterceptor)
    async patchFollowConfirm(
        @User() user: UsersModel,
        @Param('id', ParseIntPipe) followerId: number,
        @QueryRunner() qr : QR,
    ) {
        await this.usersService.confirmFollow(followerId, user.id, qr);
        
        await this.usersService.incrementFollowerCount(user.id, qr);
        
        return true;
    }
    
    @Delete('follow/:id')
    @UseInterceptors(TransactionInterceptor)
    async deleteFollow(
        @User() user: UsersModel,
        @Param('id', ParseIntPipe) followeeId: number,
        @QueryRunner() qr: QR, 
        ) {
        await this.usersService.deleteFollow(user.id, followeeId, qr);
        
        await this.usersService.decrementFollowerCount(user.id, qr);
        
        return true;
    }
}
