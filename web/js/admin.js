function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function login_menu(basic_auth) {
    topFunction();
    var html = '<h2>Admin Login</h2>';
    
    html += '<form id="password_login_form" onsubmit="log_in(' + basic_auth + ');return false">'


    if(!basic_auth) {

        html += '<div class="form-group newline">';
        html += '<label for="username" title="The username chosen during first-time setup.">Username:</label>';
        html += '<input type="text" class="form-control" id="username" value="" placeholder="" minlength=4 autocomplete="on" required />';
        html += '</div>';

        html += '<div class="form-group newline">';
        html += '<label for="password" title="The password chosen during first-time setup.">Password:</label>';
        html += '<input type="password" class="form-control" id="password" value="" autocomplete="off" required />';
        html += '</div>';

    }

    html += '<div class="form-group newline">';
    html += '<div id="password_login_form_error"></div>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button type="submit" class="form-control btn" id="log_in_button"><img src="${root}/assets/done.svg" class="btn_logo"><p2>Log in</p2></button>`;
    html += '</div>';

    html += '</form>';
    document.getElementById("setup").innerHTML = html;
}

function log_in(basic_auth) {

    // Disable button
    document.getElementById("log_in_button").disabled = true;
    document.getElementById("log_in_button").style.opacity = '0.5';

    // Get variables
    if(!basic_auth) {
        password = document.getElementById('password').value;
        username = document.getElementById('username').value;

        admin_login_form = {"admin_password" : password, "admin_username" : username};

        var admin_login_data = JSON.stringify(admin_login_form);
    } else {
        var admin_login_data = ""
    }

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
                try {
                    document.getElementById("password_login_form_error").innerHTML = result.error;
                    document.getElementById("log_in_button").disabled = false;
                    document.getElementById("log_in_button").style.opacity = '1';
                    document.getElementById('password').value = '';
                } catch(e) {
                    console.log("Failed to reset input fields. Error: " + e)
                }
            } else {
                tokenPrefix = "Bearer "
                set_cookie("wrapperr-admin", tokenPrefix+result.data, 3);
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
    html += `<button type="submit" class="form-control btn" id="create_admin_button"><img src="${root}/assets/done.svg" class="btn_logo"><p2>Create account</p2></button>`;
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
                document.getElementById("password_form_error").innerHTML = result.error;
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
    html += `<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="get_config(get_cookie(\'wrapperr-admin\'));"><img src="${root}/assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>`;
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
    html += '<label for="password_original" title="The current login password.">Current password:</label>';
    html += '<input type="password" class="form-control" id="password_original" value="" placeholder="" autocomplete="off" required />';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<div id="password_form_error"></div>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button type="submit" class="form-control btn" onclick="update_password();" id="update_admin_button"><img src="${root}/assets/done.svg" class="btn_logo"><p2>Update account</p2></button>`;
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
        password_original = document.getElementById('password_original').value;
        username = document.getElementById('username').value;
    }

    admin_create_form = {"admin_password" : password, "admin_password_original" : password_original, "admin_username" : username};

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
                document.getElementById("password_form_error").innerHTML = result.error;
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
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(admin_create_data);
    return;
}

function loadAdminPage() {

    var html = `<div class="form-group">`;
    html += `<button class="form-control btn" onclick="update_password_form()"><img src="${root}/assets/config.svg" class="btn_logo"><p2>Admin settings</p2></button>`;
    html += `</div>`;

    html += `<div class="form-group">`;
    html += `<button class="form-control btn" name="plex_signout_button" id="plex_signout_button" onclick="sign_out()"><img src="${root}/assets/close.svg" class="btn_logo"></img><p2 id="plex_signout_button_text">Sign Out</p2></button>`;
    html += `</div>`;

    html += `<div class="form-group newline">`;
    html += `<hr>`;
    html += `</div>`;

    html += `<div class="form-group newline">`;
    html += `<button class="form-control btn" onclick="TautulliPageRedirect();" id="set_tautulli_settings"><img src="${root}/assets/config.svg" class="btn_logo"><p2>Tautulli settings</p2></button>`;
    html += `</div>`;

    html += `<div class="form-group newline">`;
    html += `<button class="form-control btn" onclick="SettingsPageRedirect();" id="set_wrapperr_settings"><img src="${root}/assets/config.svg" class="btn_logo"><p2>Wrapperr settings</p2></button>`;
    html += `</div>`;

    html += `<div class="form-group newline">`;
    html += `<button class="form-control btn" onclick="CustomizationPageRedirect();" id="set_wrapperr_customization"><img src="${root}/assets/config.svg" class="btn_logo"><p2>Wrapperr customization</p2></button>`;
    html += `</div>`;

    html += `<div class="form-group newline">`;
    html += `<button class="form-control btn" onclick="CachingPageRedirect();" id="caching_menu"><img src="${root}/assets/download.svg" class="btn_logo"><p2>Caching</p2></button>`;
    html += `</div>`;

    html += `<div class="form-group newline">`;
    html += `<button class="form-control btn" onclick="LogsPageRedirect();" id="log_menu"><img src="${root}/assets/document.svg" class="btn_logo"><p2>Log</p2></button>`;
    html += `</div>`;

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