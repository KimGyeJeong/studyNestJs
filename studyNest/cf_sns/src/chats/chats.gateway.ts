import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
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
import {UseFilters, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {SocketCatchHttpExceptionFilter} from "../common/exception-filter/socket-catch-http.exception-filter";
import {SocketBearerTokenGuard} from "../auth/guard/socket/socket-bearer-token.guard";
import {UsersModel} from "../users/entities/users.entity";
import {UsersService} from "../users/users.service";
import {AuthService} from "../auth/auth.service";

@WebSocketGateway({
    // ws://localhost:3000/chats
    namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
    constructor(
        private readonly chatsService: ChatsService,
        private readonly messagesService: ChatsMessagesService,
        private readonly usersService: UsersService,
        private readonly authService: AuthService
    ) {

    }

    handleDisconnect(socket: Socket) {
        //ws 연결이 disconnect 될때 실행 됨
        console.log(`on disconnect: ${socket.id}`);
    }

    afterInit(server: any) {
        // server를 inject 시에 사용되는 함수이기도 함
        // gateway가 초기화 되었을때 실행
        
        // afterInit(server.. 의 server 는 @WebSocketServer() server: Server; 의 server와 동일하다
    }

    @WebSocketServer()
    server: Server;

    async handleConnection(socket: Socket & {user: UsersModel},) {
        console.log(`on Connect Called : ${socket.id}`);

        const headers = socket.handshake.headers;

        // Bearer xxx
        const rawToken = headers['authorization'];

        if (!rawToken) {
            socket.disconnect();
        }

        try{
            const token = this.authService.extractTokenFromHeader(<string>rawToken, true);

            const payload = this.authService.verifyToken(token);

            const user = await this.usersService.getUserByEmail(payload.email);

            if (user) {
                socket.user = user;
                console.log('user: ', user);
            }

            return true;
        }catch(error){
            socket.disconnect();
        }
    }

    // socket.on("send_message", (message) => {console.log(message) } );
    @SubscribeMessage('send_message')
    @UsePipes(new ValidationPipe({
        transform: true,
        transformOptions : {
            enableImplicitConversion : true // classValidator 기반으로 number등의 형식으로 데코레이터를 통과시켜줌. @Type(()=>Number) 를 사용하지 않아도 원하는대로 작동함
        },
        whitelist: true,
        forbidNonWhitelisted: true, // 존재하지 않는 값이면 400 에러를 발생시킴
    }))
    @UseFilters(SocketCatchHttpExceptionFilter)
    async sendMessage(@MessageBody() dto: CreateMessagesDTO,
                      @ConnectedSocket() socket: Socket & {user: UsersModel}
    ) {
        const chatExists = await this.chatsService.checkIfChatExists(
            dto.chatId,
        );

        if (!chatExists) {
            throw new WsException(
                `none exists chatting room. chat id : ${dto.chatId}`
            );
        }

        const message = await this.messagesService.createMessage(dto, socket.user.id);
        
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
    @UsePipes(new ValidationPipe({
        transform: true,
        transformOptions : {
            enableImplicitConversion : true // classValidator 기반으로 number등의 형식으로 데코레이터를 통과시켜줌. @Type(()=>Number) 를 사용하지 않아도 원하는대로 작동함
        },
        whitelist: true,
        forbidNonWhitelisted: true, // 존재하지 않는 값이면 400 에러를 발생시킴
    }))
    @UseFilters(SocketCatchHttpExceptionFilter)
    async enterChat(
        // 방의 chat ID들을 리스트로 받음
        @MessageBody() data: EnterChatDto,
        @ConnectedSocket() socket: Socket & {user: UsersModel},
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
    @UsePipes(new ValidationPipe({
        transform: true,
        transformOptions : {
            enableImplicitConversion : true // classValidator 기반으로 number등의 형식으로 데코레이터를 통과시켜줌. @Type(()=>Number) 를 사용하지 않아도 원하는대로 작동함
        },
        whitelist: true,
        forbidNonWhitelisted: true, // 존재하지 않는 값이면 400 에러를 발생시킴
    }))
    @UseFilters(SocketCatchHttpExceptionFilter)
    async createChat(
        @MessageBody() data: CreateChatDto,
        @ConnectedSocket() socket: Socket & {user: UsersModel}
    ) {
        const chat = await this.chatsService.createChat(data);

        console.log('chat : ', chat);
    }
}