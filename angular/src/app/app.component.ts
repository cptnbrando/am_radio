import { Component, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'am_radio';

  public static serverRoot = environment.appURL;
  public static webURL = environment.appURL;
  public static appURL: string = environment.appURL;

  constructor() {}

  // So that right clicking doesn't yield a lame context menu
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: any) {
    event.preventDefault();
  }
}
