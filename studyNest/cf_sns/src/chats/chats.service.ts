import {Injectable} from '@nestjs/common';
import {ChatsModel} from "./entity/chats.entity";
import {CreateChatDto} from "./dto/create-chat.dto";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {PaginateChatDto} from "./dto/paginate-chat.dto";
import {CommonService} from "../common/common.service";

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatsModel)
        private readonly chatsRepository: Repository<ChatsModel>,
        private readonly commonservice: CommonService,
    ) {
    }

    async createChat(dto: CreateChatDto) {
        const chat = await this.chatsRepository.save({
            // 1, 2, 3 의 userId
            // {id: 1}, {id: 2}, {id: 3}
            users: dto.userIds.map((id) => ({id})),
        });

        return this.chatsRepository.findOne({
            where: {
                id: chat.id,
            }
        });
    }

    paginateChats(dto: PaginateChatDto) {
        return this.commonservice.paginate(dto, this.chatsRepository, {
            relations: {users: true}
        }, 'chats',);
    }

    async checkIfChatExists(chatId: number) {
        return await this.chatsRepository.exists({
            where: {id: chatId},
        });
    }

}
