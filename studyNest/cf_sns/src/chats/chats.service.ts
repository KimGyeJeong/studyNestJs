import {Injectable} from '@nestjs/common';
import {ChatsModel} from "./entity/chats.entity";
import {CreateChatDto} from "./dto/create-chat.dto";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatsModel)
        private readonly chatsRepository: Repository<ChatsModel>,
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

}
