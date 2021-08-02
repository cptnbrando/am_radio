window.onSpotifyWebPlaybackSDKReady = () => {

  // We will modify the attributes to notify the UI of player changes
  let canvas;

  const player = new Spotify.Player({
    name: 'am_radio',
    getOAuthToken: cb => { 
      canvas = document.querySelector("canvas");
      cb(localStorage.getItem("accessToken"));
    }
  });

  // Error handling
  const error = (message) => {
    console.error(message);
    canvas.setAttribute("badState", "true");
  }
  
  player.addListener('initialization_error', ({ message }) => { error(message); });
  player.addListener('authentication_error', ({ message }) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        localStorage.setItem("accessToken", xmlHttp.responseText);
        player.getOAuthToken(cb => {
          cb(xmlHttp.responseText);
        });
      }
    }
    xmlHttp.open( "GET", "/api/spotify/getTokens", true );
    xmlHttp.send( null );
    // player.getOAuthToken(cb => {
    //   localStorage.setItem("accessToken", xmlHttp.responseText);
    //   cb(xmlHttp.responseText);
    // });
    // error(message);
  });
  player.addListener('account_error', ({ message }) => { error(message); });
  player.addListener('playback_error', ({ message }) => { error(message); });

  player.addListener('player_state_changed', state => { 
    if(state) {
      canvas.setAttribute("current", state.track_window.current_track.uri);
      canvas.setAttribute("paused", state.paused);
      canvas.setAttribute("duration", state.duration);
      canvas.setAttribute("repeat", state.repeat_mode);
      canvas.setAttribute("shuffle", state.shuffle);
    }
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
  });

  // Add player to Window
  window.spotifyPlayer = player;
};
