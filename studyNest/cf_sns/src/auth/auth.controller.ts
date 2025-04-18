import {Body, Controller, Post, Headers} from '@nestjs/common';
import {AuthService} from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }
    
    @Post('token/access')
    postTokenAccess(@Headers('authorization') rawToken : string) {
        const token = this.authService.extractTokenFromHeader(rawToken, true);
        const newToken = this.authService.rotateToken(token, false);

        // {accessToken : {token}} 형식으로 리턴
        return {accessToken: newToken};
    }

    @Post('token/refresh')
    postTokenRefresh(@Headers('authorization') rawToken : string) {
        const token = this.authService.extractTokenFromHeader(rawToken, true);

        const newToken = this.authService.rotateToken(token, true);

        // {refreshToken : {token}} 형식으로 리턴
        return {refreshToken: newToken};
    }

    @Post('login/email')
    postLoginEmail(
        @Headers('authorization') rawToken : string, 
    ) {
        // email:password -> base64
        const token = this.authService.extractTokenFromHeader(rawToken, false);
        const credentials = this.authService.decodeBasicToken(token);
        
        return this.authService.loginWithEmail(credentials);
    }

    @Post('register/email')
    postRegisterEmail(
        @Body('email') email: string,
        @Body('nickname') nickname: string,
        @Body('password') password: string,
    ) {
        return this.authService.registerWithEmail({
            email, nickname, password
        });
    }
}
