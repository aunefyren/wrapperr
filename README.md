# Plex Wrapped
## Introduction

A website-based platform and API for collecting Plex user stats within a set timeframe using [Tautulli](https://github.com/Tautulli/Tautulli). The data is displayed as a stat-summary, sort of like Spotify Wrapped. Yes, you need Tautulli to have been running beforehand and currently for this to work.

![alt text](https://raw.githubusercontent.com/aunefyren/Plex-Wrapped/main/assets/img/example_01.PNG?raw=true)

### Features
- Custom timeframes
- Movies, shows & music
- Caching of results
- Friendly, dynamic display for statistics with nice illustrations
- Email and username search
- Admin page with authentication for settings
- Pre-caching of user-sets

![alt text](https://raw.githubusercontent.com/aunefyren/Plex-Wrapped/main/assets/img/example_02.PNG?raw=true)

### Credit
- Beautiful illustrations downloaded from [FreeWebIllustrations](https://freewebillustrations.com)
- Amazing statistics gathered using [Tautulli](https://github.com/Tautulli/Tautulli)
- Wonderful loading icon from [icons8](https://icons8.com/preloaders/en/miscellaneous/hourglass)

![alt text](https://raw.githubusercontent.com/aunefyren/Plex-Wrapped/main/assets/img/example_03.PNG?raw=true)

## Instructions
This is a web-based platform. Place it in a webserver like Apache or Nginx and make sure it processes PHP content.

There are multiple settings you must configure! They will be stored in config/config.json, but can be configured easily at <b>your-domain-or-ip/admin.html</b>.

PHP will have issues with this API based on the results you want. If you have a large time frame for your wrapped period and there are a huge amount of Tautulli entries you can have multiple issues.
In your php.ini file you may have to change:
- max_execution_time=<b>enough seconds for the script to finish</b>
- memory_limit=<b>enough M for the script to handle JSON data</b>
- max_input_time=<b>enough seconds for the script to parse JSON data</b>

You need to give PHP permission to read and write to files in the directory called <b>config</b>.

The config directory contains sensitive information that must be accessed by PHP scripts! There is an .htaccess file included that is effective with Apache, but if you are using Nginx you must add a directory deny in your Nginx configuration!

The cache is stored in config/cache.json, but can be cleared using the admin menu.

Your password is hashed and stored in the config/config.json.

If you visit <b>your-domain-or-ip/caching.html</b> you can do a pre-caching of a set of users. This is very useful if you want to prepare for a lot of traffic.

## Need help?
If you have any issues feel free to contact me. I am always trying to improve the project. If I can't, many people on several forums (including [/r/plex](https://www.reddit.com/r/plex)) might be able to assist you.

<b>Goodybye.</b>
