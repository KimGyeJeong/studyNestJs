import {IsIn, IsNumber, IsOptional} from "class-validator";

export class BasePaginationDto {
    //page 기반의 paginate
    @IsNumber()
    @IsOptional()
    page?: number;

    // 이전 마지막 데이터의 ID
    // 이 프로퍼티에 입력된 ID보다 높은 ID부터 값을 가져오기
    // @Type(()=> Number)  // (url)String --> Number 형식으로 변환
    @IsNumber()
    @IsOptional()
    where__id_more_than?: number;

    @IsNumber()
    @IsOptional()
    where__id_less_than?: number;

    // 정렬
    // createdAt --> 생성된 시간의 내림차/오름차 순으로 정렬
    // 1. 지금은 오름차 순으로만 실행
    @IsIn(['ASC', 'DESC'])  // 배열안의 값만 pass 할수 있음
    @IsOptional()
    order__createdAt: 'ASC' | 'DESC' = 'ASC';

    // 몇개의 데이터를 입력받을지
    @IsNumber()
    @IsOptional()
    take: number = 20;
}