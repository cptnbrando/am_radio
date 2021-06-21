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
    canvas.setAttribute("state", "false");
    canvas.setAttribute("current", "");
    canvas.setAttribute("paused", "true");
    canvas.setAttribute("badState", "false");
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
    // position,
    // duration,
    track_window: { previous_tracks, current_track, next_tracks }
  }) => {
    // Detects for playback changes
    player.getCurrentState().then(data => {
      console.log("Current paused value:", (canvas.getAttribute("paused") === "true"));
      console.log("Current data paused value:", data.paused);
      if((canvas.getAttribute("paused") === "true") != data.paused)
      {
        console.log("Play/pause detected!");
        console.log(data);
        canvas.setAttribute("paused", data.paused);
      }
    });

    // Detects for track changes
    if(canvas.getAttribute("current") != current_track.uri)
    {
      console.log('Track change detected!', current_track);
      canvas.setAttribute("current", current_track.uri);
    }

    // canvas.setAttribute("trackName", current_track.name);
    // canvas.setAttribute("trackArtist", current_track.artists[0].name);
    // canvas.setAttribute("trackAlbum", current_track.album.name);
    // canvas.setAttribute("trackImage", current_track.album.images[0].url);

    // console.log('Position in Song', position);
    // console.log('Duration of Song', duration);
  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    // We change the dom once it's ready, so angular can see it
    canvas.setAttribute("state", "true");
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
    canvas.setAttribute("badState", "true");
  });

  // Connect to the player!
  player.connect().then(success => {
    if (success) {
      console.log('The Web Playback SDK successfully connected to Spotify!');
    }
  })
};
