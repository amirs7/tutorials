FROM openjdk:12-alpine
ADD irandb-backend.jar /home/irandb-backend.jar
WORKDIR /home
CMD java -jar irandb-backend.jar --spring.profiles.active=$SPRING_ACTIVE_PROFILE