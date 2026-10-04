import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface SseEvent {
  type: string;
  data: any;
}

@Injectable()
export class SseService {
  // One shared subject — all SSE clients subscribe to this
  private readonly events$ = new Subject<SseEvent>();

  get stream$() {
    return this.events$.asObservable();
  }

  emit(type: string, data: any) {
    this.events$.next({ type, data });
  }
}
