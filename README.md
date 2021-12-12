# Plex Wrapped
## Introduction - What is this?

A website-based platform and API for collecting Plex user stats within a set timeframe using [Tautulli](https://github.com/Tautulli/Tautulli). The data is displayed as a statistics-summary, sort of like Spotify Wrapped. Yes, you need Tautulli to have been running beforehand and currently for this to work.

<br>
<br>

![alt text](https://raw.githubusercontent.com/aunefyren/Plex-Wrapped/main/assets/img/example_01.PNG?raw=true)

<br>
<br>

### Features
- Custom timeframes
- Plex Auth
- Custom introduction
- Movies, shows & music
- Caching of results
- Friendly, dynamic display for statistics with nice illustrations
- Email and username search
- Admin page with authentication for settings
- Pre-caching of data

<br>
<br>

![alt text](https://raw.githubusercontent.com/aunefyren/Plex-Wrapped/main/assets/img/example_02.PNG?raw=true)

<br>
<br>

### Credit
- Beautiful illustrations from [FreeWebIllustrations](https://freewebillustrations.com)
- Amazing statistics gathered using [Tautulli](https://github.com/Tautulli/Tautulli)
- Wonderful loading icon from [icons8](https://icons8.com/preloaders/en/miscellaneous/hourglass)
- Splendid web icons from [icons8](https://icons8.com/icon/set/popular/material-rounded)

<br>
<br>

![alt text](https://raw.githubusercontent.com/aunefyren/Plex-Wrapped/main/assets/img/example_03.PNG?raw=true)

<br>
<br>

## Instructions - How do I use this?
This is a web-based platform. It is a website hosted on a web-server and it gathers and displays statitics using an API (application programming interface) that interacts with Tautulli's API. Place the files included in this GitHub repository in a web-server, like Apache or Nginx, and make sure it processes PHP scripts, as this is the language the Wrapped API is written in. 

There are instructions for this further down.
<br>
<br>
### How does it work?
There are things to know when you are up and running: 
- Head to the front page you should see a small navigation menu at the bottom. This will take you between the few pages you need.
- The configuration is stored in config/config.json, but can be configured using the admin menu, located at: ```your-domain-or-ip/admin``` or by clicking admin in the navigation menu.
- The cache is stored in config/cache.json, but can be cleared using the admin menu previously mentioned.
- Your password and encryption token is hashed and stored in the config/config.json. This is a sensetive directory! There is an ```.htaccess``` file included that blocks traffic to the folder, but this is only effective with Apache, but if you are using Nginx you must add a directory deny in your Nginx configuration!
- If you visit ```your-domain-or-ip/caching```, or click caching in the navigation menu, you can do a pre-caching. This is very useful if you want to prepare for traffic and reduce PHP errors. PHP scripts will exit if they run longer then a certain timeframe, giving the user an error.
- It is recommended to set up the platform at the admin page and then running a pre-cache immediately. The cache is updated automatically if new data in the timeframe becomes available.

<br>
<br>

## Manual setup - Example of setting up a local web-server
Here is an example of running this platform. This is a general approach, as there are multiple ways to host a webserver with PHP installed.

### XAMPP
XAMPP is a completely free, easy to install Apache distribution containing MariaDB, PHP, and Perl. The XAMPP open source package has been set up to be incredibly easy to install and to use. This is their [website](https://www.apachefriends.org/). It works on Windows, Linux and MacOs.

Install XAMPP thorugh the installer and open up the GUI. From there you can start the Apache webserver with a single button. We don't need any of the other tools included, but make sure the status of the module is green. PHP should be pre-configured by XAMPP.

### Install Plex-Wrapped
Download this repository and place the files inside the document-root of XAMPPs apache server. This is typically ```C:\xampp\htdocs``` on Windows, but this will change depending on your system and configuration of XAMPP during installation. 

For instance, I placed this repository in a folder inside the document-root, so my location of XAMPP, with that folder, makes the location: ```C:\xampp\htdocs\plex-wrapped```, which in turn makes the files accessable on ```http://localhost/plex-wrapped```. Notice how my folder inside the document-root altered the URL. If I placed the files directly into ```C:\xampp\htdocs``` the URL would be: ```http://localhost```.

### Config folder configuration
You need to give PHP permission to read and write to files in the directory called ```config```. This is where the API saves the cache, configuration and writes the log. 

The directory contains sensitive information that must be only accessed by the PHP scripts! There is an ```.htaccess``` file included that blocks traffic to the folder, but this is only effective with Apache (which XAMPP uses). If you are using Nginx you must add a directory deny in your Nginx configuration!

In Windows I never had to change permissions for the folder, PHP could access it by defult. In Linux I had give read/write access by using the ```chmod``` command. In the example below I change the config directory folder permissions recursively on Linux. This will allow PHP to read/write in the directory.

```
$ sudo chmod -R 0777 /var/www/html/config
```

### Test
Go to ```http://localhost```, or your variation as discussed earlier, and you should see the front page.

Everything should now be prepared, and the rest of the setup should be done on the admin page, followed up by a pre-caching on the caching page. You might have to refer to PHP configuration section below if PHP is acting up. 

<br>
<br>

## Docker
Docker sets up the environment, but I recommend reading the start of the 'Instructions' section for an explanation of functionality! You might have to refer to the 'PHP Configuration' section below if PHP is acting up.

Docker makes it easy, but you might want to change the setup. The pre-configured Dockerfile is in the docker folder of this repo. It's a really simple configuration, so modify it if you want and then build it. If you just want to launch the [pre-built image](https://hub.docker.com/r/aunefyren/plex-wrapped) of Plex-Wrapped, simply execute this docker command, pulling the image from Docker Hub and exposing it on port 80:

```
$ docker run -p '80:80' --name 'plex-wrapped' aunefyren/plex-wrapped:latest
```

It should now be accessable on: ```http://localhost```

If you use Docker Compose you could do something like this in your docker-compose.yml:

```
version: '3.3'
services:
    plex-wrapped:
        ports:
            - '80:80'
        container_name: plex-wrapped
        image: 'aunefyren/plex-wrapped'
```

And launch the file with:


```
$ docker-compose up
```

If you want to mount a volume for the config folder, you can do something like this:

```
version: '3.3'
services:
    plex-wrapped:
        ports:
            - '80:80'
        container_name: plex-wrapped
        image: 'aunefyren/plex-wrapped'
        volumes:
            - './my-folder:/var/www/html/config'
```

Afterwards, remember to chmod the mounted folder on the host so the container can write to it:


```
$ sudo chmod -R 0777 ./my-folder
```

<br>
<br>

## PHP Configuration
PHP will have issues with this API based on the data available in Tautulli and your settings on the admin page. If you have a large time frame for your wrapped period (like a full year), and there are a huge amount of Tautulli entries, you can have multiple issues. The PHP API can, for example, exit because the runtime exceeds the PHP configured runtime, because it takes a long time to interact with your Tautulli server. 

<b>Pre-caching deals with a lot of these problems, so make sure you have it enabled and done to avoid these issues. Go to the caching page found in the navigation meny at the bottom.</b>

If you performed pre-caching and you still have issues, check the list below for possible alterations to PHP. These are changes to the ```php.ini``` file found in the PHP installation directory. Do some research or ask for help if you don't know how to do this.

In your ```php.ini``` file you may have to change:
- max_execution_time=<b>enough seconds for the script to finish.</b><br>The longer the timeframe, the more execution time. Every unique date in your timeframe is a new Tautulli API call.
- memory_limit=<b>enough M for the script to handle JSON data.</b><br>If there is a lot of data, PHP needs to have enough memory to manage it without crashing. This still applies if caching is on, as PHP needs to be able to read the cache without crashing.
- max_input_time=<b>enough seconds for the script to parse JSON data.</b><br>You might not need to change this, depending on Tautulli connection speed.

<br>
<br>

## Need help?
If you have any issues feel free to contact me. I am always trying to improve the project. If I can't, many people on several forums (including [/r/plex](https://www.reddit.com/r/plex)) might be able to assist you.

Have fun.
