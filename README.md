# am_radio - A Spotify live radio application

am_radio is a full-stack Spring/Angular music player application to share Spotify playlists and listen to them in realtime, with chatrooms and a swanky visualizer to boot.<br>
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
- [Jenkins](https://www.jenkins.io/)
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
