import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway, WebSocketServer, WsException
} from "@nestjs/websockets";
import {Socket, Server} from "socket.io";
import {CreateChatDto} from "./dto/create-chat.dto";
import {ChatsService} from "./chats.service";
import {CommonService} from "src/common/common.service";
import {EnterChatDto} from "./dto/enter-chat.dto";
import {CreateMessagesDTO} from "./messages/dto/create-messages.dto";
import {ChatsMessagesService} from "./messages/messages.service";

@WebSocketGateway({
    // ws://localhost:3000/chats
    namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
    constructor(
        private readonly chatsService: ChatsService,
        private readonly messagesService: ChatsMessagesService,
    ) {

    }

    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket,) {
        console.log(`on Connect Called : ${socket.id}`);
    }

    // socket.on("send_message", (message) => {console.log(message) } );
    @SubscribeMessage('send_message')
    async sendMessage(@MessageBody() dto: CreateMessagesDTO,
                      @ConnectedSocket() socket: Socket
    ) {
        const chatExists = await this.chatsService.checkIfChatExists(
            dto.chatId,
        );

        if (!chatExists) {
            throw new WsException(
                `none exists chatting room. chat id : ${dto.chatId}`
            );
        }

        const message = await this.messagesService.createMessage(dto);
        
        if (!message) {
            throw new WsException(`cant create message`);
        }

        console.log('==== Received send_message ====');
        console.log('message:', message);

        // socket 전부
        // this.server.in(message.chatId.toString()).emit('receive_message', message.message);

        // 나를 제외한 socket
        socket.to(message.chat.id.toString()).emit("receive_message", message.message);
    }

    @SubscribeMessage('enter_chat')
    async enterChat(
        // 방의 chat ID들을 리스트로 받음
        @MessageBody() data: EnterChatDto,
        @ConnectedSocket() socket: Socket,
    ) {
        for (const chatId of data.chatIds) {
            const exists = await this.chatsService.checkIfChatExists(chatId);

            if (!exists) {
                throw new WsException({
                    message: `존재하지 않는 chat 입니다. chaatID : ${chatId}`,
                })
            }
        }
        socket.join(data.chatIds.map((x) => x.toString()));


        // socket.adapter.rooms 에 저장
        //     rooms: Map(5) {
        //       'wZzyvD6bUqYIFQCkAAAB' => [Set],
        //       '2' => [Set],
        //       'FYwod2ThyIN5a5u1AAAD' => [Set],
        //       'V5S9vCHTtG2V1Yd4AAAF' => [Set],
        //       '1' => [Set]
        //     },

        // rooms: Map(5) {
        //   '2' => Set { 'wZzyvD6bUqYIFQCkAAAB', 'FYwod2ThyIN5a5u1AAAD', 'V5S9vCHTtG2V1Yd4AAAF' },
        //   // ...
        // } 이런식으로 2번방 안에 socketID들이 들어가 있음
        // console.log('socket : ', socket);

        // 방의 이름을 알때 특정 방에 속한 소켓 목록만 출력
        // const roomName = '1'; // 예: '1번 채팅방'
        // const room = this.server.sockets.adapter.rooms.get(roomName);
        //
        // if (room) {
        //     console.log(`Room [${roomName}] has ${room.size} clients:`);
        //     for (const socketId of room) {
        //         console.log(`- ${socketId}`);
        //     }
        // } else {
        //     console.log(`Room [${roomName}] does not exist.`);
        // }

        // 전체 방 + 소켓
        // this.server.sockets.adapter.rooms
    }

    @SubscribeMessage('create_chat')
    async createChat(
        @MessageBody() data: CreateChatDto,
        @ConnectedSocket() socket: Socket
    ) {
        const chat = await this.chatsService.createChat(data);
    }
}