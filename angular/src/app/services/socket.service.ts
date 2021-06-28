import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Injectable } from '@angular/core';
import { AppComponent } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public stompClient;
  public msg = [];

  constructor() {
    this.initWSConnection();
  }

  initWSConnection(): void {
    const serverURL = `${AppComponent.serverRoot}/socket`;
    const ws = new SockJS(serverURL);
    this.stompClient = Stomp.over(ws);
    const that = this;

    this.stompClient.connect({}, function(frame) {
      that.stompClient.subscribe('/message', (message) => {
        if(message.body) {
          that.msg.push(message.body);
        }
      });
    });
  }

  sendMessage(message) {
    this.stompClient.send('/app/send/message', {}, message);
  }

}
