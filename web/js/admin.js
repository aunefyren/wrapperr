function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function login_menu() {
    topFunction();
    var html = '<h2>Admin Login</h2>';
    
    html += '<form id="password_login_form" onsubmit="log_in();return false">'

    html += '<div class="form-group newline">';
    html += '<label for="username" title="The username chosen during first-time setup.">Username:</label>';
    html += '<input type="text" class="form-control" id="username" value="" placeholder="" minlength=4 autocomplete="on" required />';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<label for="password" title="The password chosen during first-time setup.">Password:</label>';
    html += '<input type="password" class="form-control" id="password" value="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<div id="password_login_form_error"></div>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button type="submit" class="form-control btn" id="log_in_button"><img src="./assets/done.svg" class="btn_logo"><p2>Log in</p2></button>';
    html += '</div>';

    html += '</form>';
    document.getElementById("setup").innerHTML = html;
}

function log_in() {

    // Disable button
    document.getElementById("log_in_button").disabled = true;
    document.getElementById("log_in_button").style.opacity = '0.5';

    // Get variables
    password = document.getElementById('password').value;
    username = document.getElementById('username').value;

    admin_login_form = {"admin_password" : password, "admin_username" : username};

    var admin_login_data = JSON.stringify(admin_login_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
                document.getElementById("log_in_button").disabled = false;
                document.getElementById("log_in_button").style.opacity = '1';
                document.getElementById('password').value = '';
                return;
            }
            
            if(result.error) {
                document.getElementById("password_login_form_error").innerHTML = result.message;
                document.getElementById("log_in_button").disabled = false;
                document.getElementById("log_in_button").style.opacity = '1';
                document.getElementById('password').value = '';
            } else {
                set_cookie("wrapperr-admin", result.data, 3);
                location.reload();
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "login/admin");
    xhttp.send(admin_login_data);
    return;
}

function set_password_form() {
    topFunction();
    var html = '<h2>Create admin</h2>';
    
    html += '<form id="password_form" onsubmit="set_password();return false;">'

    html += '<div class="form-group newline">';
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

    html += '<div class="form-group newline">';
    html += '<div id="password_form_error"></div>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button type="submit" class="form-control btn" id="create_admin_button"><img src="./assets/done.svg" class="btn_logo"><p2>Create account</p2></button>';
    html += '</div>';

    html += '</form>';
    document.getElementById("setup").innerHTML = html;
}

function set_password() {

    // Disable button
    document.getElementById("create_admin_button").disabled = true;
    document.getElementById("create_admin_button").style.opacity = '0.5';

    // Check password match
    if(document.getElementById('password').value != document.getElementById('password_2').value) {
        alert("The passwords must match.");
        document.getElementById('password').value = "";
        document.getElementById('password_2').value = "";
        document.getElementById('password').focus();

        document.getElementById("create_admin_button").disabled = false;
        document.getElementById("create_admin_button").style.opacity = '1';
        return false;
    } else {
        password = document.getElementById('password').value;
        username = document.getElementById('username').value;
    }

    admin_create_form = {"admin_password" : password, "admin_username" : username};

    var admin_create_data = JSON.stringify(admin_create_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
                document.getElementById("create_admin_button").disabled = false;
                document.getElementById("create_admin_button").style.opacity = '1';
                return;
            }
            
            if(result.error) {
                document.getElementById("password_form_error").innerHTML = result.message;
                document.getElementById("create_admin_button").disabled = false;
                document.getElementById("create_admin_button").style.opacity = '1';
            } else {
                location.reload();
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "create/admin");
    xhttp.send(admin_create_data);
    return;
}

function update_password_form() {
    topFunction();

    var html = '<div class="form-group newline">';
    html += '<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="get_config(get_cookie(\'wrapperr-admin\'));"><img src="./assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';
    
    html += '<form id="update_password_form" onsubmit="return false;">'

    html += '<div class="form-group newline">';
    html += '<label for="username" title="The username needed to log in as administrator and change the config-file remotely.">Update admin username:</label>';
    html += '<input type="text" class="form-control" id="username" value="' + username + '" placeholder="" minlength=4 autocomplete="on" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="password" title="The password needed to change the config-file remotely.">Update admin password:</label>';
    html += '<input type="password" class="form-control" id="password" value="" placeholder="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="password_2" title="The password needed to change the config-file remotely.">Repeat the password:</label>';
    html += '<input type="password" class="form-control" id="password_2" value="" placeholder="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<div id="password_form_error"></div>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button type="submit" class="form-control btn" onclick="update_password();" id="update_admin_button"><img src="./assets/done.svg" class="btn_logo"><p2>Update account</p2></button>';
    html += '</div>';

    html += '</form>';
    document.getElementById("setup").innerHTML = html;
}

function update_password() {

    // Disable button
    document.getElementById("update_admin_button").disabled = true;
    document.getElementById("update_admin_button").style.opacity = '0.5';

    // Check password match
    if(document.getElementById('password').value != document.getElementById('password_2').value) {
        alert("The passwords must match.");
        document.getElementById('password').value = "";
        document.getElementById('password_2').value = "";
        document.getElementById('password').focus();

        document.getElementById("update_admin_button").disabled = false;
        document.getElementById("update_admin_button").style.opacity = '1';
        return false;
    } else {
        password = document.getElementById('password').value;
        username = document.getElementById('username').value;
    }

    admin_create_form = {"admin_password" : password, "admin_username" : username};

    var admin_create_data = JSON.stringify(admin_create_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById("password_form_error").innerHTML = 'Failed to parse API response.';
                console.log('Failed to parse API response. Response: ' + this.responseText)
                document.getElementById("update_admin_button").disabled = false;
                document.getElementById("update_admin_button").style.opacity = '1';
                return;
            }
            
            if(result.error) {
                document.getElementById("password_form_error").innerHTML = result.message;
                document.getElementById("update_admin_button").disabled = false;
                document.getElementById("update_admin_button").style.opacity = '1';
            } else {   
                set_cookie("wrapperr-admin", "", 1);
                location.reload();
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "update/admin");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(admin_create_data);
    return;
}

function get_admin_state() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
                return;
            }
            
            if(result.error) {
                console.log(result.message);
            } else if(!result.configured) {
                first_time = true;
                set_password_form();
            } else {
                login_menu();
            }

        } else if(this.readyState == 4 && this.status !== 200) {
            var html = '<h2>' + this.status + ' Error</h2>';
            html += '<p>The API did not respond correctly.</p>';
            document.getElementById("setup").innerHTML = html;
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get_admin_state.php");
    xhttp.send();
    return;
}

function sign_out() {
    set_cookie("wrapperr-admin", "", 1);
    location.reload();
}

function admin_menu() {

    var html = '<div class="form-group">';
    html += '<button class="form-control btn" onclick="update_password_form()"><img src="./assets/config.svg" class="btn_logo"><p2>Admin settings</p2></button>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<button class="form-control btn" name="plex_signout_button" id="plex_signout_button" onclick="sign_out()"><img src="./assets/close.svg" class="btn_logo"></img><p2 id="plex_signout_button_text">Sign Out</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" onclick="set_tautulli_settings()" id="set_tautulli_settings"><img src="./assets/config.svg" class="btn_logo"><p2>Tautulli settings</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" onclick="set_wrapperr_settings()" id="set_wrapperr_settings"><img src="./assets/config.svg" class="btn_logo"><p2>Wrapperr settings</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" onclick="set_wrapperr_customization()" id="set_wrapperr_customization"><img src="./assets/config.svg" class="btn_logo"><p2>Wrapperr customization</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" onclick="caching_menu()" id="caching_menu"><img src="./assets/download.svg" class="btn_logo"><p2>Caching</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" onclick="log_menu()" id="log_menu"><img src="./assets/document.svg" class="btn_logo"><p2>Log</p2></button>';
    html += '</div>';

    document.getElementById("setup").innerHTML = html;

    if(timezone === '') {
        document.getElementById("set_wrapperr_settings").style.border = '0.15em dashed var(--red)';
        document.getElementById("caching_menu").disabled = true;
        document.getElementById("caching_menu").style.opacity = '0.5';
    }

    if(wrapped_start === '' || wrapped_end === '') {
        document.getElementById("set_wrapperr_customization").style.border = '0.15em dashed var(--red)';
        document.getElementById("caching_menu").disabled = true;
        document.getElementById("caching_menu").style.opacity = '0.5';
    }

    if(tautulli[0].tautulli_ip === '' || tautulli[0].tautulli_apikey === '' || tautulli[0].tautulli_length === '' || tautulli[0].tautulli_port == 0 || tautulli[0].tautulli_length == 0) {
        document.getElementById("set_tautulli_settings").style.border = '0.15em dashed var(--red)';
        document.getElementById("caching_menu").disabled = true;
        document.getElementById("caching_menu").style.opacity = '0.5';
    }

    if(!use_logs) {
        document.getElementById("log_menu").disabled = true;
        document.getElementById("log_menu").style.opacity = '0.5';
    }
}

function set_tautulli_settings() {

    topFunction();

    var html = '<div>';
    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="get_config(get_cookie(\'wrapperr-admin\'));"><img src="./assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<form id="set_tautulli_form" onsubmit="return false;">'

    for(var i = 0; i < tautulli.length; i++) {

        if(tautulli.length > 1) {
            html += '<div class="form-group newline">';
            html += '<button style="" type="button" class="form-control btn" id="remove_tautulli_ ' + i + '" onclick="remove_tautulli_server(' + i + ');"><img src="./assets/trash.svg" class="btn_logo"><p2 id="test_tautulli_text">Remove Tautulli server</p2></button>';
            html += '</div>';
        }

        html += '<div class="form-group">';
        html += '<label for="tautulli_name_' + i + '" title="Just what we shall name your server.">Tautulli Server name:</label>';
        html += '<input type="text" class="form-control" id="tautulli_name_' + i + '" value="' + tautulli[i].tautulli_name + '" autocomplete="off" required placeholder="" /><br>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_apikey_' + i + '" title="The API key is needed for Plex-Wrapped to interact with Tautulli. Commonly found at Tautulli->Settings->Web Interface->API Key.">Tautulli API key:</label>';
        html += '<input type="text" class="form-control" id="tautulli_apikey_' + i + '" value="' + tautulli[i].tautulli_apikey + '" autocomplete="off" required placeholder="" /><br>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_ip_' + i + '" title="The IP address or domain that connects to Tautulli. No subfolders, as this is another setting, but subdomains can be defined.">IP or domain for Tautulli connection:</label>';
        html += '<input type="text" class="form-control" id="tautulli_ip_' + i + '" value="' + tautulli[i].tautulli_ip + '" required placeholder="" /><br>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_port_' + i + '" title="The port Tautulli uses for connections. Typically 80 or 443 if a domain is used.">Port for Tautulli:</label>';
        html += '<input type="number" class="form-control" id="tautulli_port_' + i + '" value="' + tautulli[i].tautulli_port + '" placeholder="" required /><br>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_length_' + i + '" title="The max amount of entries Tautulli responds with during API calls. Typically doesn\'t need to be changed, but if you have more than 5000 entries in a day, they won\'t be loaded.">Tautlli item length:</label>';
        html += '<input type="number" min="0" class="form-control" id="tautulli_length_' + i + '" value="' + tautulli[i].tautulli_length + '" autocomplete="off" placeholder="" required /><br>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_root_' + i + '" title="Subfolder for Tautulli, no slashes needed at the beginning or end. It is the folder accessed after the main IP/domain. For example: \'tautulli.com/subfolder\' would mean you enter \'subfolder\' here.">Tautulli URL Base: (Optional)</label>';
        html += '<input type="text" class="form-control" id="tautulli_root_' + i + '" value="' + tautulli[i].tautulli_root + '" autocomplete="off" placeholder=""/><br>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_libraries_' + i + '" title="Comma separated list of ID\'s to use for statistics. If none are given, it will search all.">Library ID\'s to use: (Optional)</label>';
        html += '<input type="text" class="form-control" id="tautulli_libraries_' + i + '" value="' + tautulli[i].tautulli_libraries + '" autocomplete="off" placeholder=""/><br>';
        html += '</div>';

        html += '<div class="form-group newline">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_https_' + i + '" title="Enable if your connection uses HTTPS.">Use HTTPS:</label>';
        html += '<input type="checkbox" class="form-control" id="tautulli_https_' + i + '" ';
        if(tautulli[i].tautulli_https) {
            html += 'checked="' + tautulli[i].tautulli_https + '" ';
        }
        html += '/><br>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="tautulli_grouping_' + i + '" title="If Tautulli should group related plays into one entry.">Use Tautulli grouping:</label>';
        html += '<input type="checkbox" class="form-control" id="tautulli_grouping_' + i + '" ';
        if(tautulli[i].tautulli_grouping) {
            html += 'checked="' + tautulli[i].tautulli_grouping + '" ';
        }
        html += '/><br>';
        html += '</div>';

        html += '<div class="form-group newline">';
        html += '<button style="background-color: lightgrey;" type="button" class="form-control btn" id="test_connection_' + i + '" onclick="test_tautulli_connection(' + i + ')"><img src="./assets/synchronize.svg" class="btn_logo"><p2 id="test_tautulli_text">Test Tautulli connection</p2></button>';
        html += '</div>';

        html += '<div class="form-group newline">';
        html += '<hr>';
        html += '</div>';

    }

    html += '<div class="form-group newline">';
    html += '<button style="" type="button" class="form-control btn" id="add_tautulli_server" onclick="additional_tautulli_server();"><img src="./assets/plus.svg" class="btn_logo"><p2 id="test_tautulli_text">Add Tautulli server</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<div class="warning">!<br>If you changed any server names you must clear the cache for Wrapperr to function.</div>';
    html += '</div>';

    html += '<div class="form-group newline" title="Clear the cache now to include the newest settings.">';
    html += '<label for="clear_cache">Clear cache now:<br>';
    html += '<input type="checkbox" class="form-control" id="clear_cache" checked /></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button type="submit" class="form-control btn" onclick="set_tautulli_settings_call();" id="set_tautulli_form_button"><img src="./assets/done.svg" class="btn_logo"></img><p2 id="set_tautulli_form_button_text">Save</p2></button>';
    html += '</div>';

    html += '</form>';

    html += '</div>';

    document.getElementById("setup").innerHTML = html;
}

