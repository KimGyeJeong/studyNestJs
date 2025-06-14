import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway, WebSocketServer
} from "@nestjs/websockets";
import {Socket, Server} from "socket.io";

@WebSocketGateway({
    // ws://localhost:3000/chats
    namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket,) {
        console.log(`on Connect Called : ${socket.id}`);
    }

    // socket.on("send_message", (message) => {console.log(message) } );
    @SubscribeMessage('send_message')
    sendMessage(@MessageBody() message: { message: string, chatId: number },
                @ConnectedSocket() socket: Socket
    ) {

        console.log('==== Received send_message ====');
        console.log('message:', message);
        console.log('chatId:', message?.chatId);

        // socket 전부
        // this.server.in(message.chatId.toString()).emit('receive_message', message.message);
        
        // 나를 제외한 socket
        socket.to(message.chatId.toString()).emit("receive_message", message.message);
    }

    @SubscribeMessage('enter_chat')
    enterChat(
        // 방의 chat ID들을 리스트로 받음
        @MessageBody() data: number[],
        @ConnectedSocket() socket: Socket,
    ) {
        for (const chatId of data) {
            // socket.join()
            socket.join(chatId.toString());
        }
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
}