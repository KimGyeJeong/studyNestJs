import {CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor} from "@nestjs/common";
import {catchError, Observable, tap} from "rxjs";
import {DataSource} from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    constructor(
        private readonly dataSource: DataSource,
    ) {
    }
    
    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        // 트랜잭션과 관련된 모든 쿼리를 담당할
        // 쿼리 러너를 생성함.
        const qr = this.dataSource.createQueryRunner();

        // 쿼리 러너에 연결한다.
        await qr.connect();

        // 쿼리 러너에서 트랜잭션을 시작한다.
        //이 시점부터 같은 쿼리 러너를 사용하면
        //트랜잭션 안에서 데이터베이스 액션을 실행할 수 있음.
        await qr.startTransaction();
        
        request.queryRunner = qr;
        
        return next.handle().pipe(
            catchError(async (err) => {
                await qr.rollbackTransaction();
                await qr.release();
                
                throw new InternalServerErrorException(err.message);
            }),
            tap(async () => {
                await qr.commitTransaction();
                await qr.release();
            })
        )
    }
}