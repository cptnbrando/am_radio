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
  
  // This gets called whenever the canvas element has it's attributes changed
  // list is the array of all attributes
  registerDomChangedEvent(el) {
    const observer = new MutationObserver( list => {

      list.forEach((mutation) => {
        // This means the js file set the state of the visualizer and the spotify player is ready!
        if(mutation.attributeName === "state")
        {
          el.dispatchEvent(new CustomEvent('ready', {detail: mutation, bubbles: true}));
        }
        
        // This means the js file set the badState, so the spotify player is not ready
        else if(mutation.attributeName === "badState")
        {
          el.dispatchEvent(new CustomEvent('notReady', {detail: mutation, bubbles: true}));
        }

        // This means the track has changed
        else if(mutation.attributeName === "current")
        {
          el.dispatchEvent(new CustomEvent('trackChange', {detail: mutation, bubbles: true}));
        }

        // This means the track's position has changed, which will be called a fuck ton
        else if(mutation.attributeName === "position")
        {
          el.dispatchEvent(new CustomEvent('positionChange', {detail: mutation, bubbles: true}));
        }

        // This means the player has detected a playback change
        else if(mutation.attributeName === "paused")
        {
          el.dispatchEvent(new CustomEvent('playbackChange', {detail: mutation.target, bubbles: true}));
        }
      })
    });
    const attributes = true;
    const childList = true;
    const subtree = true;
    observer.observe(el, {attributes, childList, subtree});
  }

}
