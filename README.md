# Wrapperr
[![Github Stars](https://img.shields.io/github/stars/aunefyren/wrapperr?style=for-the-badge)](https://github.com/aunefyren/wrapperr)
[![Github Forks](https://img.shields.io/github/forks/aunefyren/wrapperr?style=for-the-badge)](https://github.com/aunefyren/wrapperr)
[![Docker Pulls](https://img.shields.io/docker/pulls/aunefyren/wrapperr?style=for-the-badge)](https://hub.docker.com/r/aunefyren/wrapperr)
[![Newest Release](https://img.shields.io/github/v/release/aunefyren/wrapperr?style=for-the-badge)](https://github.com/aunefyren/wrapperr/releases)
[![Go Version](https://img.shields.io/github/go-mod/go-version/aunefyren/wrapperr?style=for-the-badge)](https://go.dev/dl/)

## Introduction - What is this?

A website-based application and API for collecting user stats within a set timeframe using [Tautulli](https://github.com/Tautulli/Tautulli). The data is displayed as a statistics summary, sort of like Spotify Wrapped. Yes, you need Tautulli to have been running beforehand and currently for this to work.

<br>

![Image showing the introduction section of Wrapperr.](https://raw.githubusercontent.com/aunefyren/wrapperr/main/web/assets/img/example_01.PNG?raw=true)

<br>

### Features
- Custom timeframes
- Plex Auth
- Friendly, dynamic display for statistics with nice illustrations
- Customizable text
- Customizable appearance
- Movies, shows & music statistics
- Caching of results
- Admin interface
- Pre-caching functionality
- Shareable links with expiration

<br>

![Image showing the show section of Wrapperr.](https://raw.githubusercontent.com/aunefyren/wrapperr/main/web/assets/img/example_02.PNG?raw=true)

<br>

### Credit
- Beautiful illustrations from [FreeWebIllustrations](https://freewebillustrations.com)
- Amazing statistics gathered using [Tautulli](https://github.com/Tautulli/Tautulli)
- Wonderful loading icon from [icons8](https://icons8.com/preloaders/en/miscellaneous/hourglass)
- Splendid web icons from [icons8](https://icons8.com/icon/set/popular/material-rounded)
- Superb background image from [Pexels](https://www.pexels.com/photo/snowy-forest-235621/)

<br>

![Image showing the server-wide section of Wrapperr.](https://raw.githubusercontent.com/aunefyren/wrapperr/main/web/assets/img/example_03.PNG?raw=true)

<br>

## Explanation - How does it work?
This is a web-based platform. It gathers and displays statistics using an API (application programming interface) that interacts with the Tautulli API. Install Wrapperr, configure the essential options, and Wrapperr will do the rest. Based on your exact configuration, Wrapperr will gather unique statistics for each user interacting with the application.

In Wrapperr you configure a timeframe, from date-time A to date-time B. This is the timeframe from which the statistics are created. One could for instance have a wrap-up of multiple years of Tautulli data or just a week. If enabled, Wrapperr will verify the user with Plex to ensure personal data is kept private.

Most text is customizable through the Wrapperr admin interface which allows for regional translation. Certain statistics can be disabled and enabled based on relevance/interest. Users can if enabled, generate random URLs which can be shared between friends who want to see each other's statistics.

<br>
<br>

## Instructions - How do I install this?
There are two main ways. Docker information can be found further below.

<br>
<br>

### Download and start
There are multiple ways to install Wrapperr. The easiest is just to download the latest release from the [Release Page](https://github.com/aunefyren/wrapperr/releases) which matches your operating system, move all the content to a directory, and start the ```Wrapperr``` application located within the release. It should start right up, perhaps triggering some operating system or firewall warnings.

<br>
<br>

### Build with Go
If you want to build Wrapperr yourself, you can download whatever version/tag/branch you want, and place the files in a directory. With [Go](https://go.dev/dl/) installed, from the Wrapperr directory, run the following commands to build and execute Wrapperr:

```
$ go build
$ ./Wrapperr
```
Note, if building on another operating system, the executable could have a different name. Such as ```Wrapperr.exe``` on Windows.

<br>
<br>

### Head to the website
If successful, Wrapperr should be accessible on ```http://localhost:8282```. From there you can click on ```admin``` in the footer at the bottom, or go to ```/admin``` in the URL. From there you can configure everything about Wrapperr in the different sections of the menu. 

<br>
<br>

### Essential configuration options
A couple of configuration options are necessary for Wrapperr to function. First of all, Tautulli connection details. There is a test button available on the page to ensure you have entered the correct details. The second one is the time zone option on the ```Wrapperr Settings``` page.

It is recommended to keep ```Cache results for later use``` enabled on the ```Wrapperr Settings``` page, and head to the ```Caching``` page after configuration. This ensures a good, quick user experience. 

<br>
<br>

### Wrap away!
Wrapperr should now be functional. Based on your settings, you can now either search with username/e-mail or log in with Plex on the front page. Continue tweaking on the admin menu to get the appearance/language you desire.

<br>
<br>

## Docker
Docker sets up the environment, but I recommend reading the start of the 'How do I install this?' section for an explanation of the functionality/admin page! 

Docker makes it easy, but you might want to change the setup. The pre-configured Dockerfile is in the docker folder of this repo. It's a really simple configuration, so modify it as preferred and then build it. If you just want to launch the [pre-built image](https://hub.docker.com/r/aunefyren/wrapperr) of Wrapperr, simply execute this docker command, pulling the image from Docker Hub and exposing it on port ```8282```:

```
$ docker run -p '8282:8282' --name 'wrapperr' aunefyren/wrapperr:latest
```

It should now be accessible on: ```http://localhost:8282```

<br>
<br>

If you use Docker Compose you could do something like this in your ```docker-compose.yml```:

```
version: '3.3'
services:
    wrapperr:
        ports:
            - '8282:8282'
        container_name: wrapperr
        image: aunefyren/wrapperr:latest
        restart: unless-stopped
```

And launch the file with:

```
$ docker-compose up
```

<br>
<br>

If you want to mount a volume for the config folder, you can do something like this:

```
version: '3.3'
services:
    wrapperr:
        ports:
            - '8282:8282'
        container_name: wrapperr
        image: aunefyren/wrapperr:latest
        restart: unless-stopped
        volumes:
            - './my-folder:/app/config'
```

<br>
<br>

Afterward, remember to ```chmod``` the mounted folder on the host so the Wrapperr can write to it:


```
$ sudo chmod -R 0777 ./my-folder
```

<br>
<br>

## Frequently asked questions

### Q: Why are the plays different on Wrapperr compared to Tautulli

A: Data is retrieved from the Tautulli API, but not necessarily processed in the same manner. The difference could for example be that you have history entries for the same media (a movie for example) split over different Tautulli items. For example, you could have two items for the movie 'Black Widow' from updating the file on Plex, leading Tautulli to interpret it as a new item/media. The easiest way to check for this is by going to the 'History' tab and searching for the title. This might display more entries than clicking into the movie item, which displays all history items for that particular item. 

There is an option to merge different Tautulli items if this is your case.

What also could confuse is related to the Tautulli grouping feature. When you have grouping enabled, different plays are grouped on an API call basis. Meaning that when you display all history items for a movie on Tautulli, six different plays spanning three days might be placed into one group. Wrapperr calls the Tautulli API on 'day' based loop, meaning Tautulli's grouping never spans multiple days, potentially leading to an increase in plays because the groups are smaller in size.

<br>
<br>

## Need help?
If you have any issues feel free to open an issue here on GitHub. I am always trying to improve the project. If I can't, many people on several forums (including [/r/plex](https://www.reddit.com/r/plex)) might be able to assist you.

Have fun.
