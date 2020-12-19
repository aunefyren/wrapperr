# Plex Wrapped 2020
A website for collecting Plex user stats from 2020 using Tautulli.

## Warning!
I made this for fun, in a very limited timeframe. This was not intended to be a public tool. It might not work with your system, the code is not perfect. My main concern is if your Tautulli is configured differently. I made this using my system, and tested it with my system. <b>Use this code as inspiration</b>.

## Instructions
There are multiple settings you must configure!

<b>config.json</b><br>
This file needs multiple values. Most importantly your Tautulli IP, port and API key. I made this using HTTP, if you use HTTPS you have to modify the API.

<b>api/get_stats_2020.php</b><br>
This file needs to know the ID of your movie and show library. It only supports two libraries. The ID can be found in your url when you open the library on the Tautulli website.

If you are lucky, it could be functional now.
<br><br><br>
If you want to change something:
* The website is built in "get_stats_2020.js"
* All values and processing is done in "/api/get_stats_2020.php"
* The CSS is a mess, and located in "/assets/css/main.css"


## Need help?
If you contact me I might have time to help you. Or maybe not. If not, many people on several forums (including /r/plex) might be able to assist you.

This idea was quite popular, so I might create a better, public solution in the future.

<b>Goodybye.</b>
