/**
 * 구현할 기능
 * 
 * 1. 요청객체(request)를 불러오고
 *  authorization header로부터 토큰을 가져온다.
 * 2. authService.extractTokenFromHeader를 이용해서
 *  사용할수 있는 형태의 토큰을 추출한다.
 * 3. authService.decodeBasicToken을 실행해서
 *  email과 password를 추출한다.
 * 4. email과 password를 이용해서 사용자를 가져온다.
 *  authService.authenticateWithEmailAndPassword를 이용
 * 5. 찾아낸 사용자를 1번의 요청객체에 붙여준다.
 *  req.user = user; 를 사용
 */
import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthService} from "../auth.service";

@Injectable()
export class BasicTokenGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {
    }
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        
        const rawToken = req.headers.authorization;
        // const rawToken = req.headers('authorization');
        
        if (!rawToken) {
            throw new UnauthorizedException('No token provided');
        }
        
        const token = this.authService.extractTokenFromHeader(rawToken, false);
        
        const {email, password} = this.authService.decodeBasicToken(token);
        
        // const user = await this.authService.authenticateWithEmailAndPassword({email, password});
        // req.user = user;
        req.user = await this.authService.authenticateWithEmailAndPassword({email, password});
        
        return true;
    }
}