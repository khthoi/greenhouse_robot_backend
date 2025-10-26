import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter'; 
import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [
    EventEmitterModule.forRoot(), 
  ],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}