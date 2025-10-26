import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';

@WebSocketGateway(3003, {
  cors: { origin: '*' },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.setupEventListeners();
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized on port 3003');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private setupEventListeners() {
    this.eventEmitter.on('env_data.received', (payload) => {
      this.logger.log(`Emitting env_data: ${JSON.stringify(payload)}`);
      this.server.emit('env_data', payload);
    });

    this.eventEmitter.on('obstacle.received', (payload) => {
      this.logger.log(`Emitting obstacle: ${JSON.stringify(payload)}`);
      this.server.emit('obstacle', payload);
    });

    this.eventEmitter.on('status.received', (payload) => {
      this.logger.log(`Emitting status: ${JSON.stringify(payload)}`);
      this.server.emit('status', payload);
    });

    this.eventEmitter.on('alert.triggered', (payload) => {
      this.logger.log(`Emitting alert: ${JSON.stringify(payload)}`);
      this.server.emit('alert', payload);
    });
  }
}