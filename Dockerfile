FROM openjdk:11
LABEL maintainer="captainbrando"
ADD build/libs/AMRadioServer-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
EXPOSE 443