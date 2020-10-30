# Getting Started with Docker CLI

## 1. Start an ubuntu container
For interacting with docker engine, you can use docker CLI. Through this guide we will get familiar with some of the mostly used docker CLI commands. 

`docker run` is the mostly used docker command, which has the following syntax:
~~~
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
~~~
To run our first container let's start an ubuntu container:
~~~
docker run --name ubuntu-container -i -t ubuntu:20.04 bash
~~~
In the above command we have used the following options:

* `--name`: The name of the container being crated

* `-i` and  `-t` : Keep stdin open (`-i`) and allocate a tty (`-t`) to have a shell access to the container

After specifying options we must pass in the image name which in this case we are using `ubuntu` image and version `20.04`.
The last argument is `bash`. We are telling the docker to execute the `bash` command after starting the container so we can have a shell access to it.
After executing the above command, you will have a shell access to your newly created docker container.

## 2. Interacting with the container
Now we have shell access to the container we can execute any command we like:
~~~ shell
apt update
apt install vim
~~~
Or create a file on the container:
~~~
cd /home
touch greeting.txt
echo "Hello" > greeting.txt
~~~
The next useful docker command is `exec`. Using `exec` you can directly execute any command on a container, so, you do not need to have to get a shell access first and then executing your command.
~~~
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
~~~
For example, we can view the content of the `greeting.txt` on the container:
~~~
docker exec ubuntu-container cat /home/greeting.txt
~~~
## 3. Container lifecycle
By using `docker run` command you can create containers. Once you have created a container you can stop, restart it or start it again:
~~~
docker stop ubuntu-container
~~~

~~~
docker start ubuntu-container
~~~

~~~
docker restart ubuntu-container
~~~

## 4. Transferring files between the container and the host
You can copy files from the container to the host:
~~~
docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-
~~~
Or, copy files from the host to the container:
~~~
	docker cp [OPTIONS] SRC_PATH|- CONTAINER:DEST_PATH
~~~
For instance, let's copy the file we have created to host and the copy it back to container with different name:
~~~
docker cp ubuntu-container:/home/greeting.txt /tmp
ls tmp
docker cp /tmp/greeting.txt ubuntu-container:/home/host_greeting.txt
docker exec ubuntu-container ls /home
~~~

> Copying files between host and container does not require the container to be running. You can copy files from and to stopped containers.
