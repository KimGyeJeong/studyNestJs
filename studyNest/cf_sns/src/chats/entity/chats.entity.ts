import {Entity, ManyToMany, OneToMany} from "typeorm";
import {BaseModel} from "../../common/entities/base.entity";
import {UsersModel} from "../../users/entities/users.entity";
import {MessagesModel} from "../messages/entity/messages.entity";

@Entity()
export class ChatsModel extends BaseModel{
    @ManyToMany(() => UsersModel, (user) => user.chats)
    users: UsersModel[];
    
    @OneToMany(()=>MessagesModel, (messages)=>messages.chat)
    messages: MessagesModel
}