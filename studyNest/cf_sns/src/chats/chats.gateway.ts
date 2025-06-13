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
export class ChatsGateway implements OnGatewayConnection{
    @WebSocketServer()
    server: Server;
    
    handleConnection(socket: Socket,) {
        console.log(`on Connect Called : ${socket.id}`);
    }
    
    // socket.on("send_message", (message) => {console.log(message) } );
    @SubscribeMessage('send_message')
    sendMessage(@MessageBody() message: { message: string, chatId: number},
                @ConnectedSocket() socket: Socket
                ){
        this.server.emit('receive_message', 'hello from server');
    }
    
    @SubscribeMessage('enter_chat')
    enterChat(
        // 방의 ID들을 리스트로 받음
        @MessageBody() data: number[],
        @ConnectedSocket() socket: Socket,
        ){
            for( const chatId of data){
                // socket.join()
                socket.join(chatId.toString());
            }
    }
}