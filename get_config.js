function get_config_initial() {

    config_form = {
                        "password" : ""
                   };

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.password) {
                login_menu();
            } else {
                first_time = true;

                set_password();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_config.php");
    xhttp.send(config_data);
}

function get_config() {

    current_password = document.getElementById('password').value;

    config_form = {
                        "password" : current_password
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

                ssl = result.data.ssl;

                password = "";

                library_id_movies = result.data.library_id_movies;
                library_id_shows = result.data.library_id_shows;

                wrapped_start = new Date(0);
                wrapped_start.setUTCSeconds(result.data.wrapped_start);

                wrapped_end = new Date(0);
                wrapped_end.setUTCSeconds(result.data.wrapped_end);

                get_user_movie_stats = result.data.get_user_movie_stats;
                get_user_show_stats = result.data.get_user_show_stats;
                get_user_show_buddy = result.data.get_user_show_buddy;
                get_year_stats = result.data.get_year_stats;

                use_cache = result.data.use_cache;
                cache_age_limit = result.data.cache_age_limit;

                set_tautulli(true);
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_config.php");
    xhttp.send(config_data);
}