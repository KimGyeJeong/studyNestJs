import {Body, Controller, Post, Headers} from '@nestjs/common';
import {AuthService} from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('login/email')
    loginEmail(
        @Headers('authorization') rawToken : string, 
    ) {
        // email:password -> base64
        const token = this.authService.extractTokenFromHeader(rawToken, false);
        const credentials = this.authService.decodeBasicToken(token);
        
        return this.authService.loginWithEmail(credentials);
    }

    @Post('register/email')
    registerEmail(
        @Body('email') email: string,
        @Body('nickname') nickname: string,
        @Body('password') password: string,
    ) {
        return this.authService.registerWithEmail({
            email, nickname, password
        });
    }
}
