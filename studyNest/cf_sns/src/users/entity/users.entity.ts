import {
    Column,
    CreateDateColumn,
    Entity, JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entity/posts.entity";
import {BaseModel} from "../../common/entity/base.entity";
import {IsEmail, IsString, Length, ValidationArguments} from "class-validator";
import {lengthValidationMessage} from "../../common/validation-message/length-validation.message";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";
import {emailValidationMessage} from "../../common/validation-message/email-validation.message";
import {Exclude, Expose} from "class-transformer";
import {ChatsModel} from "../../chats/entity/chats.entity";
import {MessagesModel} from "../../chats/messages/entity/messages.entity";

@Entity()
// @Exclude()  // class가 보안에 중요하다면 클래스 전체에 exclude 를 할수 있다(기본적으로 전체 expose). 필요한 항목에 대해서만 expose 데코레이터를 사용하면 된다.
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
    // @Expose()
    nickname: string;

    @Column()
    // 1) 유일무이한 값
    @IsString({message: stringValidationMessage})
    @IsEmail({}, {message:emailValidationMessage})
    // @Expose()
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
    
    @ManyToMany(() => ChatsModel, (chat) => chat.users)
    @JoinTable()    // jointable이 선언된 곳이 관계의 주인이 됨. 이때 usersmodel이 연결테이블을 생성하고 관리함
    chats: ChatsModel[];
    
    @OneToMany(()=> MessagesModel, (message) => message.author)
    messages: MessagesModel[];
}