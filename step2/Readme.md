# Getting Started with Docker CLI

## 1. Working with images
Docker containers are created from docker images. Each docker image can be thought of a template for creating a container. For example we have used the `ubuntu` image in the previous step to create a container.

Docker needs images to be stored locally on the host machine in order to be able to create containers from them.
You can list the images exists on your host like this:
~~~
docker image ls
~~~
Each docker image has a unique id. Also each image can be identified with a name and a tag. For example the name of the image we used in previous step was `ubuntu`. This specific image also has the tag `20.04`. Docker provides mechanisms for tagging images. So by tagging an image with a version number, various versions of an image can be differentiated.
~~~
REPOSITORY                          TAG                    IMAGE ID            CREATED             SIZE
ubuntu                              latest                 d70eaf7277ea        4 days ago          72.9MB
~~~

## 2. Tagging images
Once you have an image locally, you can change its tag using `docker tag`.
~~~
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
~~~
You can pick an image and change its name, tag or both.
~~~
docker tag ubuntu:latest my-ubuntu:v1
~~~

> Remember that, always, when you want to point to an image you can use image id instead of name and tag.

Now if you list images you can see two images with different repository and tags but pointing to a single image
(they have same id)
~~~
REPOSITORY                          TAG                    IMAGE ID            CREATED             SIZE
my-ubuntu                           v1                     d70eaf7277ea        4 days ago          72.9MB
ubuntu                              latest                 d70eaf7277ea        4 days ago          72.9MB
~~~

## 3. Image repository
Image repository,like code repositories, are used for version controlling of docker images for a single project, software, application, etc. They store docker images instead of code as opposed to code repository.
Examples of some image repositories are: `containous/whoami` or `docker.elastic.co/kibana/kibana`. 
> Note that the name and repository of an image are the same thing.

Repositories are stored in a docker registry. [Docker Hub](hub.docker.com) is the official docker registry which is provided by docker itself.

To use images on your host, you must pull them on your machine:
~~~
docker pull containous/whoami:v1.5.0
~~~
If you omit the tag, docker uses `latest` tag by default. It means that the following commands are equal:
~~~
docker pull containous/whoami
~~~
and
~~~
docker pull containous/whoami:latset
~~~

Docker CLI by default pulls images from the docker hub. To pull an image from another image registry you have to prepend the registry address to the image repository and tag:
~~~
docker pull myregistry.io/containous/whoami:v1.5.0
~~~ 
On the docker hub there are official images for well-known images such as `mysql`, `ubuntu`, `jdk`, etc.
These official images usually do not need any prefixes so can simply pull them:
~~~
docker image pull ubuntu
~~~
If you visit the image [page](https://hub.docker.com/_/ubuntu) on the docker hub you can see that it is labeled as an official docker image.

You can create an account for yourself on the [docker hub](https://hub.docker.com) so you can have public repositories for yourself.
For example, I have a version of ubuntu on on my own repository on the docker hub, which I can pull like this:
~~~
docker pull amirseyhani/ubuntu:latest
~~~
## 3. Building the first image
Docker images can be built using different methods. One way is to create the image from containers. To do so you can bring up a container and then make any change you want. Then you can create an image from your modified container. It is like that you are freezing your container and the taking a snapshot form it. Let's try this method.
Assume that we want to create a custom image which contains a greeting.txt file in its home directory.
To do so, first we bring up an ubuntu container:
~~~
docker run --name ubuntu-container -i -t ubuntu bash
~~~
Next, we create the file and put a message in it:
~~~
cd /home
touch greeting.txt
echo "Hello" > greeting.txt
~~~
Before creating the image, let's see the changes we have made:
~~~
docker diff ubuntu-container
~~~
Its look like that docker is tracking the changes in the container like git. There is also `docker commit` command which will create a new image from this container:
~~~
docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
~~~
So let's commit the container with a proper name:
~~~
docker commit ubuntu-container ubuntu-with-greeting:v1
~~~
> Again notice that if you omit the tag for your new image here, docker uses the `latest` tag.
Now, if we delete the container:
~~~
docker rm -f ubuntu-container
~~~
And start a container with our new image:
~~~
docker run --name ubuntu-container -i -t ubuntu-with-greeting:v1 bash
~~~
You can verify that the greeting file exist in the container:
~~~
cat /home/greeting.txt
~~~

## 4. Pushing the images
Now that you have a custom image you can push it to a repository in order to use it later. For pushing an image, first, you need to tag it properly. 

For pushing the `ubuntu-with-greeting` image to an repository on the docker hub you have to first tag the image like this:
`docker tag ubuntu-with-greeting amirseyhani/ubuntu-with-greeting:v1`
> Note that you could use the complete tag when you executed the commit command. So, you did not needed to tag it again.

>  The new tag name you are using here can be completely different.

Here the `amirseyhani/` prefix is mandatory which means that you push to a repository on a namespace of your account which you have access.

> If you try to push the image with tag `ubuntu-with-greeting`, it means that you are trying to push your image on a repository on the root namespace of the docker hub, which you do not have access to!

Next, before pushing the image, you have to login to the docker hub:
~~~
docker login -u amirseyhani -p45875154
~~~
> Docker stores your credentials locally so you do not need to login again for a while.

Finally, you can push the image:
~~~
docker push amirseyhani/custom-ubuntu:v1
~~~