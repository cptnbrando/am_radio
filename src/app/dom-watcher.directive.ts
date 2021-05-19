import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appDomWatcher]'
})
export class DomWatcherDirective implements OnInit {

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.registerDomChangedEvent(this.elRef.nativeElement);
  }
  
  registerDomChangedEvent(el) {
    const observer = new MutationObserver( list => {
      if(list[0].attributeName === "state")
      {
        // This means the js file set the state of the viisualizer and the radio player is ready!
        // console.log(list);
        const evt =
          new CustomEvent('dom-changed', {detail: list, bubbles: true});
        el.dispatchEvent(evt);
      }
    });
    const attributes = true;
    const childList = true;
    const subtree = true;
    observer.observe(el, {attributes, childList, subtree});
  }

}
