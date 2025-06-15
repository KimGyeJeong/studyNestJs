import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Observable} from "rxjs";
import {AuthService} from "../../auth.service";
import {WsException} from "@nestjs/websockets";
import {UsersService} from "../../../users/users.service";

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
    constructor(
        private readonly authservice: AuthService,
        private readonly userService: UsersService,
    ) {

    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const socket = context.switchToWs().getClient();
        
        const headers = socket.handshake.headers;
        
        // Bearer xxx
        const rawToken = headers['authorization'];
        
        if (!rawToken) {
            throw new WsException('no token provided');
        }
        
        try{
            const token = this.authservice.extractTokenFromHeader(rawToken, true);

            const payload = this.authservice.verifyToken(token);

            const user = await this.userService.getUserByEmail(payload.email);

            socket.user = user;
            socket.token = token;
            socket.tokenType = payload.tokenType;
            
            return true;
        }catch(error){
            throw new WsException('invalid token');
        }
        

    }


}