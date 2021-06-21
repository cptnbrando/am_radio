// Spotify-Viz was created by Zach Winter
// All of this is his, parsing through that massive Spotify audio analytics data terrified me
// Much, much, much love to him <3
// The project can be found here: https://github.com/zachwinter/spotify-viz

export default function interpolate (a, b) {
  return function (t) {
    return a * (1 - t) + b * t
  }
}