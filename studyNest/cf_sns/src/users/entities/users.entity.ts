import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entities/posts.entity";
import {BaseModel} from "../../common/entities/base.entity";
import {IsEmail, IsString, Length, ValidationArguments} from "class-validator";

@Entity()
export class UsersModel extends BaseModel {

    @Column({
        // 1) 최대길이 20
        length: 20,
        // 2) 유일무이한 값
        unique: true,
    })
    @IsString()
    @Length(1, 20, {
        message(args: ValidationArguments) {
            /**
             * ValidationArguments의 프로퍼티들
             * 1. value -> 검증되고있는 값(입력된 값)
             * 2. constraints -> 파라미터에 입력된 제한 사항들
             *  args.constraints[0] -> 1 min
             *  args.constraints[1] -> 20 max
             * 3. targetName -> 검증하고 있는 클래스의 이름
             * 4. object -> 검증하고 있는 객체
             * 5. property -> 검증 되고 있는 객체의 프로퍼티 닉네임 : nickname
             */
            if (args.constraints.length === 2) {
                return `${args.property} 은 최대 ${args.constraints[0]} ~ ${args.constraints[1]} 글자를 입력해주세요.`;
            } else {
                return `${args.property}는 최소 ${args.constraints[0]} 글자를 입력해주세요.`;
            }

        }
    })
    nickname: string;

    @Column()
    // 1) 유일무이한 값
    @IsString()
    @IsEmail()
    email: string;

    @Column()
    @IsString()
    @Length(3, 8)
    password: string;

    @Column({
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    })
    role: RolesEnum;

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];

}