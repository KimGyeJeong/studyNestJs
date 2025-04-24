import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthService} from "../auth.service";
import {UsersService} from "../../users/users.service";

@Injectable()
export class BearerTokenGuard implements CanActivate {
    constructor(private readonly authService: AuthService,
                private readonly userService: UsersService) {}
    
    async canActivate(context:ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        
        const rawToken = req.headers.authorization;
        // const rawToken = req.headers('authorization');
        
        
        if (!rawToken) {
            throw new UnauthorizedException('No token provided');
        }
        
        const token = this.authService.extractTokenFromHeader(rawToken, true);
        
        const result = await this.authService.verifyToken(token);

        /**
         * req에 넣을 정보
         * 1. 사용자 정보 - user
         * 2. token - token
         * 3. tokenType - access | refresh
         */
        
        const user = await this.userService.getUserByEmail(result.email);
        req.user = user;
        req.token = token;
        req.tokenType = result.type;
        
        return true;
    }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard{
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);
        
        const req = context.switchToHttp().getRequest();
        
        if (req.tokenType !== 'access'){
            throw new UnauthorizedException('No access-token provided');
        }
        
        return true;
    }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard{
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const req = context.switchToHttp().getRequest();

        if (req.tokenType !== 'refresh'){
            throw new UnauthorizedException('No refresh-token provided');
        }

        return true;
    }
}