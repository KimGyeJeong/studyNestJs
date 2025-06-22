import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import {UsersModel} from "../../users/entity/users.entity";
import {BaseModel} from "../../common/entity/base.entity";
import {IsString} from "class-validator";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";
import {Transform} from "class-transformer";
import {join} from "path";
import {POST_PUBLIC_IMAGE_PATH} from "../../common/const/path.const";
import {ImageModel} from "../../common/entity/image.entity";
import {CommentsModel} from "../comments/entity/comments.entity";

@Entity()
export class PostsModel extends BaseModel {

    // 1) FK를 이용해서 UserModel과 연동한다.
    // 2) null이 될 수 없다.
    @ManyToOne(() => UsersModel, (user) => user.posts, {
        nullable: false,
    })
    author: UsersModel;

    @Column()
    @IsString({
        message: stringValidationMessage
    })
    title: string;

    @Column()
    @IsString({
        message: stringValidationMessage
    })
    content: string;

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;
    
    @OneToMany((type) => ImageModel, (image) => image.post)
    images: ImageModel[]
    
    @OneToMany(() => CommentsModel, (comment) => comment.post)
    comments: CommentsModel[];
}