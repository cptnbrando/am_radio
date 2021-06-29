import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Injectable } from '@angular/core';
import { AppComponent } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public stompClient;
  public msg: string[] = [];

  constructor() {
    const serverURL = `${AppComponent.serverRoot}/socket`;
    const ws = new SockJS(serverURL);
    this.stompClient = Stomp.over(ws);
    this.initWSConnection();
  }

  initWSConnection(): void {
    const that = this;

    this.stompClient.connect({}, function(frame: any) {
      that.stompClient.subscribe('/message', (message: any) => {
        if(message.body) {
          that.msg.push(message.body);
        }
      });
    });
  }

  sendMessage(message: string) {
    this.stompClient.send('/app/send/message', {}, message);
  }

}
