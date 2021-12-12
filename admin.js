function time_days(seconds_input) {
    var seconds = Number(seconds_input);
    var days = seconds * 1.15741E-5;

    var hours = String(days).split(".");
    var hours_str = "0." + hours[1];
    var hours_int = Number(hours_str) * 24.0;

    var minutes = String(hours_int).split(".");
    var minutes_str = "0." + minutes[1];
    var minutes_int = Number(minutes_str) * 60.0;

    var days_form = String(days).split(".");
    var hours_form = String(hours_int).split(".");
    var minutes_form = String(minutes_int).split(".");

    var final = [Number(days_form[0]), Number(hours_form[0]), Number(minutes_form[0])];
    return final;
}

function time_hours(seconds_input) {
    var seconds = Number(seconds_input);
    var hours_int = Number(seconds) * 0.0002777778;

    var minutes = String(hours_int).split(".");
    var minutes_str = "0." + minutes[1];
    var minutes_int = Number(minutes_str) * 60.0;

    var hours_form = String(hours_int).split(".");
    var minutes_form = String(minutes_int).split(".");

    var final = [Number(hours_form[0]), Number(minutes_form[0])];
    return final;
}

function makeRequest (method, url, data) {
    return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    if(method=="POST" && data){
        xhr.send(data);
    }else{
        xhr.send();
    }
    });
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function login_menu() {
    topFunction();
    var html = '<form id="password_login_form" onsubmit="get_config();return false">'

    html += '<div class="form-group">';
    html += '<label for="username" title="The username chosen during first-time setup.">Username:</label>';
    html += '<input type="text" class="form-control" id="username" value="" placeholder="" minlength=4 autocomplete="on" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="password" title="The password chosen during first-time setup.">Password:</label>';
    html += '<input type="password" class="form-control" id="password" value="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<input type="submit" class="form-control btn" id="password_button" value="Log in" required />';
    html += '</div>';

    html += '</form>';
    document.getElementById("setup").innerHTML = html;
}

function set_password(back) {
    topFunction();
    var html = '<form id="password_form" onsubmit="set_tautulli(false);return false">'

    html += '<div class="form-group">';
    html += '<label for="username" title="The username needed to log in as administrator and change the config-file remotely.">Set an admin username:</label>';
    html += '<input type="text" class="form-control" id="username" value="' + username + '" placeholder="" minlength=4 autocomplete="on" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="password" title="The password needed to change the config-file remotely.">Set an admin password:</label>';
    html += '<input type="password" class="form-control" id="password" value="' + password + '" placeholder="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="password_2" title="The password needed to change the config-file remotely.">Repeat the password:</label>';
    html += '<input type="password" class="form-control" id="password_2" value="' + password + '" placeholder="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<input type="submit" class="form-control btn" id="password_button" value="Save" required />';
    html += '</div>';

    html += '</form>';
    document.getElementById("setup").innerHTML = html;
}

