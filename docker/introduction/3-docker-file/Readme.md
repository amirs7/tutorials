# Introduction to Dockerfile

## 1. What is Dockerfile
The more convenient way to create docker images is yo using `Dockerfile`. 
With a `Dockerfile`, you write instructions needed for building the image. This feature gives you the ability to modify the image whenever it needed.

Here is an example of a simple dockerfile, which builds an image similar to the one we made in previous step:
```dockerfile
FROM ubuntu:20.04
WORKDIR /home
RUN touch greeting.txt
RUN echo "Hello" > greeting.txt
``` 
## 2. Dockerfile Syntax
The format of a `Dockerfile` is:
```dockerfile
# Comment
INSTRUCTION arguments
```
Docker runs each instruction in the Dockerfile in order to build the image.
Next, we get familiar with a few instructions.
### FROM
```dockerfile
FROM <image>
```
Each Dockerfile must start with a
`FROM` instruction. It sets the base image for the image we are trying to build. For instance in the example in the previous section, the base image was `ubuntu`, and we built a new image based on `ubuntu` which contains the greeting file.
### RUN
```dockerfile
RUN <command>
```
The `RUN` instruction, executes the given command on the image.  
For example, we have used `RUN` instruction to create a file an put the message inside it:
```dockerfile
RUN touch greeting.txt
RUN echo "Hello" > greeting.txt
```
### WORKDIR
```dockerfile
WORKDIR /path/to/workdir
```
By using `WORKDIR` instruction you can set the working directory inside the image for the other instructions following this line. You can think of `WORKDIR` as the `cd` command counterpart in a `Dockerfile`. 
For example you can change working directory to `/home` and the create a text file there:
```dockerfile
WORKDIR /home
RUN touch greeting.txt
```
## 3. Building an image from dockerfile
Building images from a `Dockerfile` can be done using `docker build` command:
``` 
docker build [OPTIONS] PATH | URL | -
```
The `build` command accepts a path for the **context** of the build. The context is a directory with a set of files which docker uses for building the image. By default, docker requires a file named `Dockerfile` in the context. Other files in the context are available for using during the image build process. 

Let's build new version of the `ubuntu-with-greeting`, this time, using a `Dockerfile`. First, change your working directory to `step3` and run the following command to build the image:
```
docker image build -t ubuntu-with-greeting:v2 ./
```
Here we are passing the current working directory (`./`) as the context path. We also tagged our image `ubuntu-with-greeting:v2` using `-t` option. 

Now, if we run a container from this image:
```
docker run --rm -it ubuntu-with-greeting:v2 bash
```
> `--rm` option tells docker engine to remove the container after is has been stopped. This option can be useful when you want temporary containers to do some experiment with an image.

Then we can see that it has a greeting file in the `home` directory:
```
ls /home
cat /home/greeting.txt
```
