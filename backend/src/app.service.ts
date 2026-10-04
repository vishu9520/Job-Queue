import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return { status: 'ok', message: 'Job Queue API is running 🚀' };
  }
}
