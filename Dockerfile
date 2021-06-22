FROM openjdk:11
ADD build/app/AMRadioServer.jar	AMRadioServer.jar
EXPOSE 9015
ENTRYPOINT ["java", "-jar", "AMRadioServer.jar"]