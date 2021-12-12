function get_config_initial() {

    config_form = {
                        "password" : "",
                        "username" : "",
                   };

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.error) { 
                if(!result.password) {
                    first_time = true;

                    set_password();
                } else {
                    login_menu();
                }
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", root + "api/get_config.php");
    xhttp.send(config_data);
}

function get_config() {

    current_password = document.getElementById('password').value;
    current_username = document.getElementById('username').value;

    config_form = {
                        "password" : current_password,
                        "username" : current_username,
                   };

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
			
            if(result.error) {
                alert(result.message);
                document.getElementById('password').value = '';
            } else {
                tautulli_apikey = result.data.tautulli_apikey;
                tautulli_ip = result.data.tautulli_ip;
                tautulli_port = result.data.tautulli_port;
                tautulli_length = result.data.tautulli_length;
                tautulli_root = result.data.tautulli_root;
                tautulli_libraries = result.data.tautulli_libraries;

                ssl = result.data.ssl;

                username = result.data.username;
                password = "";

                timezone = result.data.timezone;

                wrapped_start = new Date(0);
                wrapped_start.setUTCSeconds(result.data.wrapped_start);

                wrapped_end = new Date(0);
                wrapped_end.setUTCSeconds(result.data.wrapped_end);

                stats_intro = result.data.stats_intro;
                create_share_links = result.data.create_share_links;
                get_user_movie_stats = result.data.get_user_movie_stats;
                get_user_show_stats = result.data.get_user_show_stats;
                get_user_show_buddy = result.data.get_user_show_buddy;
                get_user_music_stats = result.data.get_user_music_stats;

                get_year_stats_movies = result.data.get_year_stats_movies;
                get_year_stats_shows = result.data.get_year_stats_shows;
                get_year_stats_music = result.data.get_year_stats_music;
                get_year_stats_leaderboard = result.data.get_year_stats_leaderboard;

                use_cache = result.data.use_cache;
				use_logs = result.data.use_logs;

                clientID = result.data.clientID;
                plex_wrapped_root = result.data.plex_wrapped_root;

                set_tautulli(true);
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", root + "api/get_config.php");
    xhttp.send(config_data);
}