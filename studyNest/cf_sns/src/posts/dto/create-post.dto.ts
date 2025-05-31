import {IsOptional, IsString} from "class-validator";
import {PostsModel} from "../entities/posts.entity";
import {PickType} from "@nestjs/mapped-types";

//Pick, Omit, Partial : Type 반환
//PickType, OmitType, PartialType : 값 반환
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
    @IsString({
        each: true, // 배열을 각각 검색해서 string인지 확인
    })
    @IsOptional()
    images: string[] = [];
}
