function set_config() {

    var clear_cache = document.getElementById('clear_cache').checked;
    
    config_form = {
                        "password" : current_password,
                        "username" : current_username,
                        "clear_cache" : clear_cache,
                        "data" : {
                            "tautulli_apikey" : tautulli_apikey,
                            "tautulli_ip" : tautulli_ip,
                            "tautulli_port" : tautulli_port,
                            "tautulli_length" : tautulli_length,
                            "tautulli_root" : tautulli_root,
                            "tautulli_libraries" : tautulli_libraries,
                            "ssl" : ssl,
                            "password" : password,
                            "username" : username,
                            "timezone" : timezone,
                            "wrapped_start" : Math.round(wrapped_start.getTime() / 1000),
                            "wrapped_end" : Math.round(wrapped_end.getTime() / 1000),
                            "stats_intro" : stats_intro,
                            "create_share_links" : create_share_links,
                            "get_user_movie_stats" : get_user_movie_stats,
                            "get_user_show_stats" : get_user_show_stats,
                            "get_user_show_buddy" : get_user_show_buddy,
                            "get_user_music_stats" : get_user_music_stats,
                            "get_year_stats_movies" : get_year_stats_movies,
                            "get_year_stats_shows" : get_year_stats_shows,
                            "get_year_stats_music" : get_year_stats_music,
                            "get_year_stats_leaderboard" : get_year_stats_leaderboard,
                            "use_cache" : use_cache,
							"use_logs" : use_logs,
                            "client_id" : client_id,
                            "plex_wrapped_root" : plex_wrapped_root
                        }
                   };

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.error) {
                alert(result.message);
            } else {
                alert(result.message);
                window.location.href = "../";
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", root + "api/set_config.php");
    xhttp.send(config_data);
}