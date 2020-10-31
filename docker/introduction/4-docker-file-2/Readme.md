# Creating Real Containers

## 1. How do containers used in practice?
Most containers are setup to run specific applications. For example an Nginx container has all its dependencies installed on a linux distribution and then it runs the nginx server, each time you create an start the container. So, there is no need to directly access the container with shell and run a bunch of commands to start the nginx server. Instead, the Nginx image itself contains instruction to do this for us.

Let's create an nginx container:
```
docker run -d --name nginx-container -p 8080:80 nginx
```
Here `-d` options forces the container to run in the background.

The `-p` option binds a container port to host machine port, here we are binding the port `8080` of the host to the port `80` of the container.

If you list the containers, you can see that your nginx container is up and running:
```
docker container ls
```
Now if you visit `localhost:8080` you can see the default welcome page of the nginx:
```
curl localhost:8080
```
Remove the nginx container when you are done:
```
docker rm -f nginx-container
```
> The `rm` command fails if the container is running. So we use `-f` option to force rm to remove a running container.

Now, let's do an experiment. First start a container with the `ubuntu-with-greeting` image we have built in the previous step:
```
docker run -d --name greeting-container ubuntu-with-greeting:v2
```
Next, list the containers:
```
docker container ls
```
Seems strange, there is no sign of our greeting container! `container ls` only lists the running containers. Using `-a` option you can list all containers including stopped ones, so lets try it:
```
docker container ls -a
```
Now you can see the greeting container.
Its status says that it has been exited, so its no longer running.
Okay, lets start the container again:
```
docker start greeting-container
docker container ls -a
```
Again, you see that the container has been exited! We will see the cause of this behavior in the next section.

## 2. Entrypoint
The goal of each docker container is to setup and run an application. So, after installing dependencies and setting up the environment while building an image, we finally need to start the needed application. For example in case of the nginx image, there is an instruction in its dockerfile which results in the starting of the nginx server, each time you start a container of this image. Now, lets try to create a (somehow) more useful container. 
### Pinger
We build an image which has the responsibility of continuously pinging the google.com.
Let's use the following dockerfile:
```dockerfile
FROM ubuntu:20.04
RUN apt update
RUN apt install iputils-ping -y
ENTRYPOINT ping google.com
```
Here, we use ubuntu as base image and then we have installed the ping utility. Finally, we need to make the image start pinging google if we start the container. This can be done using the `ENTRYPOINT` instruction.
```dockerfile
ENTRYPOINT command param1 param2
```
As you can see it runs a command like the `RUN` instruction, but, the difference here is that it runs the specified command only when the container is started. As the name suggests, its an entrypoint to our container when we start it. 
```dockerfile
ENTRYPOINT ping google.com
```
So with the above instruction we have instructed the image to run the ping command when the container starts.
Now, let's build and run the pinger.
First, head to `step4/pinger` and build the image:
```
cd pinger
docker image build -t pinger:v1 ./
```
And then run a pinger container:
```
docker run -d --name pinger-container pinger:v1
```
Next you can see that the container is up and running:
```
docker container ls
```
Now lets check whether the container is working properly by observing its logs:
```
docker logs -f pinger-container
```
With `-f` we instruct `logs` command to follow the logs, means that it continiously checks the logs and print them in the stdout.

When you are done, delete the container:
```
docker rm -f pinger-container
```

## 3. Building a more advanced image
Let's build another image. In this section we build a custom nginx image which serves our static website.
We use the following html file for the homepage of our website.
```html
<html>
<body>
    <h1>
        Welcome to my website!
    </h1>
</body>
</html>
```
Next, we use nginx as the base image for building our custom image for serving our html page. Nginx starts a web server which listens on port 80 and, by default, serves the content resides in the `/usr/share/nginx/html/` directory. So, after setting the base image to nginx, we will copy the `index.html` file to this directory. To do so, we use `COPY` instruction.
```dockerfile
COPY <src>... <dest>
```
By using `COPY`, our dockerfile becomes like this:
```dockerfile
FROM nginx:latest
COPY ./index.html /usr/share/nginx/html/
```
You may have noticed that we have used a relative address for `index.html`. For the `COPY` instruction, src must be paths of files in the context. The context is a directory of files to be used during the image building process, which we pass to `docker image build` command. 

To see this in action, head to the `website` directory. Here we have `Dockerfile` and `index.html` files. Next, let's build the image:
```
cd ../website
docker image build -t website:v1 ./
```
In the command above we have passed the `./` as the context. Using this context we have access to this directory during the build process, so we can use `./index.html` as the src argument for the `COPY` instruction.
You can put any other files or directories in the context and access the during the build.

Finally, start the container of our simple website image:
```
docker run -d --name website-container -p 8080:80 website:v1
```
We have used `-p` to bind the port 8080 of the host to the port 80 of the container, which is the one that nginx listens on. Next, if you access the localhost:8080 you can see the content of your index.html:
```
curl localhost:8080
```
