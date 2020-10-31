# Docker Volumes

## 1. What is the use-case of the volumes?
Suppose that we have a mysql server container for storing the data for a web application. 
Let's start a mysql server container.
```
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=1234 -d  mysql
```
> In the above command, we used `-e` option to pass the `MYSQL_ROOT_PASSWORD` environment variable to the container. Most images usually use environment variables for common and important configuration options. List of such environment variables and configuration options can be found on the official page of the image. 

Then, we make a shell access to the container:
```
docker exec -it mysql-container bash
```
Now, we can use mysql shell to manipulate the database:
```
mysql -uroot -p1234
```
> Please note that you have to wait a little before executing the above command so mysql server completes its initialization. You can check the container logs and when you see a line like this: `Plugin ready for connections. Socket: '/var/run/mysqld/mysqlx.sock' bind-address: '::' port: 33060
` you can be sure that the mysql server is ready.

Now, lets create an user and a database:
```sql
CREATE DATABASE Test;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'pass';
GRANT ALL PRIVILEGES ON * . * TO 'admin'@'localhost';
exit
```
Now, if we close the mysql shell, we can login again using using admin user's credentials:
```
exit
mysql -uadmin -ppass
```
You can also check that the `Test` database exists:
```sql
SHOW DATABASES;
```
Now, if we stop the container and start it again, you can verify that the database has remained intact. But, what happens if we remove the container?
```
docker rm -f mysql-server
```
Then you can check that if you create a mysql container again, all data we have added has been lost (the `Test` database and the `admin` user). This is the case where using volumes is required. Volumes are a kind of storage which can be shared among containers. When we attach a volume to a container, after removing the container, the volume remains intact. So we can start another container  and attach the volume to it again.
> The concept of volumes, makes a separation of application and data. With this separation you can have stateless application. With stateless applications we can achieve simpler scaling, deployment, updating, etc.

Let's see how we can use a volume for storing the actual data of our database.
The most basic type of volume is `bind-mount`. By using `bind-mount` we are making a volume from a file or directory on the host machine. We can then attach this volume to containers on a specific path. In other words, we are binding these two directories or files with each other.

Most images, like mysql, store their data in a specific directory or file. The mysql image stores its data in the `/var/lib/mysql` directory. So we try to mount a directory on the host machine into the `/var/lib/mysql` path of the container.

Let's start by creating a directory with an arbitrary name on the host:
```
mkdir mysql_data
```
Next, when we want to create a mysql container, we create a volume using `mysql_data` directory and mount it on the `/var/lib/mysql/` path of the container:
```
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=1234 -v $(pwd)/mysql_data:/var/lib/mysql -d  mysql
```
In the above command, we have used `-v` option to bind `mysql_data` on the host into `/var/lib/mysql` on the container.
> Note that when using `bind-mount` volumes with docker run, it is required to use absolute paths for both source and destination. 

Now, let's exec into the container and executing previous commands again:
```
docker exec -it mysql-container bash
```

```
mysql -uroot -p1234
```
```sql
CREATE DATABASE Test;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'pass';
GRANT ALL PRIVILEGES ON * . * TO 'admin'@'localhost';
```
Okay, let's remove the container again!
```
docker rm -f mysql-container
```
You can see that the `mysql-data` directory and its content has remained intact. 

To verify this, create a new mysql container with this volume:
```
docker run --name mysql-container -v $(pwd)/mysql-data:/var/lib/mysql -d mysql
```
> We didn't specified the `MYSQL_ROOT_PASSWORD` variable in the above command. This value is used during the database initialization and since we already have the data, the root user is already created and initialization won't take place again. 
Even if we specify this environment variable, it won't be used.


Now, you can exec into the container:
```
docker exec -it mysql-container bash
```
And then you can verify that the admin user and Test database is exists:
```
mysql -uadmin -ppass
```
```sql
SHOW DATABASES
```

## 2. Share the data with volumes
Alongside data persistence, volumes can be used to share data among containers and also the host machine.

This time we create an nginx container again, but instead of putting our html inside the image, we use volumes to share the html files with the nginx container:
```
docker run -d --name nginx-container -p 8080:80 -v $(pwd)/nginx-data:/usr/share/nginx/html/ nginx
```
> Be sure that you have removed the existing nginx container which its name is `nginx-container` before executing the above command. Otherwise command fails with a conflict error.

If you access the `localhost:8080`, you can see the `index.html` page content as we did in previous step. 
```
curl localhost:8080
```
The key point of using volumes here is that both host and container are using the files reside in `nginx_data`. So let's edit the `index.html` file and se what happens:
```html
<html>
<body>
    <h1>
        Hello! I have updated this message!
    </h1>
</body>
</html>
```
And then you can see the new message:
```
curl localhost:8080
```



