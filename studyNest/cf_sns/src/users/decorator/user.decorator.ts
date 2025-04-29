import {createParamDecorator, ExecutionContext, InternalServerErrorException} from "@nestjs/common";

export const User = createParamDecorator((data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    
    const user = req.user;
    
    if (!user) {
        // user 데코레이터는 엑세스 토큰 가드를 사용한 상태에서 사용할수 있다는 가정하에 설계할것이기 때문에
        // user가 없다면 클라이언트문제가 아니라 서버에서 문제가 생긴거를 알려주기 위한 InternalServerErrorException 을 사용
        throw new InternalServerErrorException('User 데코레이터는 AccessTokenGuard와 함께 사용해야 합니다. Request에 user 프로퍼티가 존재하지 않습니다.');
    }
    
    return user;
}); 