function additional_tautulli_server() {

    tautulli_apikey = ""
    tautulli_ip = ""
    tautulli_port = ""
    tautulli_length = 5000
    tautulli_root = ""
    tautulli_libraries = ""
    tautulli_grouping = true
    tautulli_https = false
    tautulli_name = ""

    tautulli_object = {
        "tautulli_apikey" : tautulli_apikey,
        "tautulli_ip" : tautulli_ip,
        "tautulli_port" : tautulli_port,
        "tautulli_length" : tautulli_length,
        "tautulli_root" : tautulli_root,
        "tautulli_libraries" : tautulli_libraries,
        "tautulli_grouping" : tautulli_grouping,
        "tautulli_https" : tautulli_https,
        "tautulli_name" : ""
    };

    tautulli.push(tautulli_object);
    set_tautulli_settings();
    return;

}

function remove_tautulli_server(index) {

    if(tautulli.length < 2) {
        return
    }

    tautullinew = []

    for(var i = 0; i < tautulli.length; i++) {
        if(i !== index) {
            tautullinew.push(tautulli[i])
        }
    }

    tautulli = tautullinew
    set_tautulli_settings();
    return;

}

function set_tautulli_settings_call() {

    document.getElementById("set_tautulli_form_button").disabled = true;
    document.getElementById("set_tautulli_form_button").style.opacity = '0.5';

    var tautulli_settings_array = []

    for(var i = 0; i < 100; i++) {

        try {
            tautulli_apikey = document.getElementById('tautulli_apikey_' + i).value;
        } catch {
            break;
        }

        tautulli_apikey = document.getElementById('tautulli_apikey_' + i).value;
        tautulli_ip = document.getElementById('tautulli_ip_' + i).value;
        tautulli_port = parseInt(document.getElementById('tautulli_port_' + i).value);
        tautulli_length = parseInt(document.getElementById('tautulli_length_' + i).value);
        tautulli_root = document.getElementById('tautulli_root_' + i).value;
        tautulli_libraries = document.getElementById('tautulli_libraries_' + i).value;
        tautulli_grouping = document.getElementById('tautulli_grouping_' + i).checked;
        tautulli_https = document.getElementById('tautulli_https_' + i).checked;
        tautulli_name = document.getElementById('tautulli_name_' + i).value;

        if(tautulli_apikey === '') {
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            alert('API key is required for Tautulli to function.');
            document.getElementById('tautulli_apikey_' + i).focus();
            return;
        }

        if(tautulli_apikey === '') {
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            alert('Server name is required for Tautulli to function.');
            document.getElementById('tautulli_name_' + i).focus();
            return;
        }

        if(tautulli_ip === '') {
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            alert('Tautulli IP is required for Tautulli to function.');
            document.getElementById('tautulli_ip_' + i).focus();
            return;
        }

        if(tautulli_length == 0) {
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            alert('Tautulli item length is required for Tautulli to function.');
            document.getElementById('tautulli_length_' + i).focus();
            return;
        }

        if(tautulli_port == 0) {
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            alert('Tautulli port is required for Tautulli to function. Use 80 for HTTP, 443 for HTTPS.');
            document.getElementById('tautulli_port_' + i).focus();
            return;
        }

        tautulli_object = {
            "tautulli_apikey" : tautulli_apikey,
            "tautulli_ip" : tautulli_ip,
            "tautulli_port" : tautulli_port,
            "tautulli_length" : tautulli_length,
            "tautulli_root" : tautulli_root,
            "tautulli_libraries" : tautulli_libraries,
            "tautulli_grouping" : tautulli_grouping,
            "tautulli_https" : tautulli_https,
            "tautulli_name" : tautulli_name
        };

        tautulli_settings_array.push(tautulli_object)

    }

    if(tautulli_settings_array.length < 1) {
        alert("Failed to save Tautulli settings.")
        document.getElementById("set_tautulli_form_button").disabled = false;
        document.getElementById("set_tautulli_form_button").style.opacity = '1';
        return
    }

    var name_array = []
    for(var i = 0; i < tautulli_settings_array.length; i++) {
        var found_name = false
        for(var j = 0; j < name_array.length; j++) {
            if(tautulli_settings_array[i].tautulli_name == name_array[j]) {
                found_name = true
            }
        }
        if(found_name) {
            alert("Tautulli server names must be unique.")
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            return
        } else {
            name_array.push(tautulli_settings_array[i].tautulli_name)
        }
    }

    clear_cache = document.getElementById('clear_cache').checked;

    tautulli_settings_form = {
                                "clear_cache" : clear_cache,
                                "data_type" : "tautulli_config",
                                "tautulli_config" : tautulli_settings_array,
                                "wrapperr_data" : {},
                                "wrapperr_customize" : {}
                            };

    var tautulli_settings_data = JSON.stringify(tautulli_settings_form);

    console.log(tautulli_settings_data)
    //return;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Response: ' + this.responseText)
                document.getElementById("set_tautulli_form_button").disabled = false;
                document.getElementById("set_tautulli_form_button").style.opacity = '1';
                return;
            }
            
            if(result.error) {
                alert(result.message);
                document.getElementById("set_tautulli_form_button").disabled = false;
                document.getElementById("set_tautulli_form_button").style.opacity = '1';
            } else {
                get_config(get_cookie('wrapperr-admin'));
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "set/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(tautulli_settings_data);
    return;
}

