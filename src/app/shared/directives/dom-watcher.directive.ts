import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appDomWatcher]'
})
export class DomWatcherDirective implements OnInit {

  canvas: any;
  currentlyPlaying: string;

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.registerDomChangedEvent(this.elRef.nativeElement);
    this.canvas = document.querySelector("canvas");
  }
  
  registerDomChangedEvent(el) {
    const observer = new MutationObserver( list => {
      // We only want it to trigger on playback changes, which won't happen at the same time
      if(list.length === 1)
      {
        // console.log(`list`);
        // console.log(list);
        if(list[0].attributeName === "state")
        {
          // This means the js file set the state of the visualizer and the radio player is ready!
          el.dispatchEvent(new CustomEvent('ready', {detail: list, bubbles: true}));
        }
        if(list[0].attributeName === "badState")
        {
          // This means the js file set the badState, so the visualizer is not ready
          el.dispatchEvent(new CustomEvent('notReady', {detail: list, bubbles: true}));
        }
        if(list[0].attributeName === "current")
        {
          // This means the player has detected a change in song
          el.dispatchEvent(new CustomEvent('trackChange', {detail: list, bubbles: true}));
        }
        if(list[0].attributeName === "paused")
        {
          // This means the player has detected a playback change
          el.dispatchEvent(new CustomEvent('playbackChange', {detail: list[0].target, bubbles: true}));
        }
      }
    });
    const attributes = true;
    const childList = true;
    const subtree = true;
    observer.observe(el, {attributes, childList, subtree});
  }

}
