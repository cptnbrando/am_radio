import { Component, HostListener } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'am_radio';

  public static get serverRoot(){return `http://localhost:9015/api`; }
  public static get webURL() { return `http://localhost:4200`; }

  constructor() {}

  // So that right clicking doesn't yield a lame context menu
  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  }
}
