import { Component, Input, OnInit } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

  @Input() showControls: boolean;
  input: string = '';

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    if(this.input) {
      this.socketService.sendMessage(this.input);
      this.input = '';
    }
  }

}
