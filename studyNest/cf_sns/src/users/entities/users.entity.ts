import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entities/posts.entity";
import {BaseModel} from "../../common/entities/base.entity";
import {IsEmail, IsString, Length, ValidationArguments} from "class-validator";
import {lengthValidationMessage} from "../../common/validation-message/length-validation.message";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";
import {emailValidationMessage} from "../../common/validation-message/email-validation.message";
import {Exclude} from "class-transformer";

@Entity()
export class UsersModel extends BaseModel {

    @Column({
        // 1) 최대길이 20
        length: 20,
        // 2) 유일무이한 값
        unique: true,
    })
    @IsString({message: stringValidationMessage})
    @Length(1, 20, {
        message: lengthValidationMessage
    })
    nickname: string;

    @Column()
    // 1) 유일무이한 값
    @IsString({message: stringValidationMessage})
    @IsEmail({}, {message:emailValidationMessage})
    email: string;

    @Column()
    @IsString({message: stringValidationMessage})
    @Length(3, 8,{message:lengthValidationMessage})
    /**
     * Exclude
     * 
     * Request
     * frontend --> backend
     * plain object(JSON)--> class instance(dto)
     * 
     * Response
     * backend --> frontend
     * class insance(dto) --> plain object(JSON)
     * 
     * Option
     * - toClassOnly: class instance 변환될때 (Request)
     * - toPlainOnly: plain Object로 변환될때 (Response)
     * 
     * option 을 적용하지 않으면 기본으로 둘다 적용
     */
    @Exclude({toPlainOnly:true})    // Response 할때에만 제외시킴
    password: string;

    @Column({
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    })
    role: RolesEnum;

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];

}