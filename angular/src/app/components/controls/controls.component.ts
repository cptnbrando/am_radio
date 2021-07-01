import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

  @Input() showControls: boolean = false;
  input: string = '';

  @Output() isTypingEvent = new EventEmitter<boolean>();

  constructor(public socketService: SocketService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    this.isTypingEvent.emit(false);
    if(this.input) {
      this.socketService.sendMessage(this.input);
      this.input = '';
    }
  }

  typing(): void {
    this.isTypingEvent.emit(true);
  }

}
