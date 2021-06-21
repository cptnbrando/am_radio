 interface Scripts {
    name: string;
    src: string;
}  
export const ScriptStore: Scripts[] = [
    {name: 'spotifyPlayer', src: 'https://sdk.scdn.co/spotify-player.js'},
    {name: 'spotifyPlaybackSDK', src: '../../../assets/js/spotifyPlaybackSDK.js'}
];