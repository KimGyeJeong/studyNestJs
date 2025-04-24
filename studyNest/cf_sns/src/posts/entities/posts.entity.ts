import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {UsersModel} from "../../users/entities/users.entity";
import {BaseModel} from "../../common/entities/base.entity";

@Entity()
export class PostsModel extends BaseModel{

  // 1) FK를 이용해서 UserModel과 연동한다.
  // 2) null이 될 수 없다.
  @ManyToOne(()=>UsersModel, (user)=>user.posts, {
    nullable : false,
  })
  author: UsersModel;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}