import { Component, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'am_radio';

  public static serverRoot: string = environment.serverURL;
  public static webURL: string = environment.appURL;
  public static appURL: string = environment.appURL + "/app";

  constructor() {}

  // So that right clicking doesn't yield a lame context menu
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: any) {
    event.preventDefault();
  }
}
