window.onSpotifyWebPlaybackSDKReady = () => {

  // We will modify the attributes to notify the UI of player changes
  let canvas;

  const player = new Spotify.Player({
    name: 'am_radio',
    getOAuthToken: cb => { 
      initCanvas();
      cb(localStorage.getItem("accessToken"));
    }
  });

  const initCanvas = () => {
    canvas = document.querySelector("canvas");
  }

  // Error handling
  const error = (message) => {
    console.error(message);
    canvas.setAttribute("badState", "true");
  }
  
  player.addListener('initialization_error', ({ message }) => { error(message); });
  player.addListener('authentication_error', ({ message }) => { error(message); });
  player.addListener('account_error', ({ message }) => { error(message); });
  player.addListener('playback_error', ({ message }) => { error(message); });

  // Playback status updates
  // Kinda crazy, but passing data between this js file and angular is stupid weird
  // Soooo we edit DOM elements and watch for DOM changes with a dom-watcher directive
  // It's a hacky fix, but it works lol
  player.addListener('player_state_changed', ({
    duration,
    track_window: { current_track }
  }) => {
    if(typeof duration === null || typeof duration === undefined || typeof track_window === null || typeof track_window === undefined) {
      return;
    }
    // Detects for playback changes
    player.getCurrentState().then(data => {
      if (!data) {
        console.error('User is not playing music through the Web Playback SDK');
        return;
      }
      canvas.setAttribute("current", current_track.uri);
      canvas.setAttribute("paused", data.paused);
      canvas.setAttribute("duration", duration);
      canvas.setAttribute("repeat", data.repeat_mode);
      canvas.setAttribute("shuffle", data.shuffle);
    });
  }, error => {
    console.log("Error on player_state_changed");
  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    canvas.setAttribute("state", "true");
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
    canvas.setAttribute("badState", "true");
  });

  // Connect to the player!
  player.connect().then(success => {
    if(success) {
      console.log('The Web Playback SDK successfully connected to Spotify!');
    }
  })
};
