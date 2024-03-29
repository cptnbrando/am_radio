# am_radio web application

am_radio is a full-stack Spring/Angular music player application to share Spotify playlists and listen to them in realtime, with chatrooms and a swanky visualizer to boot.<br>
<br>
Backend Spring Boot project and docs can be found in the parent directory [here](https://github.com/cptnbrando/am_radio).

## Technologies Used

- [Angular 12.1.0](https://angular.io/guide/setup-local)
- [node.js 16.4.0](https://nodejs.org/en/download/)
- [npm 7.18.1](https://nodejs.org/en/download/)
- [@fortawesome/angular-fontawesome 0.9.0](https://github.com/FortAwesome/angular-fontawesome)
- [Angular Material 12.1.0](https://material.angular.io/)
- [@types/sockjs-client 1.5.0](https://www.npmjs.com/package/@types/sockjs-client)
- [@types/spotify-web-playback-sdk 0.1.9](https://www.npmjs.com/package/@types/spotify-web-playback-sdk)
- [@types/stompjs 2.3.4](https://www.npmjs.com/package/@types/stompjs)
- [d3-array 3.0.1](https://www.npmjs.com/package/d3-array)
- [d3-color 3.0.1](https://www.npmjs.com/package/d3-color)
- [d3-interpolate 3.0.1](https://www.npmjs.com/package/d3-interpolate)
- [d3-scale 4.0.0](https://www.npmjs.com/package/d3-scale)
- [SockJS 1.4.0](https://www.npmjs.com/package/sockjs)
- [STOMP.js 2.3.3](https://www.npmjs.com/package/stompjs)
- [net 1.0.2](https://www.npmjs.com/package/net)
- [Spotify Web API Node 5.0.2](https://www.npmjs.com/package/spotify-web-api-node)

This project would not have been possible without the projects [Kaleidosync](https://github.com/zachwinter/kaleidosync) and [spotify-viz](https://github.com/zachwinter/spotify-viz) by @ZachWinter. If you're trying to make a Spotify visualizer app, I suggest you check those out first!

Also check out [angular-spotify](https://github.com/trungk18/angular-spotify) by @trungk18.

# Getting Started

Make sure you have [node.js v16.4.0+](https://nodejs.org/en/download/) , [npm v7.18.1+](https://nodejs.org/en/download/) , and [Angular v12.1.0+](https://angular.io/guide/setup-local) 

> Clone this repository
```
git clone https://github.com/cptnbrando/am_radio
```

> npm install in angular project folder
```
cd angular
npm i
```

## **Usage**

> Run main in AmRadioServerApplication in IDE

> Run angular project
```
cd angular
npm run start
```

> Visit localhost in web browser
```
http://localhost:4200
```

## **License**

This project uses the following license: [The MIT License](https://www.mit.edu/~amini/LICENSE.md).