# Plex Wrapped
## Introduction
A website and API for collecting Plex user stats within a set timeframe using [Tautulli](https://github.com/Tautulli/Tautulli). Yes, you need Tautulli to have been running beforehand and currently for this to work.
## Instructions
There are multiple settings you must configure! They will be stored in config/config.json, but can be configured easily at <b>you-domain-or-ip.com/admin</b>.


PHP will have issues with this API based on the results you want. If you have a large time frame for your wrapped period and there is a huge amount of Tautulli entries you can have multiple issues.
In your php.ini file you may have to change:
- max_execution_time=<b>enough seconds for the script to finish</b>
- memory_limit=<b>enough M for the script to handle JSON data</b>
- max_input_time=<b>enough seconds for the script to parse JSON data</b>

The cache is stored at config/cache.json, but can be cleared using the admin menu.

If you visit <b>you-domain-or-ip.com/caching</b> you can do a pre-caching of a set of users. This is very useful if you want to prepare for a lot of traffic.

## Need help?
If you have any issues feel free to contact me. I am always trying to improve the project. If I can't, many people on several forums (including /r/plex) might be able to assist you.

<b>Goodybye.</b>