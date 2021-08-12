import { Component, ElementRef, HostListener } from '@angular/core';
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

  /**
   * If the item width is greater than the container width - offset, this will add the class .scroll to the item
   * Item must have .scrollCheck and container must have .scrollContainer
   * @param scrollItem Item to scroll
   * @param container Parent container
   * @param offset optional extra space to minus container width by
   */
  static startScroll(scrollItem: Element, container: Element, offset?: number) {
    const itemWidth = scrollItem.clientWidth;
    const containerWidth = (offset) ? container.clientWidth - offset : container.clientWidth;
    if(itemWidth > containerWidth) {
      scrollItem.classList.add("scroll");
    }
  }

  // So that right clicking doesn't yield a lame context menu
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: any) {
    event.preventDefault();
  }
}
