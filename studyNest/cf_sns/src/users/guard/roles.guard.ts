import {CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "../decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        /**
         * Roles annotation에 대한 metadata를 가져와야 한다.
         *
         * Reflector
         * - getAllAndOverride()
         */
        const requiredRole = this.reflector.getAllAndOverride(ROLES_KEY, [context.getHandler(), context.getClass()]);
        
        if (!requiredRole) {
            //Roles Annotation 이 등록이 안되어 있을때
            return true;
        }
        
        const {user} = context.switchToHttp().getRequest();
        
        if (!user) {
            throw new UnauthorizedException(`provide token to access`);
        }
        
        if (user.role !== requiredRole){
            throw new ForbiddenException(`no authentication found for role ${user.role}. required for role ${requiredRole}`);
        }
        
        return true;
    }

}