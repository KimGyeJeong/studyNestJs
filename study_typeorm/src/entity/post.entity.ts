import {Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserModel} from "./user.entity";
import {TagModel} from "./tag.entity";

@Entity()
export class PostModel{
    @PrimaryGeneratedColumn()
    id : number;
    
    // manytoone 에서 상대 테이블 id 값들을 들고 있음
    @ManyToOne(()=> UserModel, (user) => user.posts)
    author: UserModel;
    
    @Column()
    title: string;
    
    // manytomany 에는 둘중 하나에 jointable 을 달아주어야함
    @ManyToMany(() => TagModel, (tag) => tag.posts)
    @JoinTable()
    tags : TagModel[];
    
}