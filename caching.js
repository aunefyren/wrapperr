var cached = 0;
var input_array;

function search_box() {
    var html = `
        <form id='stats_form' class='form' onsubmit='return false' action="" method="post">

            <div class='form-group'>

                <label for="p_identity_multiple" title="">Plex email or usernames</label>
                <textarea type="text" class='form-control' rows=6 name="p_identity_multiple" id="p_identity_multiple" autocomplete="off" required></textarea>

            </div>

            <div class='form-group'>

                <label for="timeout" title="">Timeout between each call in seconds</label>
                <input type="number" class='form-control' name="timeout" id="timeout" value='10' autocomplete="off" required />

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
    var timeout_input = document.getElementById('timeout').value * 1000;
    var input = document.getElementById('p_identity_multiple').value;
    input_array = input.split(',');

    var html = `
        <form id='stats_form' class='form' onsubmit='return false' action="" method="post">

            <div class='form-group'>
                <img id="loading_icon" src="assets/loading.gif" style="padding: 1em;width: 4em; height: 4em; display:inline-block;">
            </div>

            <h3>Caching results:</h3>

            <div id="cache_results">
            </div>


        </form>
        `;

    document.getElementById('cache').innerHTML = html;

    call_stats(0, timeout_input);
}
function call_stats(i, timeout_input) {
    get_stats(input_array[i].trim());

    if(i < input_array.length-1) {
    setTimeout(function(){
        i += 1;
        call_stats(i, timeout_input);
    }, timeout_input);
    }


}

function cache_log(p_identity, result) {
    if(result) {
        document.getElementById('cache_results').innerHTML += '<p style="color:darkseagreen;">' + p_identity + '</p>';
    } else {
        document.getElementById('cache_results').innerHTML += '<p style="color:indianred;"> ' + p_identity + '</p>';
    }

    cached += 1;

    if(cached == input_array.length) {
        document.getElementById('loading_icon').style.display = "none";
    }
}

function get_stats(p_identity) {

    stats_form = {
                        "p_identity" : p_identity
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);

            if(result.error) {
                cache_log(p_identity, false);
            } else {
                cache_log(p_identity, true);
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_stats.php", );
    xhttp.send(stats_data);
    return;
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function get_config_cache() {

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
                alert(result.message);
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
            } else {
                if(!result.data.use_cache) {
                    alert("You have disabled cache in the configuration!");
                }
                search_box();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_config.php");
    xhttp.send(config_data);
}

function login_menu() {
    topFunction();
    var html = '<form id="password_login_form" onsubmit="get_config();return false">'

    html += '<div class="form-group">';
    html += '<label for="password" title="The password chosen during first-time setup.">Password</label>';
    html += '<input type="password" class="form-control" id="password" value="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<input type="submit" class="form-control btn" id="password_button" value="Log in" required />';
    html += '</div>';

    html += '</form>';
    document.getElementById("cache").innerHTML = html;
}