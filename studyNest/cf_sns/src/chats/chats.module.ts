import {Module} from '@nestjs/common';
import {ChatsService} from './chats.service';
import {ChatsController} from './chats.controller';
import {ChatsGateway} from "./chats.gateway";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChatsModel} from "./entity/chats.entity";
import {CommonModule} from "../common/common.module";
import {MessagesModel} from "./messages/entity/messages.entity";
import {ChatsMessagesService} from "./messages/messages.service";
import {MessagesController} from "./messages/messages.controller";
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [TypeOrmModule.forFeature([ChatsModel, MessagesModel]), CommonModule, AuthModule, UsersModule],
    controllers: [ChatsController,MessagesController],
    providers: [ChatsService, ChatsGateway, ChatsMessagesService],
})
export class ChatsModule {
}
