import {Entity, ManyToMany} from "typeorm";
import {BaseModel} from "../../common/entities/base.entity";
import {UsersModel} from "../../users/entities/users.entity";

@Entity()
export class ChatsModel extends BaseModel{
    @ManyToMany(() => UsersModel, (user) => user.chats)
    users: UsersModel[];
}