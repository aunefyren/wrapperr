# Wrapperr
[![Github Stars](https://img.shields.io/github/stars/aunefyren/wrapperr?style=for-the-badge)](https://github.com/aunefyren/wrapperr)
[![Github Forks](https://img.shields.io/github/forks/aunefyren/wrapperr?style=for-the-badge)](https://github.com/aunefyren/wrapperr)
[![Docker Hub Pulls](https://img.shields.io/docker/pulls/aunefyren/wrapperr?style=for-the-badge)](https://hub.docker.com/r/aunefyren/wrapperr)
[![Newest Release](https://img.shields.io/github/v/release/aunefyren/wrapperr?style=for-the-badge)](https://github.com/aunefyren/wrapperr/releases)
[![Go Version](https://img.shields.io/github/go-mod/go-version/aunefyren/wrapperr?style=for-the-badge)](https://go.dev/dl/)
[![Wiki hyperlink](https://img.shields.io/badge/Go_To-Wiki-page?style=for-the-badge&labelColor=%23555555&color=%23007ec6)](https://github.com/aunefyren/wrapperr/wiki)

<br>
<br>

[![Donate](https://img.shields.io/badge/PayPal-Buy%20me%20coffee-blue?style=for-the-badge)](https://www.paypal.com/donate/?hosted_button_id=YRKMNM4S8VNBS) 

Like the project? Have too much money? Buy me a coffee or something! ☕️

<br>
<br>

## Introduction - What is this?

Many platforms have periodic recaps of user data and statistics, which can be fun and interesting to look at. Typically these statistics are released on a website in December, like Spotify Wrapped.

Wrapperr is a website-based application for pulling Plex user statistics within a set timeframe (sourced from [Tautulli](https://github.com/Tautulli/Tautulli)). The statistics are gathered and processed into a statistics summary. Then the website displays this in a fun, interactive format. Yes, you need Tautulli to have been running beforehand and currently for this to work. That is where the data is stored, Wrapperr just processes and displays it.

<br>

![Image showing the introduction section of Wrapperr.](https://raw.githubusercontent.com/aunefyren/wrapperr/main/web/assets/img/example_01.PNG?raw=true)

<br>

### Features
- Custom timeframes for statistics
- Plex Auth for login
- Supports multiple Tautulli servers
- Friendly, dynamic presentation of statistics with nice illustrations
- Customizable text options
- Customizable appearance/results
- Statistics for movies, shows & music
- Caching of Tautulli results
- Admin interface for configuration (with regular and HTTP Basic login)
- Pre-caching of results before user interaction
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
This is a web-based platform. It gathers and displays statistics gathered from the Tautulli API (application programming interface). Install Wrapperr, configure the essential options, and Wrapperr will do the rest. Based on your exact configuration, Wrapperr will gather unique statistics for each user interacting with the application and display it in a nice format.

Within Wrapperr you configure a timeframe, from date-time `A` to date-time `B`. This is the timeframe from which the statistics are created. One could for instance have a wrap-up of multiple years of Tautulli data or just a week. If enabled, Wrapperr will also verify the user with their Plex login to ensure personal data is kept private.

Most text is customizable through the Wrapperr admin interface which allows for regional translation. Certain statistics can be disabled and enabled based on relevance/interest. Users can, if enabled, generate random URLs that can be shared between friends who want to see each other's statistics.

<br>
<br>

## Instructions - How do I install this?
There are two main ways. Docker information is in the wiki.

<br>
<br>

### Download and start
There are multiple ways to install Wrapperr. The easiest is just to download the latest release from the [Release Page](https://github.com/aunefyren/wrapperr/releases) which matches your operating system, move all the content to a directory, and start the ```wrapperr``` application located within the release. It should start right up, perhaps triggering some operating system or firewall warnings.

<br>
<br>

### Build with Go
If you want to build Wrapperr yourself instead of downloading a release, you can download whatever version/tag/branch/release of the source code you want, and place the files in a directory. With [Go](https://go.dev/dl/) installed, from the Wrapperr directory, run the following commands to build and execute Wrapperr:

```
$ go build
$ ./wrapperr
```
Note, if building on another operating system, the executable could have a different name. Such as ```wrapperr.exe``` on Windows.

<br>
<br>

### Head to the website
If Wrapperr is successfully started, it should be accessible on ```http://localhost:8282```. From there you can click on ```admin``` in the footer at the bottom, or go to ```/admin``` in the URL. From there you can configure everything about Wrapperr in the different sections of the menu. 

<br>
<br>

### Essential configuration options
A couple of configuration options are necessary on the admin page for Wrapperr to function. First of all, Tautulli connection details. There is a test button available on the page to ensure you have entered the correct details. The second one is the time zone option on the ```Wrapperr Settings``` page.

It is recommended to keep ```Cache results for later use``` enabled on the ```Wrapperr Settings``` page, and head to the ```Caching``` page after configuration. Click the ```Cache``` button and wait for the caching to finish. This ensures a good, quick user experience. 

<br>
<br>

### Wrap away!
Wrapperr should now be functional. Based on your settings, you can now either search with username/e-mail or log in with Plex on the front page. Continue tweaking on the admin menu to get the appearance/language you desire.

<br>
<br>

## More documentation

Docker, TLS, setup information and more can be found in the documentation at the Wiki!

[![Wiki hyperlink](https://img.shields.io/badge/Go_To-Wiki-page?style=for-the-badge&labelColor=%23555555&color=%23007ec6)](https://github.com/aunefyren/wrapperr/wiki)

<br>
<br>

## Need help?
If you have any issues feel free to open an issue here on GitHub. I am always trying to improve the project. If I can't, many people on several forums (including [/r/plex](https://www.reddit.com/r/plex)) might be able to assist you.

Have fun.
