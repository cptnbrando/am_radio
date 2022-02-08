# am_radio - A Spotify live radio application

am_radio is a full-stack music player application to share Spotify playlists and listen to them in realtime, with chatrooms and a swanky visualizer to boot. Created in Angular with Spring Boot.<br>
<br>
Frontend Angular project and docs can be found in [/angular](https://github.com/cptnbrando/am_radio/tree/main/angular).

## Technologies Used

- [Spring Boot 2.5.1](https://start.spring.io/)
  - Spring Actuator
  - Spring Data JPA
  - Spring Web MVC
  - Spring Websocket
  - Spring Devtools
  - Lombok
  - h2 Database
  - PostgreSQL Driver
  - Log4J
- Java 11
- [Spotify Web API Java by @thelinmichael](https://github.com/thelinmichael/spotify-web-api-java)
- JUnit Testing
- AWS RDS
- AWS EC2 Deployment
- [Docker](https://www.docker.com/)

# Getting Started

Make sure you have [node.js v16.3.0+](https://nodejs.org/en/download/) , [npm v7.16.0+](https://nodejs.org/en/download/) , and [Angular v12.0.3+](https://angular.io/guide/setup-local) 

> Clone this repository
```
git clone https://github.com/cptnbrando/am_radio
```

> npm install in angular project folder
```
cd angular
npm i
```

> Create prod.env and dev.env files in root folder, both with format:
```
SPRING_PROFILES_ACTIVE=prod
RADIO_DB_URL={Amazon RDS db endpoint}
RADIO_DB_USERNAME={Amazon RDS DB Username}
RADIO_DB_PASSWORD={Amazon RDS DB Password}
RADIO_APP_URL={URL of hosting, for local its something like localhost:4200 and for prod its something like https://amradio.app}
SPOTIFY_CLI_ID={Spotify App clientID, register an app with Spotify to get yours here: https://developer.spotify.com/}
SPOTIFY_CLI_SECRET={Spotify App Secret, register an app with Spotify to get yours here: https://developer.spotify.com/}
SPOTIFY_CLI_REDIRECT={RADIO_APP_URL}/api/spotify/getUserCode

All values without {} are entered as is
```

> If deploying, create a certificate.p12 file using [Certbot](https://certbot.eff.org/) on wherever you are hosting. Add it to src/main/resources (Spotify requires HTTPS when using their API for deployment. Skip this step if deploying with automated HTTPS hosting functionality)

## **Usage**

> Run main in AmRadioServerApplication in IDE with SPRING_PROFILES_ACTIVE=prod as Environment Variable (this creates local Angular folder used for deployment)

> Now that files are generated, run main again with SPRING_PROFILES_ACTIVE=dev

> Visit localhost in web browser
```
localhost:443
```

## **License**

This project uses the following license: [The MIT License](https://www.mit.edu/~amini/LICENSE.md).