function set_tautulli(back) {

    topFunction();
    if(!back) {
        if(document.getElementById('password').value != document.getElementById('password_2').value) {
            alert("The passwords must match.");
            document.getElementById('password').value = "";
            document.getElementById('password_2').value = "";
            document.getElementById('password').focus();
            return false;
        } else {
            password = document.getElementById('password').value;
            username = document.getElementById('username').value;
       }
    }

    var html = '<div class="form-group">';
    html += '<button class="form-control btn" onclick="set_password(true)"><img src="../assets/config.svg" class="btn_logo"><p2>Change admin password</p2></button>';
    html += '</div>';

    html += '<hr>';

    html += '<form id="tautulli_form" onsubmit="set_tautulli_details(false);return false">'

    html += '<div class="form-group">';
    html += '<label for="tautulli_apikey" title="The API key is needed for Plex-Wrapped to interact with Tautulli. Commonly found at Tautulli->Settings->Web Interface->API Key.">Tautulli API key:</label>';
    html += '<input type="text" class="form-control" id="tautulli_apikey" value="' + tautulli_apikey + '" autocomplete="off" required placeholder="" /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="tautulli_ip" title="The IP address or domain that connects to Tautulli. No subfolders, as this is another setting, but subdomains can be defined.">IP or domain for Tautulli connection:</label>';
    html += '<input type="text" class="form-control" id="tautulli_ip" value="' + tautulli_ip + '" required placeholder="" /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="tautulli_port" title="The port Tautulli uses for connections. Typically empty if a domain is used.">Port for Tautulli: (Optional)</label>';
    html += '<input type="text" class="form-control" id="tautulli_port" value="' + tautulli_port + '" placeholder="" /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="tautulli_length" title="The max amount of entries Tautulli responds with during API calls. Typically doesn\'t need to be changed, but if you have more than 5000 entries in a day, they won\'t be loaded.">Tautlli item length:</label>';
    html += '<input type="number" min="0" class="form-control" id="tautulli_length" value="' + tautulli_length + '" autocomplete="off" placeholder="" required /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="tautulli_root" title="Subfolder for Tautulli, no slashes needed at the beginning or end. It is the folder accessed after the main IP/domain. For example: \'tautulli.com/subfolder\' would mean you enter \'subfolder\' here.">Root for Tautulli: (Optional)</label>';
    html += '<input type="text" class="form-control" id="tautulli_root" value="' + tautulli_root + '" autocomplete="off" placeholder=""/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="tautulli_libraries" title="Comma seprated list of ID\'s to use for statistics. If none are given, it will search all.">Libraries ID\'s to use: (Optional)</label>';
    html += '<input type="text" class="form-control" id="tautulli_libraries" value="' + tautulli_libraries + '" autocomplete="off" placeholder=""/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="timezone" title="The timezone the data is located in, like \'Europe/Oslo\'. Type it exactly as it is specified in the PHP documentation.">Timezone: <a href="https://www.php.net/manual/en/timezones.php" target="_blank">(List)</a></label>';
    html += '<input type="text" class="form-control" id="timezone" value="' + timezone + '" autocomplete="off" placeholder="" required /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="ssl" title="Enable if your connection uses HTTPS.">Use HTTPS:</label>';
    html += '<input type="checkbox" class="form-control" id="ssl" ';
    if(ssl) {
        html += 'checked="' + ssl + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<button style="background-color: lightgrey;" type="button" class="form-control btn" id="test_connection" onclick="test_tautulli_connection()"><img src="../assets/synchronize.svg" class="btn_logo"><p2 id="test_tautulli_text">Test Tautulli connection</p2></button>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<input type="submit" class="form-control btn" id="form_button" value="Save" required />';
    html += '</div>';

    html += '</form>';

    document.getElementById("setup").innerHTML = html;
}

function set_tautulli_details(back) {
    topFunction();
    if(!back) {
        tautulli_apikey = document.getElementById('tautulli_apikey').value;
        tautulli_ip = document.getElementById('tautulli_ip').value;
        tautulli_port = document.getElementById('tautulli_port').value;
        tautulli_length = document.getElementById('tautulli_length').value;
        tautulli_root = document.getElementById('tautulli_root').value;
        tautulli_libraries = document.getElementById('tautulli_libraries').value;
        timezone = document.getElementById('timezone').value;
        ssl = document.getElementById('ssl').checked;
    }
    var html = '<div class="form-group">';
    html += '<button class="form-control btn" onclick="set_tautulli(true, false)"><img src="../assets/config.svg" class="btn_logo"><p2>Tautulli settings</p2></button>';
    html += '</div>';

    html += '<hr>';

    html += '<form id="tautulli_details_form" onsubmit="set_tautulli_last(false);return false">'

    html += '<div class="form-group">';
    html += '<label for="plex_wrapped_root" title="Subfolder for Plex-Wrapped, no slashes needed at the beginning or end. It is the folder accessed after the main IP/domain. For example: \'mycooldomain.com/wrapped\' would mean you enter \'wrapped\' here.">Root for Plex-Wrapped: (Optional)</label>';
    html += '<input type="text" class="form-control" id="plex_wrapped_root" value="' + plex_wrapped_root + '" autocomplete="off" placeholder=""/><br>';
    html += '</div>';

    var temp_date = wrapped_start.toLocaleDateString("en-GB", { // you can skip the first argument
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timezone: "Europe/London",
    });
    var temp_date = temp_date.split(',');
    var temp_date_first = temp_date[0].split('/');
    var temp_date_second = temp_date[1].split(':');
    html += '<div class="form-group">';
	html += '<div class="warning">!<br>Load time for long wrapped periods are extensive. Consider enabling caching and performing pre-caching once.</div>';
    html += '<label for="wrapped_start" title="The start of the period you want wrapped.">Start of wrapped period:</label>';
    html += '<input type="datetime-local" class="form-control" id="wrapped_start" value="' + temp_date_first[2].trim() + '-' + temp_date_first[1].trim() + '-' + temp_date_first[0].trim() + 'T' + temp_date_second[0].trim() + ':' + temp_date_second[1].trim() + '" required /><br>';
    html += '</div>';

    var temp_date = wrapped_end.toLocaleDateString("en-GB", { // you can skip the first argument
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        timezone: "Europe/London",
    });
    var temp_date = temp_date.split(',');
    var temp_date_first = temp_date[0].split('/');
    var temp_date_second = temp_date[1].split(':');
    html += '<div class="form-group">';
    html += '<label for="wrapped_end" title="The end of your wrapped period. All data until this point is viable.">End of wrapped period:<br>';
    html += '<input type="datetime-local" class="form-control" id="wrapped_end" value="' + temp_date_first[2].trim() + '-' + temp_date_first[1].trim() + '-' + temp_date_first[0].trim() + 'T' + temp_date_second[0].trim() + ':' + temp_date_second[1].trim() + '" required /></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_intro" title="Introduction text that is shown when the statistics are done loading. Could be used to inform about chosen timeframe. HTML allowed.">Introduction for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_intro" name="stats_intro" value="" autocomplete="off" placeholder="New year, new page of statistics..."></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="create_share_links" title="Grants users the ability to create a URL for sharing. Valid for 7 days.">Allow shareable URL creation:<br>';
    html += '<input type="checkbox" class="form-control" id="create_share_links" ';
    if(create_share_links) {
        html += 'checked="' + create_share_links + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<hr>';

    html += '<div class="form-group">';
    html += '<label for="get_user_movie_stats" title="Includes movie statistics in your wrapped period.">Get users movie statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_movie_stats" ';
    if(get_user_movie_stats) {
        html += 'checked="' + get_user_movie_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_user_show_stats" title="Includes show statistics in your wrapped period.">Get users show statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_show_stats" ';
    if(get_user_show_stats) {
        html += 'checked="' + get_user_show_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_user_show_buddy" title="Includes the users top show-buddy in your wrapped period. Requires show stats.">Get users show-buddy:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_show_buddy" ';
    if(get_user_show_buddy) {
        html += 'checked="' + get_user_show_buddy + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_user_music_stats" title="Includes music statistics in your wrapped period.">Get users music statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_music_stats" ';
    if(get_user_music_stats) {
        html += 'checked="' + get_user_music_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<hr>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_movies" title="Includes server-wide movie statistics in your wrapped period.">Get server-wide movie statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_movies" ';
    if(get_year_stats_movies) {
        html += 'checked="' + get_year_stats_movies + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_shows" title="Includes server-wide show statistics in your wrapped period.">Get server-wide show statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_shows" ';
    if(get_year_stats_shows) {
        html += 'checked="' + get_year_stats_shows + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_music" title="Includes server-wide music statistics in your wrapped period.">Get server-wide music statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_music" ';
    if(get_year_stats_music) {
        html += 'checked="' + get_year_stats_music + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_leaderboard" title="Creates a user leaderboard based on the server-wide statistics in your wrapped period.">Get server-wide leaderboard rankings:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_leaderboard" ';
    if(get_year_stats_leaderboard) {
        html += 'checked="' + get_year_stats_leaderboard + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<hr>';
	
	html += '<div class="form-group">';
    html += '<label for="use_logs" title="Logs every API request into a log-file in the config folder. ID for Wrapped request included.">Log API calls:<br>';
    html += '<input type="checkbox" class="form-control" id="use_logs" ';
    if(use_logs) {
        html += 'checked="' + use_logs + '" ';
    }
    html += '/><br>';
    html += '</div>';
	
    html += '<div class="form-group">';
	html += '<div class="warning">!<br>If your wrapped period is long and no results are cached, the wait time can be extensive. Using the cache feature and <a href="../caching" target="_blank">pre-caching</a> once is recommended.</div>';
    html += '<label for="use_cache" title="Caches your results in cache.json for later use.">Cache results for later use:<br>';
    html += '<input type="checkbox" class="form-control" id="use_cache" ';
    if(use_cache) {
        html += 'checked="' + use_cache + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group" title="Clear the cache now to include the newest settings.">';
    html += '<label for="clear_cache">Clear cache now:<br>';
    html += '<input type="checkbox" class="form-control" id="clear_cache" checked /></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<button type="submit" class="form-control btn" id="form_button"><img src="../assets/done.svg" class="btn_logo"><p2>Finish</p2></button>';
    html += '</div>';

    html += '</form>';
    document.getElementById("setup").innerHTML = html;
    document.getElementById("stats_intro").value = stats_intro;
}

function test_tautulli_connection() {
    document.getElementById("test_connection").disabled = true;
    document.getElementById("test_connection").style.opacity = '0.5';

    var button = document.getElementById('test_connection');
    button.style.backgroundColor = 'lightgrey';

    ssl_temp = document.getElementById('ssl').checked;
    ip_temp = document.getElementById('tautulli_ip').value;
    root_temp = document.getElementById('tautulli_root').value;
    port_temp = document.getElementById('tautulli_port').value;
    api_temp = document.getElementById('tautulli_apikey').value;

    if(ssl_temp) {
        var prefix = 'https://';
    } else {
        var prefix = 'http://';
    }

    if(root_temp == "") {
        var suffix = '';
    } else {
        var suffix = '/' + root_temp + '/';
    }

    if(port_temp == "") {
        url = prefix + ip_temp + suffix + '/api/v2';
    } else {
        url = prefix + ip_temp + ':' + port_temp + suffix + '/api/v2';
    }

    config_form = {"url" : url, "ssl" : ssl_temp, "apikey" : api_temp};

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(!result.error) {
                button.style.backgroundColor = '#79A04F';
                document.getElementById("test_connection").disabled = false;
                document.getElementById("test_connection").style.opacity = '1';
            } else {
                button.style.backgroundColor = '#F1909C';
                document.getElementById("test_connection").disabled = false;
                document.getElementById("test_connection").style.opacity = '1';
                alert(result.message);
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", root + 'api/get_connection.php');
    xhttp.send(config_data);
}

function set_tautulli_last(back) {
    if(!back) {
        
        plex_wrapped_root = document.getElementById('plex_wrapped_root').value;
        wrapped_start = new Date(document.getElementById('wrapped_start').value);
        wrapped_end = new Date(document.getElementById('wrapped_end').value);
        if(wrapped_end < wrapped_start) {
            alert("The wrapped end period must be later than the wrapped start period.");
            return;
        }
        stats_intro = document.getElementById('stats_intro').value;
        create_share_links = document.getElementById('create_share_links').checked;
        get_user_movie_stats = document.getElementById('get_user_movie_stats').checked;
        get_user_show_stats = document.getElementById('get_user_show_stats').checked;
        get_user_show_buddy = document.getElementById('get_user_show_buddy').checked;
        get_user_music_stats = document.getElementById('get_user_music_stats').checked;
        get_year_stats_movies = document.getElementById('get_year_stats_movies').checked;
        get_year_stats_shows = document.getElementById('get_year_stats_shows').checked;
        get_year_stats_music = document.getElementById('get_year_stats_music').checked;
        get_year_stats_leaderboard = document.getElementById('get_year_stats_leaderboard').checked;
        use_cache = document.getElementById('use_cache').checked;
		use_logs = document.getElementById('use_logs').checked;

        set_config();
    }
}

function get_plex_wrapped_version() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse Plex-Wrapped version. Response: ' + this.responseText)
            }
            
            if(!result.error) {
                document.getElementById('github_link').innerHTML = 'GitHub (' + result.plex_wrapped_version + ')';
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "../api/get_plex_wrapped_version.php");
    xhttp.send();
    return;
}