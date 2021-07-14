import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  input: string = '';

  constructor(public socketService: SocketService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    if(this.input) {
      this.socketService.sendMessage(this.input);
      this.input = '';
    }
  }

}
