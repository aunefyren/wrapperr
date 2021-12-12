var cached = 0;
var input_array;

function search_box() {
    var html = `
        <form id='stats_form' class='form' onsubmit='return false' action="" method="post">
		
			<p style="font-size:1em;">
				When you configured a wrapped period, it included the amount of days you want to analyze. Each unique day in that period is a new API request to Tautulli.
                <br>
                <br>
                Here you can perform a full caching of all those days, by calling the Plex-Wrapped API in a loop, downloading all the data needed. This makes the site fast to load.
                <br>
                <br>
                Plex-Wrapped uses PHP, which has script run-time limits. The input below allows you to reduce the number of days cached each time the cacher loops, preventing the PHP script from running for more than the allowed runtime (typically 120 seconds).
			</p>

            <div class='form-group'>

                <label for="days" title="">Days to cache:</label>
                <input type="number" class='form-control' name="days" id="days" minlenght='1' value='50' autocomplete="off" required />

            </div>

            <div class='form-group'>

                <input type="submit" class='form-control btn' value="Cache" name="cache_button" id="cache_button" required/>

            </div>

        </form>
    `;

    document.getElementById('cache').innerHTML = html;
}

$(document).on('submit', '#stats_form', function(){

    cache();

});

function cache() {
    var days = document.getElementById('days').value;

    var html = `
        <form id='stats_form' class='form' onsubmit='return false' action="" method="post">

            <div class='form-group'>
                <img id="loading_icon" src="../assets/loading.gif" style="border-radius: 25px; background-color: white; padding: 1em; width: 4em; height: 4em; display: inline;">
            </div>

            <h3>Caching log:</h3>

            <div id="cache_results">
            </div>


        </form>
        `;

    document.getElementById('cache').innerHTML = html;
	
	document.getElementById('cache_results').innerHTML += '<p style="color:white;">' + 'Creating new cache request. Maximum ' + days + ' days.' + '</p>';

    get_stats(days);
}

function cache_log(days, result, complete) {
    if(result) {
        document.getElementById('cache_results').innerHTML += '<p style="color:darkseagreen;">' + 'Completed one caching with a maxmimum of ' + days + ' days.' + '</p>';
    } else {
        document.getElementById('cache_results').innerHTML += '<p style="color:indianred;"> ' + 'Error caching ' + days + ' days. Stopping.' + '</p>';
		document.getElementById('loading_icon').style.display = "none";
    }
	
	if(complete) {
		document.getElementById('cache_results').innerHTML += '<p style="color:darkseagreen;">' + 'Finished caching loop.' + '</p>';
		document.getElementById('loading_icon').style.display = "none";
	} else {
		document.getElementById('cache_results').innerHTML += '<p style="color:white;">' + 'Creating new cache request. Maximum ' + days + ' days.' + '</p>';
	}
}

function get_stats(days) {

    stats_form = {
                        "cookie" : '',
						"caching" : true,
						"cache_limit" : days
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
			try {
				var result = JSON.parse(this.responseText);

				if(result.error) {
					cache_log(days, false, true);
				} else {
					if(!result.caching_complete) {
						cache_log(days, true, result.caching_complete);
						get_stats(days);
					} else {
						cache_log(days, true, result.caching_complete);
					}
				}
			} catch(error) {
				cache_log(days, false, true);
				console.log('Error: ' + error);
				console.log(this.responseText);
			}
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", root + "api/get_stats.php", );
    xhttp.send(stats_data);
    return;
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function get_config_cache() {

    config_form = {
                        "password" : "",
                        "username" : "",
                   };

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.password) {
                login_menu();
            } else {
                alert(result.message);
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
                        "username" : current_username
                   };

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.error) {
                alert(result.message);
            } else {
                if(!result.data.use_cache) {
                    alert("You have disabled cache in the configuration!");
                }
                search_box();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", root + "api/get_config.php");
    xhttp.send(config_data);
}

function login_menu() {
    topFunction();
    var html = '<form id="password_login_form" onsubmit="get_config();return false">'

    html += '<div class="form-group">';
    html += '<label for="username" title="The administrator username chosen during first-time setup.">Username:</label>';
    html += '<input type="text" class="form-control" id="username" value="" autocomplete="on" minlength=4 required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="password" title="The password chosen for the administrator during first-time setup.">Password:</label>';
    html += '<input type="password" class="form-control" id="password" value="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<input type="submit" class="form-control btn" id="password_button" value="Log in" required />';
    html += '</div>';

    html += '</form>';
    document.getElementById("cache").innerHTML = html;
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