# Docker Compose
## 1. Building a real application
In this step we try to setup a complete web application. This web application is a very simple ToDo app which we can add and remove todo items with it.
This web application consists of three services:
* Backend: we use java and spring to bring up an api for the todo app.
* Database: we use a mysql server which is used by the backend service
* Frontend: we use vue.js to create the ui for our web app which uses the backend api.

Next, each service is explained:

### Backend Service
We create a simple CRUD api for ToDos. We define each todo as a simple text. This api can create a ToDo, delete a ToDo, and return the list of all ToDos.

The spring framework is used here for creating the api. For starting, first we need to build our java project and create an executable jar file. 
First, head into the `backend` directory:
```
cd backend
```

For building the project we need to execute `mvn clean package` command.
If you already have maven and java 11 installed on your machine, you can build the project on your machine:
```
mvn clean package
```
Otherwise, you can bring up a temporary `maven` container and build the project inside this container:
```
docker run --rm -v $(pwd):/home/backend repository -w /home/backend  maven:3.6.3-jdk-11 mvn clean package
```
> We have attached the current working directory as a volume to the maven container.
> Instead of getting shell access and executing `mvn clean package`, we are directly executing the `mvn clean package` command on the container. 
> Using `-w` option we can set the working directory for the command to be executed.

After building the project, we have a `notes-backend.jar` file in the target directory. Now, its time to write a docker file so we can run the backend api in a container:
```dockerfile
FROM openjdk:11-alpine
WORKDIR /home
COPY ./target/notes-backend.jar /home/notes-backend.jar
ENTRYPOINT java -jar notes-backend.jar
```
Since we want to run the jar file, we have set the base image to openjdk. Then we have copied the jar file into the image. Finally, we used the `ENTRYPOINT` instruction to run the jar file.
Now, let's build our image:
```
docker build -t notes-backend:v1 ./
```

### Frontend service
The frontend service has been written in vue. It has a simple page for viewing the list of ToDos, adding a new ToDo and deleting ToDos. This application will uses the backend api.
For bringing up our vue application we first build the project and then we serve the generated static files using an nginx image (like what we have done in step4). 
If you have node installed on your machine, you can simply execute the following command to build the project:
```
npm run build
```
Otherwise, again you can bring up a temporary node container and build the project inside that:
```
docker run --rm -v $(pwd):/frontend -w /frontend node:lts-alpine npm run build
```
The dist folder contains the compiled code of our application. 
Now, we write the following dockerfile for the frontend service:
```dockerfile
FROM nginx:1.19
COPY dist/ /usr/share/nginx/html/
```
As you can see, it is similar to what we have written in step4. We just needed to copy the dist folder to proper directory in the image and we are done. 

So, let's build the frontend image:
```
docker build -t notes-frontend:v1 ./
```
## 2. Starting the services
In this section we try to bring up all the containers needed. We need a container for backend, frontend, and one for the database. 
First, we bring up the database container:
```
cd mysql
docker run -d --name mysql-server \
-e MYSQL_ROOT_PASSWORD=1234 \
-e MYSQL_DATABASE=notes \
-e MYSQL_USERNAME=admin \
-e MYSQL_PASSWORD=12345 \
-v $(pwd)/data:/var/lib/mysql \
-v $(pwd)/server.cnf:/etc/mysql/conf.d/server.cnf \
mysql
```
In this command, in addition to root password, we set a database name, an username and a password. Mysql image will create a database and a user with the information we have provided, and then it grants all privileges on this database to the user. We have also attached a volume for data. 
We also attached the server.cnf file to configure the database settings. Since our backend service will run in a separate container, we have configured the mysql to accept connections from any host.

Next, we bring up the backend container:
```
cd ../backend
docker run -d --name backend-container \
-e MYSQL_SERVER_HOST: mysql-server \
-e MYSQL_SERVER_USERNAME: admin \
-e MYSQL_SERVER_PASSWORD: 12345 \
-p 8080:8080 \
notes-backend:v1
```
Since the api needs a connection to the database, we need to specify the address of the database. We need an ip address or hostname. When working with docker, most of the time, it is not reasonable to use ip address of the containers, since ip addresses are dynamically allocated by docker, so if some container is removed and added again it may given a different ip. 
The better way is to use hostname of the container. By default, docker sets the name of the container as its hostname. Hostnames assigned by docker, in the docker networks, are resolved to corresponding container ip address. So because we named our database container `mysql-server` we can now use this name as the hostname of the mysql container.
We also passed the username and password that we used when running the mysql container so that the backend api be able to authenticate with the database.

Finally, we bring up the frontend container:
```
docker run -d -p 9090:80 notes-frontend:v1
```

You can now visit localhost:9090 and work with our simple ToDo app.

