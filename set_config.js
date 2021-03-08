function set_config() {

    var clear_cache = document.getElementById('clear_cache').checked;

    config_form = {
                        "password" : current_password,
                        "clear_cache" : clear_cache,
                        "data" : {
                            "tautulli_apikey" : tautulli_apikey,
                            "tautulli_ip" : tautulli_ip,
                            "tautulli_port" : tautulli_port,
                            "tautulli_length" : tautulli_length,
                            "tautulli_root" : tautulli_root,
                            "ssl" : ssl,
                            "password" : password,
                            "library_id_movies" : library_id_movies,
                            "library_id_shows" : library_id_shows,
                            "wrapped_start" : Math.round(wrapped_start.getTime() / 1000),
                            "wrapped_end" : Math.round(wrapped_end.getTime() / 1000),
                            "get_user_movie_stats" : get_user_movie_stats,
                            "get_user_show_stats" : get_user_show_stats,
                            "get_user_show_buddy" : get_user_show_buddy,
                            "get_year_stats" : get_year_stats,
                            "use_cache" : use_cache,
                            "cache_age_limit" : cache_age_limit
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
                window.location.href = "./";
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/set_config.php");
    xhttp.send(config_data);
}