function set_wrapperr_settings() {
    topFunction();

    var html = '<div class="form-group newline">';
    html += '<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="get_config(get_cookie(\'wrapperr-admin\'));"><img src="./assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<form id="wrapperr_settings_form" onsubmit="return false;">'

    var wrapped_start_obj = new Date(wrapped_start);
    var temp_date = wrapped_start_obj.toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).replace(" ", "T");

    html += '<div class="form-group newline">';
    html += '<div class="warning">!<br>The more unique days in the wrapped period, the more Tautulli API calls. It is recommended to enable "Cache results for later use" to prevent long load times.</div>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="wrapped_start" title="The start of the period you want wrapped.">Start of wrapped period:<br>';
    html += '<input type="datetime-local" class="form-control" id="wrapped_start" value="' + temp_date + '" required /><br>';
    html += '</div>';

    var wrapped_end_obj = new Date(wrapped_end);
    var temp_date = wrapped_end_obj.toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).replace(" ", "T");

    html += '<div class="form-group">';
    html += '<label for="wrapped_end" title="The end of your wrapped period. All data until this point is viable.">End of wrapped period:<br>';
    html += '<input type="datetime-local" class="form-control" id="wrapped_end" value="' + temp_date + '" required /></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="timezone" title="The timezone the data is located in, like \'Europe/Oslo\'. Type it exactly as it is specified in the IANA Time Zone database.">Timezone: <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank">(List)</a></label>';
    html += '<input type="text" class="form-control" id="timezone" value="' + timezone + '" autocomplete="off" placeholder="" required /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="application_name_str" title="Title of application shown on the pages. Replaces Wrapperr.">Application Name: (Optional)</label>';
    html += '<input type="text" class="form-control" id="application_name_str" value="' + application_name_str + '" autocomplete="off" placeholder=""/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="application_url_str" title="The domain/URL for Wrapperr. For example \'https://wrapperr-is-cool.example\'.">Wrapperr URL: (Optional)</label>';
    html += '<input type="text" class="form-control" id="application_url_str" value="' + application_url_str + '" autocomplete="off" placeholder=""/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="wrapperr_root" title="Subfolder for Wrapperr, no slashes needed at the beginning or end. It is the folder accessed after the main IP/domain. For example: \'mycooldomain.com/wrapperr\' would mean you enter \'wrapperr\' here.">Wrapperr URL Base: (Optional)</label>';
    html += '<input type="text" class="form-control" id="wrapperr_root" value="' + wrapperr_root + '" autocomplete="off" placeholder=""/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="create_share_links" title="Grants users the ability to create a URL for sharing. URL is valid for 7 days.">Allow shareable URL creation:<br>';
    html += '<input type="checkbox" class="form-control" id="create_share_links" ';
    if(create_share_links) {
        html += 'checked="' + create_share_links + '" ';
    }
    html += '/><br>';
    html += '</div>';
	
	html += '<div class="form-group">';
    html += '<label for="use_logs" title="Logs every API action into a log-file in the config folder. Requires a Wrapperr restart.">Log API actions:<br>';
    html += '<input type="checkbox" class="form-control" id="use_logs" ';
    if(use_logs) {
        html += 'checked="' + use_logs + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="plex_auth" title="Whether users can unwrap stats using any given Plex username/e-mail or by signing into Plex.">Use Plex Auth:<br>';
    html += '<input type="checkbox" class="form-control" id="plex_auth" ';
    if(plex_auth) {
        html += 'checked="' + plex_auth + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="winter_theme" title="Disable if you don\'t like snow :(">Winter theme:<br>';
    html += '<input type="checkbox" class="form-control" id="winter_theme" ';
    if(winter_theme) {
        html += 'checked="' + winter_theme + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';
	
    html += '<div class="form-group newline">';
	html += '<div class="warning">!<br>Have this enabled to ensure short load times for users. Especially if the wrapped period is long.</div>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<label for="use_cache" title="Caches your results in cache.json for later use.">Cache results for later use:<br>';
    html += '<input type="checkbox" class="form-control" id="use_cache" ';
    if(use_cache) {
        html += 'checked="' + use_cache + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline" title="Clear the cache now to include the newest settings.">';
    html += '<label for="clear_cache">Clear cache now:<br>';
    html += '<input type="checkbox" class="form-control" id="clear_cache" checked /></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button type="submit" class="form-control btn" onclick="set_wrapperr_settings_call();" id="set_wrapperr_settings_form_button"><img src="./assets/done.svg" class="btn_logo"></img><p2 id="set_wrapperr_settings_form_button_text">Save</p2></button>';
    html += '</div>';

    html += '</form>';

    document.getElementById("setup").innerHTML = html;
}

function set_wrapperr_settings_call() {

    var wrapperr_root_original = wrapperr_root;

    document.getElementById("set_wrapperr_settings_form_button").disabled = true;
    document.getElementById("set_wrapperr_settings_form_button").style.opacity = '0.5';

    wrapped_start = new Date(document.getElementById('wrapped_start').value);
    wrapped_end = new Date(document.getElementById('wrapped_end').value);
    use_cache = document.getElementById('use_cache').checked;
    use_logs = document.getElementById('use_logs').checked;
    plex_auth = document.getElementById('plex_auth').checked;
    wrapperr_root = document.getElementById('wrapperr_root').value;
    application_name_str = document.getElementById('application_name_str').value;
    application_url_str = document.getElementById('application_url_str').value;
    create_share_links = document.getElementById('create_share_links').checked;
    timezone = document.getElementById('timezone').value;
    clear_cache = document.getElementById('clear_cache').checked;
    winter_theme = document.getElementById('winter_theme').checked;

    if(wrapperr_root_original !== wrapperr_root) {
        if(!confirm("You have changed the Wrapperr root/base URL. Wrapperr will attempt to restart and the interface to access this webpage will change. If you are using an URL base you must use a trailing '/' at the end of your new URL.")){
            return;
        }
    }

    if(wrapperr_root !== "") {
        var wrapperr_root_last_char = wrapperr_root.charAt(wrapperr_root.length-1);
        var wrapperr_root_first_char = wrapperr_root.charAt(0);

        if(wrapperr_root_last_char == "/" || wrapperr_root_first_char == "/") {
            document.getElementById("set_wrapperr_settings_form_button").disabled = false;
            document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
            alert("No trailing or initial '/' needed for URL base.");
            document.getElementById('wrapperr_root').focus();
            return;
        }
    }

    if(timezone === '') {
        document.getElementById("set_wrapperr_settings_form_button").disabled = false;
        document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
        alert('Timezone is required for Wrapperr to function.');
        document.getElementById('timezone').focus();
        return;
    }

    if(wrapped_end < wrapped_start) {
        document.getElementById("set_wrapperr_settings_form_button").disabled = false;
        document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
        alert('The wrapped end period must be later than the wrapped start period.');
        document.getElementById('wrapped_end').focus();
        return;
    }

    if(wrapped_end === '') {
        document.getElementById("set_wrapperr_settings_form_button").disabled = false;
        document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
        alert('Ending of wrapped period is required for Wrapperr to function.');
        document.getElementById('wrapped_end').focus();
        return;
    }

    if(wrapped_start === '') {
        document.getElementById("set_wrapperr_settings_form_button").disabled = false;
        document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
        alert('Start of wrapped period is required for Wrapperr to function.');
        document.getElementById('wrapped_start').focus();
        return;
    }
    
    wrapperr_settings_form = {
                                "clear_cache" : clear_cache,
                                "data_type" : "wrapperr_data",
                                "tautulli_config" : [],
                                "wrapperr_customize" : {},
                                "wrapperr_data" : {
                                    "use_cache" : use_cache,
                                    "use_logs" : use_logs,
                                    "plex_auth" : plex_auth,
                                    "wrapperr_root" : wrapperr_root,
                                    "create_share_links" : create_share_links,
                                    "timezone" : timezone,
                                    "application_name" : application_name_str,
                                    "application_url" : application_url_str,
                                    "wrapped_start" : Math.round(wrapped_start.getTime() / 1000),
                                    "wrapped_end" : Math.round(wrapped_end.getTime() / 1000),
                                    "winter_theme" : winter_theme
                                }
                            };

    var wrapperr_settings_data = JSON.stringify(wrapperr_settings_form);
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Response: ' + this.responseText);
                document.getElementById("set_wrapperr_settings_form_button").disabled = false;
                document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
                return;
            }
            
            if(result.error) {
                alert(result.message);
                document.getElementById("set_wrapperr_settings_form_button").disabled = false;
                document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
            } else {
                get_config(get_cookie('wrapperr-admin'));
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "set/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(wrapperr_settings_data);
    return;
}

function set_wrapperr_customization() {
    topFunction();

    var html = '<div class="form-group newline">';
    html += '<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="get_config(get_cookie(\'wrapperr-admin\'));"><img src="./assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<form id="wrapperr_customization_form" onsubmit="return false;">'

    html += '<div class="form-group">';
    html += '<label for="stats_order_by_plays" title="Whether top lists can be ordered by plays.">Order lists by plays:<br>';
    html += '<input type="checkbox" class="form-control" id="stats_order_by_plays" ';
    if(stats_order_by_plays) {
        html += 'checked="' + stats_order_by_plays + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_order_by_duration" title="Whether top lists can be ordered by duration. Automatically enabled if Wrapperr can\'t order by plays.">Order lists by duration:<br>';
    html += '<input type="checkbox" class="form-control" id="stats_order_by_duration" ';
    if(stats_order_by_duration) {
        html += 'checked="' + stats_order_by_duration + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_top_list_length" title="Use 0 for no limit.">Maximum length of top lists:<br>';
    html += '<input type="number" class="form-control" id="stats_top_list_length" value="' + stats_top_list_length + '" autocomplete="off" placeholder="" required /><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="wrapperr_front_page_title" title="Introduction title that is shown on top of the front page.">Introduction title for the front page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="wrapperr_front_page_title" name="wrapperr_front_page_title" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="wrapperr_front_page_subtitle" title="Introduction subtitle text that is shown on the front page.">Introduction subtitle for the front page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="wrapperr_front_page_subtitle" name="wrapperr_front_page_subtitle" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_intro_title" title="Introduction title that is shown when the statistics are done loading.">Introduction title for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_intro_title" name="stats_intro_title" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_intro_subtitle" title="Introduction subtitle text that is shown when the statistics are done loading. Could be used to inform about chosen timeframe.">Introduction subtitle for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_intro_subtitle" name="stats_intro_subtitle" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<label for="get_user_movie_stats" title="Includes movie statistics in your wrapped period.">Get users movie statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_movie_stats" ';
    if(get_user_movie_stats) {
        html += 'checked="' + get_user_movie_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form_hidden" id="get_user_movie_stats_custom">';

        html += '<div class="form_block" id="plural">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_title" title="Title on top of this section.">Movies title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_title" name="get_user_movie_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subtitle" title="Subtitle underneath title on top of this section.">Movies subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subtitle" name="get_user_movie_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Movies sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subsubtitle" name="get_user_movie_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="singular">';

            html += '<div class="form-group" id="singular">';
            html += '<label for="get_user_movie_stats_subtitle_one" title="Subtitle underneath title on top of this section.">Movies subtitle for one movie:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subtitle_one" name="get_user_movie_stats_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subsubtitle_one" title="Sub-subtitle underneath subtitle on top of this section.">Movies sub-subtitle for one movie:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subsubtitle_one" name="get_user_movie_stats_subsubtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subtitle_none" title="Subtitle underneath title on top of this section.">Movies subtitle for no movies:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subtitle_none" name="get_user_movie_stats_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subsubtitle_none" title="Sub-subtitle underneath subtitle on top of this section.">Movies sub-subtitle for no movies:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subsubtitle_none" name="get_user_movie_stats_subsubtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_top_movie" title="Custom title of the list of top movies (singular).">Title of top movie list:<br>';
            html += '<input type="text" class="form-control" id="get_user_movie_stats_top_movie" value="' + get_user_movie_stats_top_movie + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_top_movie_plural" title="Custom title of the list of top movies (plural).">Title of top movies list:<br>';
            html += '<input type="text" class="form-control" id="get_user_movie_stats_top_movie_plural" value="' + get_user_movie_stats_top_movie_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_movie_completion_title" title="Title stating the completion of the seen movie.">Movie completion title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_movie_completion_title" name="get_user_movie_stats_movie_completion_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_movie_completion_title_plural" title="Title stating the average completion of the seen movies.">Movies average completion title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_movie_completion_title_plural" name="get_user_movie_stats_movie_completion_title_plural" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_movie_completion_subtitle" title="Subtitle underneath the movie-completion title.">Movies/movie completion subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_movie_completion_subtitle" name="get_user_movie_stats_movie_completion_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="plural">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_title" title="Title of the paused movie section.">Movie paused title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_title" name="get_user_movie_stats_pause_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_subtitle" title="Subtitle of the paused movie section.">Movie paused subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_subtitle" name="get_user_movie_stats_pause_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';
        
        html += '<div class="form_block" id="singular">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_title_one" title="Title of the paused movie section when one movie was watched, but still paused.">One movie paused title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_title_one" name="get_user_movie_stats_pause_title_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_subtitle_one" title="Subtitle of the paused movie section when one movie was watched, but still paused paused.">One movie paused subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_subtitle_one" name="get_user_movie_stats_pause_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="none">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_title_none" title="Title of the paused movie section when no movies were ever paused.">No movie paused title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_title_none" name="get_user_movie_stats_pause_title_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_subtitle_none" title="Subtitle of the paused movie section when no movies were ever paused.">No movie paused subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_subtitle_none" name="get_user_movie_stats_pause_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_title" title="Title of the oldest movie section.">Movie oldest title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_title" name="get_user_movie_stats_oldest_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle" title="Subtitle of the oldest movie section. Applied if the other spesfic ones are not applicable.">Movie oldest subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle" name="get_user_movie_stats_oldest_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle_pre_1950" title="Subtitle of the oldest movie section. Applied if movie is older than 1950.">Movie oldest subtitle (<1950):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle_pre_1950" name="get_user_movie_stats_oldest_subtitle_pre_1950" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle_pre_1975" title="Subtitle of the oldest movie section. Applied if movie is older than 1975.">Movie oldest subtitle (<1975):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle_pre_1975" name="get_user_movie_stats_oldest_subtitle_pre_1975" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle_pre_2000" title="Subtitle of the oldest movie section. Applied if movie is older than 2000.">Movie oldest subtitle (<2000):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle_pre_2000" name="get_user_movie_stats_oldest_subtitle_pre_2000" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_spent_title" title="Title of the time spent on movies section.">Movie spent title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_spent_title" name="get_user_movie_stats_spent_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" name="get_user_movie_stats_custom_button" id="get_user_movie_stats_custom_button" onclick="toggle_hidden_form(\'get_user_movie_stats_custom\')"><img src="./assets/tweak.svg" class="btn_logo"></img><p2 id="get_user_movie_stats_custom_button_text">Custom text</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
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
    html += '<label for="get_user_show_stats_buddy" title="Includes the users top show-buddy in your wrapped period. Requires show stats.">Get users show-buddy:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_show_stats_buddy" ';
    if(get_user_show_stats_buddy) {
        html += 'checked="' + get_user_show_stats_buddy + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '</div>';

    html += '<div class="form_hidden" id="get_user_show_stats_custom">';

        html += '<div class="form_block" id="plural">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_title" title="Title on top of this section.">Shows title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_title" name="get_user_show_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subtitle" title="Subtitle underneath title on top of this section.">Shows subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subtitle" name="get_user_show_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Shows sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subsubtitle" name="get_user_show_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="singular">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subtitle_one" title="Subtitle underneath title on top of this section.">Shows subtitle for one show:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subtitle_one" name="get_user_show_stats_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subsubtitle_one" title="Sub-subtitle underneath subtitle on top of this section.">Shows sub-subtitle for one show:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subsubtitle_one" name="get_user_show_stats_subsubtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subtitle_none" title="Subtitle underneath title on top of this section.">Shows subtitle for no shows:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subtitle_none" name="get_user_show_stats_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subsubtitle_none" title="Sub-subtitle underneath subtitle on top of this section.">Shows sub-subtitle for no shows:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subsubtitle_none" name="get_user_show_stats_subsubtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_top_show" title="Custom title of the list of top show (singular).">Title of top show list:<br>';
            html += '<input type="text" class="form-control" id="get_user_show_stats_top_show" value="' + get_user_show_stats_top_show + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_top_show_plural" title="Custom title of the list of top shows (plural).">Title of top shows list:<br>';
            html += '<input type="text" class="form-control" id="get_user_show_stats_top_show_plural" value="' + get_user_show_stats_top_show_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_most_played_title" title="Title on top of this section showing the top played episode.">Shows title for top episode:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_most_played_title" name="get_user_show_stats_most_played_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_most_played_subtitle" title="Subtitle underneath the title of this section.">Shows subtitle for top episode:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_most_played_subtitle" name="get_user_show_stats_most_played_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_title" title="Title on top of this section showing the top show and the buddy who watches it as well.">Shows title buddy section:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_title" name="get_user_show_stats_buddy_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_subtitle" title="Subtitle underneath the title of this section.">Shows subtitle buddy section:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_subtitle" name="get_user_show_stats_buddy_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_title_none" title="Title on top of this section showing the top show and the buddy who watches it as well, only, no buddy could be found.">Shows title buddy section (none):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_title_none" name="get_user_show_stats_buddy_title_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_subtitle_none" title="Subtitle underneath the title of this section.">Shows subtitle buddy section (none):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_subtitle_none" name="get_user_show_stats_buddy_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_spent_title" title="Title of the time spent on shows section.">Show spent title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_spent_title" name="get_user_show_stats_spent_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';


    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" name="get_user_show_stats_custom_button" id="get_user_show_stats_custom_button" onclick="toggle_hidden_form(\'get_user_show_stats_custom\')"><img src="./assets/tweak.svg" class="btn_logo"></img><p2 id="get_user_show_stats_custom_button_text">Custom text</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<label for="get_user_music_stats" title="Includes music statistics in your wrapped period.">Get users music statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_music_stats" ';
    if(get_user_music_stats) {
        html += 'checked="' + get_user_music_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form_hidden" id="get_user_music_stats_custom">';

        html += '<div class="form_block">';
        
            html += '<div class="form-group" id="plural">';
            html += '<label for="get_user_music_stats_title" title="Title on top of this section.">Music title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_title" name="get_user_music_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subtitle" title="Subtitle underneath title on top of this section.">Music subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subtitle" name="get_user_music_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Music sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subsubtitle" name="get_user_music_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="singular">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subtitle_one" title="Subtitle underneath title on top of this section.">Music subtitle for one track:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subtitle_one" name="get_user_music_stats_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subsubtitle_one" title="Sub-subtitle underneath subtitle on top of this section.">Music sub-subtitle for one track:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subsubtitle_one" name="get_user_music_stats_subsubtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subtitle_none" title="Subtitle underneath title on top of this section.">Music subtitle for no tracks:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subtitle_none" name="get_user_music_stats_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subsubtitle_none" title="Sub-subtitle underneath subtitle on top of this section.">Music sub-subtitle for no tracks:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subsubtitle_none" name="get_user_music_stats_subsubtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="singular">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_track" title="Custom title of the list of top track (singular).">Title of top track list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_track" value="' + get_user_music_stats_top_track + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="plural">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_track_plural" title="Custom title of the list of top tracks (plural).">Title of top tracks list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_track_plural" value="' + get_user_music_stats_top_track_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_album_plural" title="Custom title of the list of top albums (plural).">Title of top albums list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_album_plural" value="' + get_user_music_stats_top_album_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_artist_plural" title="Custom title of the list of top artists (plural).">Title of top artists list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_artist_plural" value="' + get_user_music_stats_top_artist_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_oldest_album_title" title="Title on top of this section.">Music title for oldest album:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_oldest_album_title" name="get_user_music_stats_oldest_album_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_oldest_album_subtitle" title="Subtitle underneath title of this section.">Music subtitle for oldest album:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_oldest_album_subtitle" name="get_user_music_stats_oldest_album_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_spent_title" title="Title on top of this section showing time spent listening to music.">Music spent title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_spent_title" name="get_user_music_stats_spent_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_spent_subtitle" title="Subtitle underneath title of this section.">Music spent subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_spent_subtitle" name="get_user_music_stats_spent_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" name="get_user_music_stats_custom_button" id="get_user_music_stats_custom_button" onclick="toggle_hidden_form(\'get_user_music_stats_custom\')"><img src="./assets/tweak.svg" class="btn_logo"></img><p2 id="get_user_music_stats_custom_button_text">Custom text</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

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

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_leaderboard_numbers" title="Displays the statistics of users on the leaderboard.">Display server-wide leaderboard numbers:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_leaderboard_numbers" ';
    if(get_year_stats_leaderboard_numbers) {
        html += 'checked="' + get_year_stats_leaderboard_numbers + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '</div>';

    html += '<div class="form_hidden" id="get_year_stats_custom">';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_year_stats_title" title="Title on top of this section.">Server-wide title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_title" name="get_year_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_subtitle" title="Subtitle underneath title on top of this section.">Server-wide subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_subtitle" name="get_year_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Server-wide sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_subsubtitle" name="get_year_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="">';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_movies_title" title="Custom title of the list of top movies.">Title of top movies list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_movies_title" value="' + get_year_stats_movies_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_shows_title" title="Custom title of the list of top shows.">Title of top shows list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_shows_title" value="' + get_year_stats_shows_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_music_title" title="Custom title of the list of top artists.">Title of top artists list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_music_title" value="' + get_year_stats_music_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_leaderboard_title" title="Custom title of the list of top users.">Title of top users list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_leaderboard_title" value="' + get_year_stats_leaderboard_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_year_stats_movies_duration_title" title="Title on top of this section showing duration spent on movies.">Server-wide movie duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_movies_duration_title" name="get_year_stats_movies_duration_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_shows_duration_title" title="Title on top of this section showing duration spent on shows.">Server-wide show duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_shows_duration_title" name="get_year_stats_shows_duration_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_music_duration_title" title="Title on top of this section showing duration spent on music.">Server-wide music duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_music_duration_title" name="get_year_stats_music_duration_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_duration_sum_title" title="Title on top of this section showing duration spent on all categories.">Server-wide content duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_duration_sum_title" name="get_year_stats_duration_sum_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" name="get_year_stats_custom_button" id="get_year_stats_custom_button" onclick="toggle_hidden_form(\'get_year_stats_custom\')"><img src="./assets/tweak.svg" class="btn_logo"></img><p2 id="get_year_stats_custom_button_text">Custom text</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_outro_title" title="Title that is shown at the bottom, when the statistics are done.">Outro title for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_outro_title" name="stats_outro_title" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_outro_subtitle" title="Subtitle that is shown at the bottom, when the statistics are done.">Outro subtitle for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_outro_subtitle" name="stats_outro_subtitle" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form_hidden" id="wrapperr_language">';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_and" title="Word alternative for when \'and\' appears.">Alternative for \'and\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_and" value="' + wrapperr_and + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_play" title="Word alternative for when \'play\' appears.">Alternative for \'play\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_play" value="' + wrapperr_play + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_play_plural" title="Word alternative for when \'plays\' appears.">Alternative for \'plays\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_play_plural" value="' + wrapperr_play_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_day" title="Word alternative for when \'day\' appears.">Alternative for \'day\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_day" value="' + wrapperr_day + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_day_plural" title="Word alternative for when \'days\' appears.">Alternative for \'days\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_day_plural" value="' + wrapperr_day_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_hour" title="Word alternative for when \'hour\' appears.">Alternative for \'hour\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_hour" value="' + wrapperr_hour + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_hour_plural" title="Word alternative for when \'hours\' appears.">Alternative for \'hours\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_hour_plural" value="' + wrapperr_hour_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_minute" title="Word alternative for when \'minute\' appears.">Alternative for \'minute\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_minute" value="' + wrapperr_minute + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_minute_plural" title="Word alternative for when \'minutes\' appears.">Alternative for \'minutes\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_minute_plural" value="' + wrapperr_minute_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_second" title="Word alternative for when \'second\' appears.">Alternative for \'second\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_second" value="' + wrapperr_second + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_second_plural" title="Word alternative for when \'seconds\' appears.">Alternative for \'seconds\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_second_plural" value="' + wrapperr_second_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_sort_plays" title="Text alternative for \'Sort by plays\' button.">\'Sort by plays\' alternative:<br>';
            html += '<input type="text" class="form-control" id="wrapperr_sort_plays" value="' + wrapperr_sort_plays + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_sort_duration" title="Text alternative for \'Sort by duration\' button.">\'Sort by duration\' alternative:<br>';
            html += '<input type="text" class="form-control" id="wrapperr_sort_duration" value="' + wrapperr_sort_duration + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button class="form-control btn" name="wrapperr_language_button" id="get_user_show_stats_custom_button" onclick="toggle_hidden_form(\'wrapperr_language\')"><img src="./assets/tweak.svg" class="btn_logo"></img><p2 id="wrapperr_language_button_text">Custom language</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<div class="warning">!<br>Many of the settings here need a clean cache to be applied.</div>';
    html += '</div>';

    html += '<div class="form-group newline" title="Clear the cache now to include the newest settings.">';
    html += '<label for="clear_cache">Clear cache now:<br>';
    html += '<input type="checkbox" class="form-control" id="clear_cache" checked /></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<button type="submit" class="form-control btn" onclick="set_wrapperr_customization_call();" id="set_wrapperr_customization_form_button"><img src="./assets/done.svg" class="btn_logo"></img><p2 id="set_wrapperr_customization_form_button_text">Save</p2></button>';
    html += '</div>';

    html += '</form>';

    // Place content from config
    document.getElementById("setup").innerHTML = html;

    document.getElementById("wrapperr_front_page_title").value = wrapperr_front_page_title;
    document.getElementById("wrapperr_front_page_subtitle").value = wrapperr_front_page_subtitle;
    document.getElementById("stats_intro_title").value = stats_intro_title;
    document.getElementById("stats_intro_subtitle").value = stats_intro_subtitle;
    document.getElementById("stats_outro_title").value = stats_outro_title;
    document.getElementById("stats_outro_subtitle").value = stats_outro_subtitle;
    document.getElementById("stats_top_list_length").value = stats_top_list_length;

    document.getElementById("get_user_movie_stats_title").value = get_user_movie_stats_title;
    document.getElementById("get_user_movie_stats_subtitle").value = get_user_movie_stats_subtitle;
    document.getElementById("get_user_movie_stats_subsubtitle").value = get_user_movie_stats_subsubtitle;
    document.getElementById("get_user_movie_stats_subtitle_one").value = get_user_movie_stats_subtitle_one;
    document.getElementById("get_user_movie_stats_subsubtitle_one").value = get_user_movie_stats_subsubtitle_one;
    document.getElementById("get_user_movie_stats_subtitle_none").value = get_user_movie_stats_subtitle_none;
    document.getElementById("get_user_movie_stats_subsubtitle_none").value = get_user_movie_stats_subsubtitle_none;
    document.getElementById("get_user_movie_stats_movie_completion_title").value = get_user_movie_stats_movie_completion_title;
    document.getElementById("get_user_movie_stats_movie_completion_title_plural").value = get_user_movie_stats_movie_completion_title_plural;
    document.getElementById("get_user_movie_stats_movie_completion_subtitle").value = get_user_movie_stats_movie_completion_subtitle;
    document.getElementById("get_user_movie_stats_pause_title").value = get_user_movie_stats_pause_title;
    document.getElementById("get_user_movie_stats_pause_subtitle").value = get_user_movie_stats_pause_subtitle;
    document.getElementById("get_user_movie_stats_pause_title_one").value = get_user_movie_stats_pause_title_one;
    document.getElementById("get_user_movie_stats_pause_subtitle_one").value = get_user_movie_stats_pause_subtitle_one;
    document.getElementById("get_user_movie_stats_pause_title_none").value = get_user_movie_stats_pause_title_none;
    document.getElementById("get_user_movie_stats_pause_subtitle_none").value = get_user_movie_stats_pause_subtitle_none;
    document.getElementById("get_user_movie_stats_oldest_title").value = get_user_movie_stats_oldest_title;
    document.getElementById("get_user_movie_stats_oldest_subtitle").value = get_user_movie_stats_oldest_subtitle;
    document.getElementById("get_user_movie_stats_oldest_subtitle_pre_1950").value = get_user_movie_stats_oldest_subtitle_pre_1950;
    document.getElementById("get_user_movie_stats_oldest_subtitle_pre_1975").value = get_user_movie_stats_oldest_subtitle_pre_1975;
    document.getElementById("get_user_movie_stats_oldest_subtitle_pre_2000").value = get_user_movie_stats_oldest_subtitle_pre_2000;
    document.getElementById("get_user_movie_stats_spent_title").value = get_user_movie_stats_spent_title;

    document.getElementById("get_user_show_stats_title").value = get_user_show_stats_title;
    document.getElementById("get_user_show_stats_subtitle").value = get_user_show_stats_subtitle;
    document.getElementById("get_user_show_stats_subsubtitle").value = get_user_show_stats_subsubtitle;
    document.getElementById("get_user_show_stats_subtitle_one").value = get_user_show_stats_subtitle_one;
    document.getElementById("get_user_show_stats_subsubtitle_one").value = get_user_show_stats_subsubtitle_one;
    document.getElementById("get_user_show_stats_subtitle_none").value = get_user_show_stats_subtitle_none;
    document.getElementById("get_user_show_stats_subsubtitle_none").value = get_user_show_stats_subsubtitle_none;
    document.getElementById("get_user_show_stats_most_played_title").value = get_user_show_stats_most_played_title;
    document.getElementById("get_user_show_stats_most_played_subtitle").value = get_user_show_stats_most_played_subtitle;
    document.getElementById("get_user_show_stats_buddy_title").value = get_user_show_stats_buddy_title;
    document.getElementById("get_user_show_stats_buddy_subtitle").value = get_user_show_stats_buddy_subtitle;
    document.getElementById("get_user_show_stats_buddy_title_none").value = get_user_show_stats_buddy_title_none;
    document.getElementById("get_user_show_stats_buddy_subtitle_none").value = get_user_show_stats_buddy_subtitle_none;
    document.getElementById("get_user_show_stats_spent_title").value = get_user_show_stats_spent_title;

    document.getElementById("get_user_music_stats_title").value = get_user_music_stats_title;
    document.getElementById("get_user_music_stats_subtitle").value = get_user_music_stats_subtitle;
    document.getElementById("get_user_music_stats_subsubtitle").value = get_user_music_stats_subsubtitle;
    document.getElementById("get_user_music_stats_subtitle_one").value = get_user_music_stats_subtitle_one;
    document.getElementById("get_user_music_stats_subsubtitle_one").value = get_user_music_stats_subsubtitle_one;
    document.getElementById("get_user_music_stats_subtitle_none").value = get_user_music_stats_subtitle_none;
    document.getElementById("get_user_music_stats_subsubtitle_none").value = get_user_music_stats_subsubtitle_none;
    document.getElementById("get_user_music_stats_spent_title").value = get_user_music_stats_spent_title;
    document.getElementById("get_user_music_stats_spent_subtitle").value = get_user_music_stats_spent_subtitle;
    document.getElementById("get_user_music_stats_oldest_album_title").value = get_user_music_stats_oldest_album_title;
    document.getElementById("get_user_music_stats_oldest_album_subtitle").value = get_user_music_stats_oldest_album_subtitle;

    document.getElementById("get_year_stats_title").value = get_year_stats_title;
    document.getElementById("get_year_stats_subtitle").value = get_year_stats_subtitle;
    document.getElementById("get_year_stats_subsubtitle").value = get_year_stats_subsubtitle;
    document.getElementById("get_year_stats_movies_duration_title").value = get_year_stats_movies_duration_title;
    document.getElementById("get_year_stats_shows_duration_title").value = get_year_stats_shows_duration_title;
    document.getElementById("get_year_stats_music_duration_title").value = get_year_stats_music_duration_title;
    document.getElementById("get_year_stats_duration_sum_title").value = get_year_stats_duration_sum_title;

}

function toggle_hidden_form(div_id) {
    var div = document.getElementById(div_id);
    if(div.className === "form_shown") {
        div.classList.remove('form_shown');
        div.classList.add('form_hidden');
    } else {
        div.classList.remove('form_hidden');
        div.classList.add('form_shown');
    }
}

function set_wrapperr_customization_call() {

    document.getElementById("set_wrapperr_customization_form_button").disabled = true;
    document.getElementById("set_wrapperr_customization_form_button").style.opacity = '0.5';

    wrapperr_front_page_title = document.getElementById('wrapperr_front_page_title').value;
    wrapperr_front_page_subtitle = document.getElementById('wrapperr_front_page_subtitle').value;
    stats_intro_title = document.getElementById('stats_intro_title').value;
    stats_intro_subtitle = document.getElementById('stats_intro_subtitle').value;
    stats_outro_title = document.getElementById('stats_outro_title').value;
    stats_outro_subtitle = document.getElementById('stats_outro_subtitle').value;
    stats_order_by_plays = document.getElementById('stats_order_by_plays').checked;
    stats_order_by_duration = document.getElementById('stats_order_by_duration').checked;
    stats_top_list_length = parseInt(document.getElementById("stats_top_list_length").value);

    get_user_movie_stats = document.getElementById('get_user_movie_stats').checked;
    get_user_movie_stats_title = document.getElementById('get_user_movie_stats_title').value;
    get_user_movie_stats_subtitle = document.getElementById('get_user_movie_stats_subtitle').value;
    get_user_movie_stats_subsubtitle = document.getElementById('get_user_movie_stats_subsubtitle').value;
    get_user_movie_stats_subtitle_one = document.getElementById('get_user_movie_stats_subtitle_one').value;
    get_user_movie_stats_subsubtitle_one = document.getElementById('get_user_movie_stats_subsubtitle_one').value;
    get_user_movie_stats_subtitle_none = document.getElementById('get_user_movie_stats_subtitle_none').value;
    get_user_movie_stats_subsubtitle_none = document.getElementById('get_user_movie_stats_subsubtitle_none').value;
    get_user_movie_stats_top_movie = document.getElementById('get_user_movie_stats_top_movie').value;
    get_user_movie_stats_top_movie_plural = document.getElementById('get_user_movie_stats_top_movie_plural').value;
    get_user_movie_stats_movie_completion_title = document.getElementById('get_user_movie_stats_movie_completion_title').value;
    get_user_movie_stats_movie_completion_title_plural = document.getElementById('get_user_movie_stats_movie_completion_title_plural').value;
    get_user_movie_stats_movie_completion_subtitle = document.getElementById('get_user_movie_stats_movie_completion_subtitle').value;
    get_user_movie_stats_pause_title = document.getElementById('get_user_movie_stats_pause_title').value;
    get_user_movie_stats_pause_subtitle = document.getElementById('get_user_movie_stats_pause_subtitle').value;
    get_user_movie_stats_pause_title_one = document.getElementById('get_user_movie_stats_pause_title_one').value;
    get_user_movie_stats_pause_subtitle_one = document.getElementById('get_user_movie_stats_pause_subtitle_one').value;
    get_user_movie_stats_pause_title_none = document.getElementById('get_user_movie_stats_pause_title_none').value;
    get_user_movie_stats_pause_subtitle_none = document.getElementById('get_user_movie_stats_pause_subtitle_none').value;
    get_user_movie_stats_oldest_title = document.getElementById('get_user_movie_stats_oldest_title').value;
    get_user_movie_stats_oldest_subtitle = document.getElementById('get_user_movie_stats_oldest_subtitle').value;
    get_user_movie_stats_oldest_subtitle_pre_1950 = document.getElementById('get_user_movie_stats_oldest_subtitle_pre_1950').value;
    get_user_movie_stats_oldest_subtitle_pre_1975 = document.getElementById('get_user_movie_stats_oldest_subtitle_pre_1975').value;
    get_user_movie_stats_oldest_subtitle_pre_2000 = document.getElementById('get_user_movie_stats_oldest_subtitle_pre_2000').value;
    get_user_movie_stats_spent_title = document.getElementById('get_user_movie_stats_spent_title').value;

    get_user_show_stats = document.getElementById('get_user_show_stats').checked;
    get_user_show_stats_buddy = document.getElementById('get_user_show_stats_buddy').checked;
    get_user_show_stats_title = document.getElementById('get_user_show_stats_title').value;
    get_user_show_stats_subtitle = document.getElementById('get_user_show_stats_subtitle').value;
    get_user_show_stats_subsubtitle = document.getElementById('get_user_show_stats_subsubtitle').value;
    get_user_show_stats_subtitle_one = document.getElementById('get_user_show_stats_subtitle_one').value;
    get_user_show_stats_subsubtitle_one = document.getElementById('get_user_show_stats_subsubtitle_one').value;
    get_user_show_stats_subtitle_none = document.getElementById('get_user_show_stats_subtitle_none').value;
    get_user_show_stats_subsubtitle_none = document.getElementById('get_user_show_stats_subsubtitle_none').value;
    get_user_show_stats_top_show = document.getElementById('get_user_show_stats_top_show').value;
    get_user_show_stats_top_show_plural = document.getElementById('get_user_show_stats_top_show_plural').value;
    get_user_show_stats_most_played_title = document.getElementById('get_user_show_stats_most_played_title').value;
    get_user_show_stats_most_played_subtitle = document.getElementById('get_user_show_stats_most_played_subtitle').value;
    get_user_show_stats_buddy_title = document.getElementById('get_user_show_stats_buddy_title').value;
    get_user_show_stats_buddy_subtitle = document.getElementById('get_user_show_stats_buddy_subtitle').value;
    get_user_show_stats_buddy_title_none = document.getElementById('get_user_show_stats_buddy_title_none').value;
    get_user_show_stats_buddy_subtitle_none = document.getElementById('get_user_show_stats_buddy_subtitle_none').value;
    get_user_show_stats_spent_title = document.getElementById('get_user_show_stats_spent_title').value;

    get_user_music_stats = document.getElementById('get_user_music_stats').checked;
    get_user_music_stats_title = document.getElementById('get_user_music_stats_title').value;
    get_user_music_stats_subtitle = document.getElementById('get_user_music_stats_subtitle').value;
    get_user_music_stats_subsubtitle = document.getElementById('get_user_music_stats_subsubtitle').value;
    get_user_music_stats_subtitle_one = document.getElementById('get_user_music_stats_subtitle_one').value;
    get_user_music_stats_subsubtitle_one = document.getElementById('get_user_music_stats_subsubtitle_one').value;
    get_user_music_stats_subtitle_none = document.getElementById('get_user_music_stats_subtitle_none').value;
    get_user_music_stats_subsubtitle_none = document.getElementById('get_user_music_stats_subsubtitle_none').value;
    get_user_music_stats_top_track = document.getElementById('get_user_music_stats_top_track').value;
    get_user_music_stats_top_track_plural = document.getElementById('get_user_music_stats_top_track_plural').value;
    get_user_music_stats_top_album_plural = document.getElementById('get_user_music_stats_top_album_plural').value;
    get_user_music_stats_top_artist_plural = document.getElementById('get_user_music_stats_top_artist_plural').value;
    get_user_music_stats_spent_title = document.getElementById('get_user_music_stats_spent_title').value;
    get_user_music_stats_spent_subtitle = document.getElementById('get_user_music_stats_spent_subtitle').value;
    get_user_music_stats_oldest_album_title = document.getElementById('get_user_music_stats_oldest_album_title').value;
    get_user_music_stats_oldest_album_subtitle = document.getElementById('get_user_music_stats_oldest_album_subtitle').value;

    get_year_stats_title = document.getElementById('get_year_stats_title').value;
    get_year_stats_subtitle = document.getElementById('get_year_stats_subtitle').value;
    get_year_stats_subsubtitle = document.getElementById('get_year_stats_subsubtitle').value;
    get_year_stats_movies = document.getElementById('get_year_stats_movies').checked;
    get_year_stats_movies_title = document.getElementById('get_year_stats_movies_title').value;
    get_year_stats_movies_duration_title = document.getElementById('get_year_stats_movies_duration_title').value;
    get_year_stats_shows = document.getElementById('get_year_stats_shows').checked;
    get_year_stats_shows_title = document.getElementById('get_year_stats_shows_title').value;
    get_year_stats_shows_duration_title = document.getElementById('get_year_stats_shows_duration_title').value;
    get_year_stats_music = document.getElementById('get_year_stats_music').checked;
    get_year_stats_music_title = document.getElementById('get_year_stats_music_title').value;
    get_year_stats_music_duration_title = document.getElementById('get_year_stats_music_duration_title').value;
    get_year_stats_leaderboard = document.getElementById('get_year_stats_leaderboard').checked;
    get_year_stats_leaderboard_numbers = document.getElementById('get_year_stats_leaderboard_numbers').checked;
    get_year_stats_leaderboard_title = document.getElementById('get_year_stats_leaderboard_title').value;
    get_year_stats_duration_sum_title = document.getElementById('get_year_stats_duration_sum_title').value;
    clear_cache = document.getElementById('clear_cache').checked;

    wrapperr_and = document.getElementById("wrapperr_and").value;
    wrapperr_play = document.getElementById("wrapperr_play").value;
    wrapperr_play_plural = document.getElementById("wrapperr_play_plural").value;
    wrapperr_day = document.getElementById("wrapperr_day").value;
    wrapperr_day_plural = document.getElementById("wrapperr_day_plural").value;
    wrapperr_hour = document.getElementById("wrapperr_hour").value;
    wrapperr_hour_plural = document.getElementById("wrapperr_hour_plural").value;
    wrapperr_minute = document.getElementById("wrapperr_minute").value;
    wrapperr_minute_plural = document.getElementById("wrapperr_minute_plural").value;
    wrapperr_second = document.getElementById("wrapperr_second").value;
    wrapperr_second_plural = document.getElementById("wrapperr_second_plural").value;
    wrapperr_sort_plays = document.getElementById("wrapperr_sort_plays").value;
    wrapperr_sort_duration = document.getElementById("wrapperr_sort_duration").value;
    
    wrapperr_customization_form = {
                                "clear_cache" : clear_cache,
                                "data_type" : "wrapperr_customize",
                                "tautulli_config" : [],
                                "wrapperr_data" : {},
                                "wrapperr_customize" : {
                                    "wrapperr_front_page_title" : wrapperr_front_page_title,
                                    "wrapperr_front_page_subtitle" : wrapperr_front_page_subtitle,
                                    "stats_intro_title" : stats_intro_title,
                                    "stats_intro_subtitle" : stats_intro_subtitle,
                                    "stats_outro_title" : stats_outro_title,
                                    "stats_outro_subtitle" : stats_outro_subtitle,
                                    "stats_order_by_plays" : stats_order_by_plays,
                                    "stats_order_by_duration" : stats_order_by_duration,
                                    "stats_top_list_length" : stats_top_list_length,
                                    "get_user_movie_stats" : get_user_movie_stats,
                                    "get_user_movie_stats_title" : get_user_movie_stats_title,
                                    "get_user_movie_stats_subtitle" : get_user_movie_stats_subtitle,
                                    "get_user_movie_stats_subsubtitle" : get_user_movie_stats_subsubtitle,
                                    "get_user_movie_stats_subtitle_one" : get_user_movie_stats_subtitle_one,
                                    "get_user_movie_stats_subsubtitle_one" : get_user_movie_stats_subsubtitle_one,
                                    "get_user_movie_stats_subtitle_none" : get_user_movie_stats_subtitle_none,
                                    "get_user_movie_stats_subsubtitle_none" : get_user_movie_stats_subsubtitle_none,
                                    "get_user_movie_stats_top_movie" : get_user_movie_stats_top_movie,
                                    "get_user_movie_stats_top_movie_plural" : get_user_movie_stats_top_movie_plural,
                                    "get_user_movie_stats_movie_completion_title" : get_user_movie_stats_movie_completion_title,
                                    "get_user_movie_stats_movie_completion_title_plural" : get_user_movie_stats_movie_completion_title_plural,
                                    "get_user_movie_stats_movie_completion_subtitle" : get_user_movie_stats_movie_completion_subtitle,
                                    "get_user_movie_stats_pause_title" : get_user_movie_stats_pause_title,
                                    "get_user_movie_stats_pause_subtitle" : get_user_movie_stats_pause_subtitle,
                                    "get_user_movie_stats_pause_title_one" : get_user_movie_stats_pause_title_one,
                                    "get_user_movie_stats_pause_subtitle_one" : get_user_movie_stats_pause_subtitle_one,
                                    "get_user_movie_stats_pause_title_none" : get_user_movie_stats_pause_title_none,
                                    "get_user_movie_stats_pause_subtitle_none" : get_user_movie_stats_pause_subtitle_none,
                                    "get_user_movie_stats_oldest_title" : get_user_movie_stats_oldest_title,
                                    "get_user_movie_stats_oldest_subtitle" : get_user_movie_stats_oldest_subtitle,
                                    "get_user_movie_stats_oldest_subtitle_pre_1950" : get_user_movie_stats_oldest_subtitle_pre_1950,
                                    "get_user_movie_stats_oldest_subtitle_pre_1975" : get_user_movie_stats_oldest_subtitle_pre_1975,
                                    "get_user_movie_stats_oldest_subtitle_pre_2000" : get_user_movie_stats_oldest_subtitle_pre_2000,
                                    "get_user_movie_stats_spent_title" : get_user_movie_stats_spent_title,
                                    "get_user_show_stats" : get_user_show_stats,
                                    "get_user_show_stats_buddy" : get_user_show_stats_buddy,
                                    "get_user_show_stats_title" : get_user_show_stats_title,
                                    "get_user_show_stats_subtitle" : get_user_show_stats_subtitle,
                                    "get_user_show_stats_subsubtitle" : get_user_show_stats_subsubtitle,
                                    "get_user_show_stats_subtitle_one" : get_user_show_stats_subtitle_one,
                                    "get_user_show_stats_subsubtitle_one" : get_user_show_stats_subsubtitle_one,
                                    "get_user_show_stats_subtitle_none" : get_user_show_stats_subtitle_none,
                                    "get_user_show_stats_subsubtitle_none" : get_user_show_stats_subsubtitle_none,
                                    "get_user_show_stats_top_show" : get_user_show_stats_top_show,
                                    "get_user_show_stats_top_show_plural" : get_user_show_stats_top_show_plural,
                                    "get_user_show_stats_spent_title" : get_user_show_stats_spent_title,
                                    "get_user_show_stats_most_played_title" : get_user_show_stats_most_played_title,
                                    "get_user_show_stats_most_played_subtitle" : get_user_show_stats_most_played_subtitle,
                                    "get_user_show_stats_buddy_title" : get_user_show_stats_buddy_title,
                                    "get_user_show_stats_buddy_subtitle" : get_user_show_stats_buddy_subtitle,
                                    "get_user_show_stats_buddy_title_none" : get_user_show_stats_buddy_title_none,
                                    "get_user_show_stats_buddy_subtitle_none" : get_user_show_stats_buddy_subtitle_none,
                                    "get_user_music_stats" : get_user_music_stats,
                                    "get_user_music_stats_title" : get_user_music_stats_title,
                                    "get_user_music_stats_subtitle" : get_user_music_stats_subtitle,
                                    "get_user_music_stats_subsubtitle" : get_user_music_stats_subsubtitle,
                                    "get_user_music_stats_subtitle_one" : get_user_music_stats_subtitle_one,
                                    "get_user_music_stats_subsubtitle_one" : get_user_music_stats_subsubtitle_one,
                                    "get_user_music_stats_subtitle_none" : get_user_music_stats_subtitle_none,
                                    "get_user_music_stats_subsubtitle_none" : get_user_music_stats_subsubtitle_none,
                                    "get_user_music_stats_top_track" : get_user_music_stats_top_track,
                                    "get_user_music_stats_top_track_plural" : get_user_music_stats_top_track_plural,
                                    "get_user_music_stats_top_album_plural" : get_user_music_stats_top_album_plural,
                                    "get_user_music_stats_top_artist_plural" : get_user_music_stats_top_artist_plural,
                                    "get_user_music_stats_spent_title" : get_user_music_stats_spent_title,
                                    "get_user_music_stats_spent_subtitle" : get_user_music_stats_spent_subtitle,
                                    "get_user_music_stats_oldest_album_title" : get_user_music_stats_oldest_album_title,
                                    "get_user_music_stats_oldest_album_subtitle" : get_user_music_stats_oldest_album_subtitle,
                                    "get_year_stats_title" : get_year_stats_title,
                                    "get_year_stats_subtitle" : get_year_stats_subtitle,
                                    "get_year_stats_subsubtitle" : get_year_stats_subsubtitle,
                                    "get_year_stats_movies" : get_year_stats_movies,
                                    "get_year_stats_movies_title" : get_year_stats_movies_title,
                                    "get_year_stats_movies_duration_title" : get_year_stats_movies_duration_title,
                                    "get_year_stats_shows" : get_year_stats_shows,
                                    "get_year_stats_shows_title" : get_year_stats_shows_title,
                                    "get_year_stats_shows_duration_title" : get_year_stats_shows_duration_title,
                                    "get_year_stats_music" : get_year_stats_music,
                                    "get_year_stats_music_title" : get_year_stats_music_title,
                                    "get_year_stats_music_duration_title" : get_year_stats_music_duration_title,
                                    "get_year_stats_leaderboard" : get_year_stats_leaderboard,
                                    "get_year_stats_leaderboard_numbers" : get_year_stats_leaderboard_numbers,
                                    "get_year_stats_leaderboard_title" : get_year_stats_leaderboard_title,
                                    "get_year_stats_duration_sum_title" : get_year_stats_duration_sum_title,
                                    "wrapperr_and" : wrapperr_and,
                                    "wrapperr_play" : wrapperr_play,
                                    "wrapperr_play_plural" : wrapperr_play_plural,
                                    "wrapperr_day" : wrapperr_day,
                                    "wrapperr_day_plural" : wrapperr_day_plural,
                                    "wrapperr_hour" : wrapperr_hour,
                                    "wrapperr_hour_plural" : wrapperr_hour_plural,
                                    "wrapperr_minute" : wrapperr_minute,
                                    "wrapperr_minute_plural" : wrapperr_minute_plural,
                                    "wrapperr_second" : wrapperr_second,
                                    "wrapperr_second_plural" : wrapperr_second_plural,
                                    "wrapperr_sort_plays" : wrapperr_sort_plays,
                                    "wrapperr_sort_duration" : wrapperr_sort_duration
                                }
                            };

    var wrapperr_customization_data = JSON.stringify(wrapperr_customization_form);

    // Debug line
    // console.log(wrapperr_customization_data);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Response: ' + this.responseText);
                document.getElementById("set_wrapperr_customization_form_button").disabled = false;
                document.getElementById("set_wrapperr_customization_form_button").style.opacity = '1';
                return;
            }
            
            if(result.error) {
                alert(result.message);
                document.getElementById("set_wrapperr_customization_form_button").disabled = false;
                document.getElementById("set_wrapperr_customization_form_button").style.opacity = '1';
            } else {
                get_config(get_cookie('wrapperr-admin'));
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "set/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(wrapperr_customization_data);
    return;
}

function caching_menu() {

    var html = '<div class="form-group newline">';
    html += '<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="get_config(get_cookie(\'wrapperr-admin\'));"><img src="./assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    var min_day_length = 1;
    if(tautulli.length > 1) {
        min_day_length = tautulli.length + 1 
    }

    html += `
        <form id='stats_form' class='form' onsubmit='event.preventDefault(); cache_initiate();' action="" method="post">

            <div class='form-group newline'>
                <h3>
                    Caching Tautulli data for later use to prevent long load times.
                </h3>

                <div class="form_hidden" id="caching_desc">
                    <p style="font-size:1em;">
                        When you configured a wrapped period, you set the number of days to process. Each unique day in that period is a new API request to Tautulli, which holds the data which needs processing. 
                        <br>
                        <br>
                        Wrapperr can cache data from Tautulli to decrease load times, but it needs to be loaded once. If the time frame is long this can take several minutes. Instead of loading your own stats, you can perform caching here. Afterward, everything is cached and saved. Only additional/new data is downloaded on future Wrapperr usage.
                        <br>
                        <br>
                        The loop used on this page ensures the cache is saved after a certain amount of days are downloaded. If the value below is set to 50, it will save the cache for every 50 days downloaded.
                        <br>
                        <br>
                    </p>
                </div>

                <div class="form-group newline">
                    <button class="form-control btn" name="get_user_show_stats_custom_button" id="get_user_show_stats_custom_button" onclick="toggle_hidden_form(\'caching_desc\')"><img src="./assets/about.svg" class="btn_logo"></img><p2 id="get_user_show_stats_custom_button_text">Info</p2></button>
                </div>
            </div>

            <div class='form-group newline'>

                <label for="days" title="">Days between safety-save of cache:</label>
                <input type="number" class='form-control' name="days" id="days" min='` + min_day_length + `' value='50' autocomplete="off" required />

            </div>

            <div class="form-group newline">
                <button class="form-control btn" type="submit" name="cache_button" id="cache_button"><img src="./assets/download.svg" class="btn_logo"></img><p2 id="cache_button_text">Cache</p2></button>
            </div>

            <div id="cache"></div>

        </form>
    `;

    document.getElementById("setup").innerHTML = html;
}

function add_to_cache_log(log_message, state, color) {
    var today = new Date();
    var time = pad_number(today.getHours(), 2) + ":" + pad_number(today.getMinutes(), 2) + ":" + pad_number(today.getSeconds(), 2);

    if(state) {
        style = 'color:' + color + ';';
    } else {
        style = '';
    }

    var tablerow = `
    <tr class='cacher-tr'>
        <td class='cacher-td'>` + time + `</td>
        <td class='cacher-td' style='` + style + `'>` + log_message + `</td>
    </tr>
    `;

    document.getElementById('cache_results_body').innerHTML += tablerow

}

function cache_initiate() {

    var days = parseInt(document.getElementById('days').value);

    var html = `
        <form id='stats_form' class='form' onsubmit='return false' action="" method="post">

            <div class='form-group newline'>
                <img id="loading_icon" src="./assets/loading.gif" style="border-radius: 25px; background-color: white; padding: 1em; width: 4em; height: 4em; display: inline;">
            </div>

            <h3>Caching log:</h3>

            <div id="cache_results" style="max-height: 15em; overflow-y: scroll;">
                <table class='cacher-table'>
                    <tbody id="cache_results_body"> 
                        <tr>
                            <th class='cacher-th' style='width: 25%'>Time</th>
                            <th class='cacher-th' style='width: 75%'>Message</th>
                        </tr>
                    </tbody>
                </table
            </div>


        </form>
        `;

    document.getElementById('cache').innerHTML = html;
	
    add_to_cache_log('Creating new cache request. Maximum ' + days + ' days.')

    get_stats(days);
}

function cache_log(days, result, complete) {

    if(result) {
        add_to_cache_log('Completed caching with a maximum of ' + days + ' days.', false, '');
    } else {
        add_to_cache_log('Error caching ' + days + ' days. Stopping.', true, 'var(--red)');
		document.getElementById('loading_icon').style.display = "none";
        document.getElementById("cache_button").disabled = false;
        document.getElementById("cache_button").style.opacity = '1';
    }
	
	if(complete) {
		add_to_cache_log('Finished caching request.', true, 'var(--green)');
		document.getElementById('loading_icon').style.display = "none";
        document.getElementById("cache_button").disabled = false;
        document.getElementById("cache_button").style.opacity = '1';
	} else {
		add_to_cache_log('Requesting new cache from Wrapperr. Maximum ' + days + ' days.', false, '');
	}

    var cache_results = document.getElementById("cache_results");
    cache_results.scrollTop = cache_results.scrollHeight;
}

function get_stats(days) {

    document.getElementById("cache_button").disabled = true;
    document.getElementById("cache_button").style.opacity = '0.5';

    stats_form = {
						"caching" : true,
						"cache_limit" : days
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                if(this.responseText.includes('Maximum execution time of')) {
                    cache_log(days, false, true);
                    document.getElementById("cache_button").disabled = false;
                    document.getElementById("cache_button").style.opacity = '1';
                    alert('PHP runtime was exceeded and stopped execution. Lower days cached to prevent this.');
                    console.log('Failed to parse API response. Error: ' + this.responseText);
                } else {
                    cache_log(days, false, true);
                    alert('Failed to parse API response.');
                    console.log('Failed to parse API response. Error: ' + this.responseText);
                    document.getElementById("cache_button").disabled = false;
                    document.getElementById("cache_button").style.opacity = '1';
                }
                return;
            }

            if(result.error) {
                alert(result.message);
                cache_log(days, false, true);
            } else {
                if(!result.data) {
                    cache_log(days, true, result.data);
                    get_stats(days);
                } else {
                    cache_log(days, true, result.data);
                }
            }
        }
        
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/statistics", );
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(stats_data);
    return;
}

function log_menu() {

    var html = '<div class="form-group newline">';
    html += '<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="get_config(get_cookie(\'wrapperr-admin\'));"><img src="./assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += `
        <form id='stats_form' class='form' onsubmit='return false' action="" method="post">

            <div class='form-group newline'>
                <h3>
                    Wrapperr log file
                </h3>

                <p id='log_result_text'>
                </p>

            </div>

            <div id="cache">
                <div id="log_results" style="max-height: 15em; overflow-y: scroll;">
                    <table class='log-table'>
                        <tbody id="log_results_body"> 
                            <tr>
                                <th class='log-th' style='width: 15%'>Date</th>
                                <th class='log-th' style='width: 15%'>Time</th>
                                <th class='log-th' style='width: 70%'>Message</th>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="form-group newline">
                <button class="form-control btn" name="log_button" id="log_button" onclick="get_log();" style="opacity: 0.5;" disabled><img src="./assets/synchronize.svg" class="btn_logo"></img><p2 id="cache_button_text">Refresh</p2></button>
            </div>

        </form>
    `;

    document.getElementById("setup").innerHTML = html;
    get_log();

}

function get_log() {

    document.getElementById("log_button").disabled = true;
    document.getElementById("log_button").style.opacity = '0.5';

    log_data_form = {};
    var log_data_data = JSON.stringify(log_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Error: ' + this.responseText);
                document.getElementById("log_button").disabled = false;
                document.getElementById("log_button").style.opacity = '1';
                return;
            }

            if(result.error) {
                document.getElementById("log_button").disabled = false;
                document.getElementById("log_button").style.opacity = '1';
                alert(result.message);
            } else {
                document.getElementById("log_button").disabled = false;
                document.getElementById("log_button").style.opacity = '1';
                log_form(result.data, result.limit);
            }
        }
        
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/log", );
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(log_data_data);
    return;
}

function log_form(log_lines_array, limit) {

    var log_table = `
    <tr>
        <th class='log-th' style='width: 15%'>Date</th>
        <th class='log-th' style='width: 15%'>Time</th>
        <th class='log-th' style='width: 70%'>Message</th>
    </tr>
    `;

    for(index = 0; index < log_lines_array.length; index++) {
        var tablerow = `
        <tr class='cacher-tr'>
            <td class='cacher-td'>` + log_lines_array[index].date + `</td>
            <td class='cacher-td'>` + log_lines_array[index].time + `</td>
            <td class='cacher-td'>` + log_lines_array[index].message + `</td>
        </tr>
        `;
        log_table += tablerow
    }
    
    document.getElementById('log_results_body').innerHTML = log_table
    document.getElementById('log_result_text').innerHTML = 'Retrieved last ' + limit + ' lines.';

    var log_results = document.getElementById("log_results");
    log_results.scrollTop = log_results.scrollHeight;
}

function test_tautulli_connection(tautulli_id) {
    document.getElementById("test_connection_" + tautulli_id).disabled = true;
    document.getElementById("test_connection_" + tautulli_id).style.opacity = '0.5';

    var button = document.getElementById('test_connection_' + tautulli_id);
    button.style.backgroundColor = 'lightgrey';

    https_temp = document.getElementById('tautulli_https_' + tautulli_id).checked;
    ip_temp = document.getElementById('tautulli_ip_' + tautulli_id).value;
    root_temp = document.getElementById('tautulli_root_' + tautulli_id).value;
    port_temp = parseInt(document.getElementById('tautulli_port_' + tautulli_id).value);
    api_temp = document.getElementById('tautulli_apikey_' + tautulli_id).value;

    config_form = {"tautulli_https" : https_temp, "tautulli_apikey" : api_temp, "tautulli_port" : port_temp, "tautulli_root" : root_temp, "tautulli_ip" : ip_temp};

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
                alert('Failed to parse API response.');
                button.style.backgroundColor = 'var(--red)';
                document.getElementById("test_connection_" + tautulli_id).disabled = false;
                document.getElementById("test_connection_" + tautulli_id).style.opacity = '1';
                return;
            }

            if(result.error) {
                button.style.backgroundColor = 'var(--red)';
                document.getElementById("test_connection_" + tautulli_id).disabled = false;
                document.getElementById("test_connection_" + tautulli_id).style.opacity = '1';
                alert(result.message);
                return
            }

            if(result.data) {
                button.style.backgroundColor = 'var(--green)';
                document.getElementById("test_connection_" + tautulli_id).disabled = false;
                document.getElementById("test_connection_" + tautulli_id).style.opacity = '1';
            } else {
                button.style.backgroundColor = 'var(--red)';
                document.getElementById("test_connection_" + tautulli_id).disabled = false;
                document.getElementById("test_connection_" + tautulli_id).style.opacity = '1';
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + 'get/tautulli-connection');
    xhttp.send(config_data);
}

function get_wrapper_version() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse Wrapperr version. Response: ' + this.responseText)
                alert("Failed to parse API response");
                return;
            }
            
            if(!result.error) {
                document.getElementById('github_link').innerHTML = 'GitHub (' + result.wrapperr_version + ')';

                if(result.application_name && result.application_name !== '') {
                    document.getElementById('application_name').innerHTML = result.application_name + ' Setup';
                    document.title = result.application_name;
                }

                if(result.wrapperr_root != "") {
                    api_url = window.location.origin + "/" + result.wrapperr_root + "/api/";
                    console.log("URL: " + api_url)
                }

                get_admin_state();
            }

        } else if(this.readyState == 4 && this.status !== 200) {
            var html = '<h2>' + this.status + ' Error</h2>';
            html += '<p>The API did not respond correctly.</p>';
            document.getElementById("setup").innerHTML = html;
        }
    };
    xhttp.withCredentials = true;

    // Get the root without "/admin"
    root = window.location.pathname.replace('/admin', '')

    // Maybe add trailing slash depending on the end of "window.location.origin"
    var trailingslash = ""
    if(window.location.origin.charAt(window.location.origin.length-1) != "/") {
        trailingslash = "/"
    }

    // Reach the API to get URL base
    xhttp.open("post", window.location.origin + "/" + root + trailingslash + "api/get/wrapperr-version");
    xhttp.send();
    return;
}

// Get admin configuration state
function get_admin_state() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
                return;
            }
            
            if(result.error) {
                console.log(result.message);
            } else if(!result.data) {
                first_time = true;
                set_password_form();
            } else {
                cookie = get_cookie('wrapperr-admin');

                if(cookie) {
                    validate_cookie_admin(cookie);
                } else {
                    login_menu();
                }
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/admin-state");
    xhttp.send();
    return;
}

// Validate admin login
function validate_cookie_admin(cookie) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
            }
            
            if(result.error) {
                set_cookie("wrapperr-admin", "", 1);
                login_menu();
                document.getElementById("password_login_form_error").innerHTML = result.message;
            } else {
                get_config(get_cookie('wrapperr-admin'));
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "validate/admin");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send();
    return;
}

// Get config for admin to configure
function get_config(cookie) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result = JSON.parse(this.responseText);
            }
            catch {
                alert("Failed to parse API response.");
                return;
            }
			
            if(result.error) {
                alert(result.message);
                location.reload();
            } else {
                tautulli = result.data.tautulli_config;

                timezone = result.data.timezone;
                create_share_links = result.data.create_share_links;
                plex_auth = result.data.plex_auth;
                use_cache = result.data.use_cache;
				use_logs = result.data.use_logs;
                clientID = result.data.clientID;
                wrapperr_root = result.data.wrapperr_root;
                application_name_str = result.data.application_name;
                application_url_str = result.data.application_url;
                winter_theme = result.data.winter_theme;

                wrapped_start = new Date(0);
                wrapped_start.setUTCSeconds(result.data.wrapped_start);

                wrapped_end = new Date(0);
                wrapped_end.setUTCSeconds(result.data.wrapped_end);

                stats_order_by_plays = result.data.wrapperr_customize.stats_order_by_plays;
                stats_order_by_duration = result.data.wrapperr_customize.stats_order_by_duration;

                wrapperr_front_page_title = result.data.wrapperr_customize.wrapperr_front_page_title;
                wrapperr_front_page_subtitle = result.data.wrapperr_customize.wrapperr_front_page_subtitle;
                stats_intro_title = result.data.wrapperr_customize.stats_intro_title;
                stats_intro_subtitle = result.data.wrapperr_customize.stats_intro_subtitle;
                stats_outro_title = result.data.wrapperr_customize.stats_outro_title;
                stats_outro_subtitle = result.data.wrapperr_customize.stats_outro_subtitle;
                stats_top_list_length = result.data.wrapperr_customize.stats_top_list_length;

                get_user_movie_stats = result.data.wrapperr_customize.get_user_movie_stats;
                get_user_movie_stats_title = result.data.wrapperr_customize.get_user_movie_stats_title;
                get_user_movie_stats_subtitle = result.data.wrapperr_customize.get_user_movie_stats_subtitle;
                get_user_movie_stats_subsubtitle = result.data.wrapperr_customize.get_user_movie_stats_subsubtitle;
                get_user_movie_stats_subtitle_one = result.data.wrapperr_customize.get_user_movie_stats_subtitle_one;
                get_user_movie_stats_subsubtitle_one = result.data.wrapperr_customize.get_user_movie_stats_subsubtitle_one;
                get_user_movie_stats_subtitle_none = result.data.wrapperr_customize.get_user_movie_stats_subtitle_none;
                get_user_movie_stats_subsubtitle_none = result.data.wrapperr_customize.get_user_movie_stats_subsubtitle_none;
                get_user_movie_stats_top_movie = result.data.wrapperr_customize.get_user_movie_stats_top_movie;
                get_user_movie_stats_top_movie_plural = result.data.wrapperr_customize.get_user_movie_stats_top_movie_plural;
                get_user_movie_stats_movie_completion_title = result.data.wrapperr_customize.get_user_movie_stats_movie_completion_title;
                get_user_movie_stats_movie_completion_title_plural = result.data.wrapperr_customize.get_user_movie_stats_movie_completion_title_plural;
                get_user_movie_stats_movie_completion_subtitle = result.data.wrapperr_customize.get_user_movie_stats_movie_completion_subtitle;
                get_user_movie_stats_pause_title = result.data.wrapperr_customize.get_user_movie_stats_pause_title;
                get_user_movie_stats_pause_subtitle = result.data.wrapperr_customize.get_user_movie_stats_pause_subtitle;
                get_user_movie_stats_pause_title_one = result.data.wrapperr_customize.get_user_movie_stats_pause_title_one;
                get_user_movie_stats_pause_subtitle_one = result.data.wrapperr_customize.get_user_movie_stats_pause_subtitle_one;
                get_user_movie_stats_pause_title_none = result.data.wrapperr_customize.get_user_movie_stats_pause_title_none;
                get_user_movie_stats_pause_subtitle_none = result.data.wrapperr_customize.get_user_movie_stats_pause_subtitle_none;
                get_user_movie_stats_oldest_title = result.data.wrapperr_customize.get_user_movie_stats_oldest_title;
                get_user_movie_stats_oldest_subtitle = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle;
                get_user_movie_stats_oldest_subtitle_pre_1950 = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle_pre_1950;
                get_user_movie_stats_oldest_subtitle_pre_1975 = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle_pre_1975;
                get_user_movie_stats_oldest_subtitle_pre_2000 = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle_pre_2000;
                get_user_movie_stats_spent_title = result.data.wrapperr_customize.get_user_movie_stats_spent_title;

                get_user_show_stats = result.data.wrapperr_customize.get_user_show_stats;
                get_user_show_stats_buddy = result.data.wrapperr_customize.get_user_show_stats_buddy;
                get_user_show_stats_title = result.data.wrapperr_customize.get_user_show_stats_title;
                get_user_show_stats_subtitle = result.data.wrapperr_customize.get_user_show_stats_subtitle;
                get_user_show_stats_subsubtitle = result.data.wrapperr_customize.get_user_show_stats_subsubtitle;
                get_user_show_stats_subtitle_one = result.data.wrapperr_customize.get_user_show_stats_subtitle_one;
                get_user_show_stats_subsubtitle_one = result.data.wrapperr_customize.get_user_show_stats_subsubtitle_one;
                get_user_show_stats_subtitle_none = result.data.wrapperr_customize.get_user_show_stats_subtitle_none;
                get_user_show_stats_subsubtitle_none = result.data.wrapperr_customize.get_user_show_stats_subsubtitle_none;
                get_user_show_stats_top_show = result.data.wrapperr_customize.get_user_show_stats_top_show;
                get_user_show_stats_top_show_plural = result.data.wrapperr_customize.get_user_show_stats_top_show_plural;
                get_user_show_stats_spent_title = result.data.wrapperr_customize.get_user_show_stats_spent_title;
                get_user_show_stats_most_played_title = result.data.wrapperr_customize.get_user_show_stats_most_played_title;
                get_user_show_stats_most_played_subtitle = result.data.wrapperr_customize.get_user_show_stats_most_played_subtitle;
                get_user_show_stats_buddy_title = result.data.wrapperr_customize.get_user_show_stats_buddy_title;
                get_user_show_stats_buddy_subtitle = result.data.wrapperr_customize.get_user_show_stats_buddy_subtitle;
                get_user_show_stats_buddy_title_none = result.data.wrapperr_customize.get_user_show_stats_buddy_title_none;
                get_user_show_stats_buddy_subtitle_none = result.data.wrapperr_customize.get_user_show_stats_buddy_subtitle_none;
                
                get_user_music_stats = result.data.wrapperr_customize.get_user_music_stats;
                get_user_music_stats_title = result.data.wrapperr_customize.get_user_music_stats_title;
                get_user_music_stats_subtitle = result.data.wrapperr_customize.get_user_music_stats_subtitle;
                get_user_music_stats_subsubtitle = result.data.wrapperr_customize.get_user_music_stats_subsubtitle;
                get_user_music_stats_subtitle_one = result.data.wrapperr_customize.get_user_music_stats_subtitle_one;
                get_user_music_stats_subsubtitle_one = result.data.wrapperr_customize.get_user_music_stats_subsubtitle_one;
                get_user_music_stats_subtitle_none = result.data.wrapperr_customize.get_user_music_stats_subtitle_none;
                get_user_music_stats_subsubtitle_none = result.data.wrapperr_customize.get_user_music_stats_subsubtitle_none;
                get_user_music_stats_top_track = result.data.wrapperr_customize.get_user_music_stats_top_track;
                get_user_music_stats_top_track_plural = result.data.wrapperr_customize.get_user_music_stats_top_track_plural;
                get_user_music_stats_top_album_plural = result.data.wrapperr_customize.get_user_music_stats_top_album_plural;
                get_user_music_stats_top_artist_plural = result.data.wrapperr_customize.get_user_music_stats_top_artist_plural;
                get_user_music_stats_spent_title = result.data.wrapperr_customize.get_user_music_stats_spent_title;
                get_user_music_stats_spent_subtitle = result.data.wrapperr_customize.get_user_music_stats_spent_subtitle;
                get_user_music_stats_oldest_album_title = result.data.wrapperr_customize.get_user_music_stats_oldest_album_title;
                get_user_music_stats_oldest_album_subtitle = result.data.wrapperr_customize.get_user_music_stats_oldest_album_subtitle;

                get_year_stats_title = result.data.wrapperr_customize.get_year_stats_title;
                get_year_stats_subtitle = result.data.wrapperr_customize.get_year_stats_subtitle;
                get_year_stats_subsubtitle = result.data.wrapperr_customize.get_year_stats_subsubtitle;
                get_year_stats_movies = result.data.wrapperr_customize.get_year_stats_movies;
                get_year_stats_movies_title = result.data.wrapperr_customize.get_year_stats_movies_title;
                get_year_stats_movies_duration_title = result.data.wrapperr_customize.get_year_stats_movies_duration_title;
                get_year_stats_shows = result.data.wrapperr_customize.get_year_stats_shows;
                get_year_stats_shows_title = result.data.wrapperr_customize.get_year_stats_shows_title;
                get_year_stats_shows_duration_title = result.data.wrapperr_customize.get_year_stats_shows_duration_title;
                get_year_stats_music = result.data.wrapperr_customize.get_year_stats_music;
                get_year_stats_music_title = result.data.wrapperr_customize.get_year_stats_music_title;
                get_year_stats_music_duration_title = result.data.wrapperr_customize.get_year_stats_music_duration_title;
                get_year_stats_leaderboard = result.data.wrapperr_customize.get_year_stats_leaderboard;
                get_year_stats_leaderboard_numbers = result.data.wrapperr_customize.get_year_stats_leaderboard_numbers;
                get_year_stats_leaderboard_title = result.data.wrapperr_customize.get_year_stats_leaderboard_title;
                get_year_stats_duration_sum_title = result.data.wrapperr_customize.get_year_stats_duration_sum_title;
                
                wrapperr_and = result.data.wrapperr_customize.wrapperr_and;
                wrapperr_play = result.data.wrapperr_customize.wrapperr_play;
                wrapperr_play_plural = result.data.wrapperr_customize.wrapperr_play_plural;
                wrapperr_day = result.data.wrapperr_customize.wrapperr_day;
                wrapperr_day_plural = result.data.wrapperr_customize.wrapperr_day_plural;
                wrapperr_hour = result.data.wrapperr_customize.wrapperr_hour;
                wrapperr_hour_plural = result.data.wrapperr_customize.wrapperr_hour_plural;
                wrapperr_minute = result.data.wrapperr_customize.wrapperr_minute;
                wrapperr_minute_plural = result.data.wrapperr_customize.wrapperr_minute_plural;
                wrapperr_second = result.data.wrapperr_customize.wrapperr_second;
                wrapperr_second_plural = result.data.wrapperr_customize.wrapperr_second_plural;
                wrapperr_sort_plays = result.data.wrapperr_customize.wrapperr_sort_plays;
                wrapperr_sort_duration = result.data.wrapperr_customize.wrapperr_sort_duration;

                username = result.username;

                admin_menu();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send();
}