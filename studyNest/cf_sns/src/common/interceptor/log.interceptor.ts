import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";
import {map, Observable, tap} from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        /**
         * 요청이 들어올때 request 요청이 들어온 타임 스탬프를 찍는다
         * [REQ] {요청 path} {요청시간}
         *
         * 요청이 끝날때 (응답이 나갈때) 다시 타임 스탬프를 찍는다
         * [RES] {요청 path} {응답시간} {얼마나 걸렸는지 ms}
         */
        const now = new Date();

        const request = context.switchToHttp().getRequest();

        // /posts, /common/image 등
        const path = request.originalUrl;
        console.log(`[REQ] ${path} - ${now.toLocaleString('kr')}`);

        // return next.handle()을 실행하는 순간
        // 라우트의 로직이 전부 실행되고 응답이 반환된다.
        // observable 으로 
        
        //rxjs
        // tab - 응답이 변경되지 않음. 모니터링 용
        // map - 응답을 변경시켜줄수 있음
        return next.handle().pipe(
            // tap((observable) => {
            //     console.log(observable);
            // }),
            // map((observable) => {
            //     return {
            //         message: '응답 변경',
            //         response: observable
            //     };
            // }),
            // // tap((observable) => {
            // //     // 변경된 응답으로 출력
            // //     console.log(observable);
            // // })

            // [RES] {요청 path} {응답시간} {얼마나 걸렸는지 ms}
            tap((observable) => {
                console.log(`[RES] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()}ms `);
            })
        );
    }
}