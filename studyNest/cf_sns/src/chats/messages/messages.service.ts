import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MessagesModel} from "./entity/messages.entity";
import {FindManyOptions, Repository} from "typeorm";
import {CommonService} from "../../common/common.service";
import {BasePaginationDto} from "../../common/dto/base-pagination.dto";
import {CreateMessagesDTO} from "./dto/create-messages.dto";

@Injectable()
export class ChatsMessagesService {
    constructor(
        @InjectRepository(MessagesModel)
        private readonly messagesRepository: Repository<MessagesModel>,
        private readonly commonService: CommonService
    ) {
    }

    async createMessage(dto: CreateMessagesDTO, authorId: number) {
        const message = await this.messagesRepository.save({
            chat: {
                id: dto.chatId,
            },
            author: {
                id: authorId,
            },
            message: dto.message
        });

        return await this.messagesRepository.findOne({
            where: {
                id: message.id
            },
            relations: {chat: true},
        })

    }

    paginateMessages(dto: BasePaginationDto, overrideFindOptions: FindManyOptions<MessagesModel>) {
        return this.commonService.paginate(
            dto, this.messagesRepository, overrideFindOptions, 'messages'
        );

    }
}