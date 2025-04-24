import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entities/posts.entity";

@Entity()
export class UsersModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        // 1) 최대길이 20
        length: 20,
        // 2) 유일무이한 값
        unique: true,
    })
    nickname: string;

    @Column()
        // 1) 유일무이한 값
    email: string;

    @Column()
    password: string;

    @Column({
        enum: Object.values(RolesEnum),
        default : RolesEnum.USER,
    })
    role: RolesEnum;
    
    @OneToMany(()=> PostsModel, (post) => post.author)
    posts : PostsModel[];
    
    @UpdateDateColumn()
    updatedAt: Date;
    
    @CreateDateColumn()
    createdAt: Date;
    
    
}