window.onSpotifyWebPlaybackSDKReady = () => {

  // We will modify the attributes to notify the UI of player changes
  let canvas;

  const player = new Spotify.Player({
    name: 'am_radio',
    getOAuthToken: cb => { 
      let access = localStorage.getItem("accessToken");
      console.log("my access token: " + access);
      canvas = document.querySelector("canvas");
      cb(access);
    }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { 
    console.error(message);
    canvas.setAttribute("state", "false");
  });
  player.addListener('playback_error', ({ message }) => {
    console.error(message);
    canvas.setAttribute("state", "false");
  });

  // Playback status updates
  player.addListener('player_state_changed', ({
    track_window: { current_track }
  }) => {
    console.log('Currently Playing', current_track);
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
    document.querySelector("canvas").setAttribute("state", "true");
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect().then(success => {
    if (success) {
      console.log('The Web Playback SDK successfully connected to Spotify!');
    }
  })
};
