FROM openjdk:11
LABEL maintainer="bdcruz128@gmail.com"

RUN mkdir /home/app
VOLUME ["/home/app"]
WORKDIR /home/app

EXPOSE 9015
ENTRYPOINT java -jar *.jar