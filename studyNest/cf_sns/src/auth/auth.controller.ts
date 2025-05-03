import {Body, Controller, Post, Headers, UseGuards, Request} from '@nestjs/common';
import {AuthService} from './auth.service';
import {MaxLengthPipe, MinLengthPipe, PasswordPipe} from "./pipe/password.pipe";
import {BasicTokenGuard} from "./guard/basic-token.guard";
import {AccessTokenGuard, RefreshTokenGuard} from "./guard/bearer-token.guard";
import {RegisterUserDTO} from "./dto/register-user.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('token/access')
    @UseGuards(RefreshTokenGuard)
    postTokenAccess(@Headers('authorization') rawToken: string) {
        const token = this.authService.extractTokenFromHeader(rawToken, true);
        const newToken = this.authService.rotateToken(token, false);

        // {accessToken : {token}} 형식으로 리턴
        return {accessToken: newToken};
    }

    @Post('token/refresh')
    @UseGuards(RefreshTokenGuard)
    postTokenRefresh(@Headers('authorization') rawToken: string) {
        const token = this.authService.extractTokenFromHeader(rawToken, true);

        const newToken = this.authService.rotateToken(token, true);

        // {refreshToken : {token}} 형식으로 리턴
        return {refreshToken: newToken};
    }

    @Post('login/email')
    @UseGuards(BasicTokenGuard)
    postLoginEmail(
        @Headers('authorization') rawToken: string,
    ) {
        // email:password -> base64
        const token = this.authService.extractTokenFromHeader(rawToken, false);
        const credentials = this.authService.decodeBasicToken(token);

        return this.authService.loginWithEmail(credentials);
    }

    @Post('register/email')
    postRegisterEmail(
        @Body() body: RegisterUserDTO,
    ) {
        return this.authService.registerWithEmail(body);
    }
}
