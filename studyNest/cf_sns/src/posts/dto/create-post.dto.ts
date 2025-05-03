import {IsString} from "class-validator";

export class CreatePostDto {
    @IsString({
        message: 'title은 string 타입이어야 합니다.'
    })
    title: string;
    
    @IsString({
        message: 'content는 string 타입이어야 합니다.'
    })
    content: string;
}