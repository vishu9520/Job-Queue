import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  },
})
export class JobsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(JobsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyJobCreated(job: any) {
    this.server?.emit('jobCreated', job);
  }

  notifyJobUpdated(job: any) {
    this.server?.emit('jobUpdated', job);
  }

  notifyJobDeleted(jobId: string) {
    this.server?.emit('jobDeleted', { id: jobId });
  }

  notifyStatsUpdated(stats: any) {
    this.server?.emit('statsUpdated', stats);
  }
}
