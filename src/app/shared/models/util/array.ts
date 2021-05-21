// Spotify-Viz was created by Zach Winter
// All of this is his, parsing through that massive Spotify audio analytics data terrified me
// Much, much, much love to him <3
// The project can be found here: https://github.com/zachwinter/spotify-viz

/**
 * @function getRandomElement – Retrieve random element from array.
 */
export function getRandomElement (arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}