## 3.Introducing docker-compose!
We have now learnt how create images and containers. In this step we also learnt how to bring up a multiple containers to shape up a complete service. For real world applications we have many services and we need a to bring up a dozen of containers. Even in out ToDo app example we have needed to execute three commands and each of these commands were complex. Instead we can use docker-compose to alleviate this process. Docker-compose is a tool for managing the lifecycle of multiple containers. Docker-compose is not a part of docker cli, so its needed to be installed separately. 

Docker compose, reads the configuration of multiple containers form a yaml file and then can manage all or each of them with the commands it provides. 

Let's see the docker compose file that we can use for the ToDo app:
```yml
version: "3.8"

services:
  mysql:
    container_name: "${DATABASE_HOST}"
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: 1234
      MYSQL_DATABASE: notes
      MYSQL_USER: "${DATABASE_USERNAME}"
      MYSQL_PASSWORD: "${DATABASE_PASSWORD}"
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/server.cnf:/etc/mysql/conf.d/server.cnf

  backend:
    container_name: notes-backend
    image: notes-backend:v1
    environment:
      MYSQL_SERVER_HOST: "${DATABASE_HOST}"
      MYSQL_SERVER_USERNAME: "${DATABASE_USERNAME}"
      MYSQL_SERVER_PASSWORD: "${DATABASE_PASSWORD}"
    ports:
      - 8080:8080

  frontend:
    container_name: notes-frontend
    image: notes-frontend:v1
    ports:
      - 9090:80
```
In the first line of the file we must set the docker compose version that we want to use. 
Next we define the configuration of each container, which is called a service in docker compose file. As you can see we are setting the same attributes of the container as we have used the docker run command. But this time they are structured and its easier to modify them. 
We also used environment variables, e.g. DATABASE_USERNAME, for the values that are common between two or more containers. 
You may also have notice that, using docker compose, we can now use relative path for volumes.
Now let's use this file to bring up our ToDo app. 
First, change your working directory to step6. Docker compose cli assumes there is a docker-compose.yml file in current directory. Also, instead of setting the environment variables in the command line, we can put them in a file named `.env`. Docker compose automatically picks up the variables in the `.env` file in the current directory and substitutes them.
Now, to bring up all the containers we just need to run:
```
docker-compose up -d
```
Like docker run, `-d` option brings up the containers in the background. 
The `up` command is a shortcut for `create` and `start` containers. Docker compose have familiar commands like the docker cli, but the difference, and also the advantage here is that it only executes the command for the containers that specified in the docker compose file. Here is a short description of these commands:
* `create`: Create the containers
* `start`: Start the containers
* `stop`: Stop the containers 
* `rm`: Remove the containers
* `up`: Create and start the containers
* `down`: Stop and remove the containers
* `restart`: Restart the containers
* `logs`: View logs of the containers
* `pull`: Pull images of the services
* `push`: Push images of the services
* `ps`: View status of the containers
You can also use the above command with the name single or multiple services to execute the command only for that services, for example you can stop only the backend and frontend services:
```
docker-compose stop backend frontend
```
> Note that you can not use the container name here, but the service name. Service names are keys of the services dictionary in the yaml file.

Another useful command is `docker-compose config` which validates the docker-compose file and then prints it.

## 4. Building the images using docker compose
For using the docker compose file in the previous section, we have built the images which needed in section 2. But building images also adds another manual action for bringing up our application. We can use docker compose to automate the building of the images too.

Now we will use the following docker-compose file for the ToDo application:

```yml
version: "3.8"

services:
  mysql:
    container_name: "${DATABASE_HOST}"
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: 1234
      MYSQL_DATABASE: notes
      MYSQL_USER: "${DATABASE_USERNAME}"
      MYSQL_PASSWORD: "${DATABASE_PASSWORD}"
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/server.cnf:/etc/mysql/conf.d/server.cnf

  backend:
    container_name: notes-backend
    build: ./backend
    environment:
      MYSQL_SERVER_HOST: "${DATABASE_HOST}"
      MYSQL_SERVER_USERNAME: "${DATABASE_USERNAME}"
      MYSQL_SERVER_PASSWORD: "${DATABASE_PASSWORD}"
    ports:
      - 8080:8080

  frontend:
    container_name: notes-frontend
    build: ./frontend
    ports:
      - 9090:80
```

You can see that, in this docker-compose file, we removed the image property and instead we have added the build property. Here we specified build for both frontend and backend services. The build property can be specified as a path of the build context. Since we have a dockerfile in each of the frontend and backend directories, we passed these directories as the build context. Now we can instruct docker compose to build our images before attempting to container creation. Hence, all of the build, creation and start of our containers can done using the following command:
```
docker-compose up -d --build
```
> Docker compose do not try to build the image if it had been build the image before. So, if we want to force the image to rebuild we must pass the `--build` argument.
