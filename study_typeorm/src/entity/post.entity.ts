import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserModel} from "./user.entity";

@Entity()
export class PostModel{
    @PrimaryGeneratedColumn()
    id : number;
    
    // manytoone 에서 상대 테이블 id 값들을 들고 있음
    @ManyToOne(()=> UserModel, (user) => user.posts)
    author: UserModel;
    
    @Column()
    title: string;
}