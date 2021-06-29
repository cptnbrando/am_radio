import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appDomWatcher]'
})
export class DomWatcherDirective implements OnInit {

  canvas: any;
  currentlyPlaying: string = "";

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.registerDomChangedEvent(this.elRef.nativeElement);
    this.canvas = document.querySelector("canvas");
  }
  
  // This gets called whenever the canvas element has it's attributes changed
  // list is the array of all attributes
  registerDomChangedEvent(el: any) {
    const observer = new MutationObserver( list => {

      list.forEach((mutation) => {
        // console.log(mutation.attributeName);
        switch(mutation.attributeName) {
          // This means the js file set the state of the visualizer and the spotify player is ready!
          case "state":
            el.dispatchEvent(new CustomEvent('ready', {detail: mutation, bubbles: true}));
            break;
          // This means the track has changed
          case "current":
            el.dispatchEvent(new CustomEvent('currentChange', {detail: mutation, bubbles: true}));
            break;
          // This means the player has detected a playback change
          case "paused":
            el.dispatchEvent(new CustomEvent('playbackChange', {detail: mutation.target, bubbles: true}));
            break;
          // This means the player has detected a new next song, like a queued up track
          case "next":
            el.dispatchEvent(new CustomEvent('nextChange', {detail: mutation.target, bubbles: true}));
            break;
          // This means the player has detected a repeat change
          case "repeat":
            el.dispatchEvent(new CustomEvent('repeatChange', {detail: mutation.target, bubbles: true}));
            break;
          // This means the player has detected a shuffle change
          case "shuffle":
            el.dispatchEvent(new CustomEvent('shuffleChange', {detail: mutation.target, bubbles: true}));
            break;
        }
      })
    });
    const attributes = true;
    const childList = true;
    const subtree = true;
    observer.observe(el, {attributes, childList, subtree});
  }

}
