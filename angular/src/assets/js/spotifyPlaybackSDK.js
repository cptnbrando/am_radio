window.onSpotifyWebPlaybackSDKReady = () => {

  // We will modify the attributes to notify the UI of player changes
  let sdk;

  const player = new Spotify.Player({
    name: 'am_radio',
    getOAuthToken: cb => { 
      sdk = document.querySelector("#sdk");
      cb(localStorage.getItem("accessToken"));
    }
  });

  // Error handling
  const error = (message) => {
    console.error(message);
    sdk.setAttribute("badState", "true");
  }
  
  player.addListener('initialization_error', ({ message }) => {
    console.log("Initialization error:");
    error(message);
  });
  player.addListener('authentication_error', ({ message }) => {
    console.log("authentication error:");
    error(message);
  });
  player.addListener('account_error', ({ message }) => {
    console.log("Account_error:");
    error(message);
  });
  player.addListener('playback_error', ({ message }) => {
    console.log("playback error:");
    error(message);
  });

  player.addListener('player_state_changed', state => { 
    if(state) {
      sdk.setAttribute("current", state.track_window.current_track.uri);
      sdk.setAttribute("paused", state.paused);
      sdk.setAttribute("duration", state.duration);
      sdk.setAttribute("repeat", state.repeat_mode);
      sdk.setAttribute("shuffle", state.shuffle);
    }
  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    sdk.setAttribute("state", "true");
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
    sdk.setAttribute("badState", "true");
  });

  // Connect to the player!
  player.connect().then(success => {
    if(success) {
      console.log('The Web Playback SDK successfully connected to Spotify!');
    }
  });

  // Add player to Window
  window.spotifyPlayer = player;
};
