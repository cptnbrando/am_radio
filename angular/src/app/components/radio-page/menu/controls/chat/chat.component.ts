import { Component, HostListener, Input, OnInit } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  input: string = '';
  @Input() isLoading: boolean = false;

  constructor(public socketService: SocketService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    if(this.input) {
      this.socketService.sendMessage(this.input);
      this.input = '';
    }
  }

  // Listens for keyboard events to control the player
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(!this.isLoading) {
      switch(event.code) {
        // Enter key sends message
        case "Enter":
          this.sendMessage();
          break;
      }
    }
  }
}
