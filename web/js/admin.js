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

        // Show the MFA code field only when the admin account has MFA enabled.
        if(typeof mfa_enabled !== 'undefined' && mfa_enabled) {
            html += '<div class="form-group newline">';
            html += '<label for="mfa_code" title="The 6-digit code from your authenticator app.">MFA code:</label>';
            html += '<input type="text" class="form-control" id="mfa_code" value="" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" required />';
            html += '</div>';
        }

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

        // Include the MFA code when the login form is showing the field.
        var mfa_field = document.getElementById('mfa_code');
        if(mfa_field) {
            admin_login_form["admin_mfa_code"] = mfa_field.value;
        }

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

    // Multi-factor authentication (MFA) management. Independent of the password
    // form above; populated/refreshed by loadMfaSection(). Rendered as its own
    // <form> so it inherits the page's flex centering/spacing.
    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';
    html += '<div class="form-group newline">';
    html += '<h3>Multi-factor authentication</h3>';
    html += '</div>';
    html += '<form id="mfa_section" onsubmit="return false;"><div class="form-group newline">Loading...</div></form>';

    document.getElementById("setup").innerHTML = html;

    loadMfaSection();
}

// loadMfaSection fetches the current MFA status and renders either the enable or
// disable controls into #mfa_section.
function loadMfaSection() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            var section = document.getElementById("mfa_section");
            if(!section) { return; }

            try {
                var result = JSON.parse(this.responseText);
            } catch(error) {
                section.innerHTML = 'Failed to load MFA status.';
                return;
            }

            renderMfaSection(result.mfa === true);
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/admin-state");
    xhttp.send();
}

// renderMfaSection draws the MFA controls based on whether MFA is currently enabled.
function renderMfaSection(enabled) {
    var section = document.getElementById("mfa_section");
    if(!section) { return; }

    var html = '';

    // Warn when HTTP Basic auth is active, since MFA is not enforced in that mode.
    if(typeof basic_auth !== 'undefined' && basic_auth) {
        html += '<div class="form-group newline"><div class="warning">!<br>MFA is not enforced while HTTP Basic authentication is active.</div></div>';
    }

    if(enabled) {
        html += '<div class="form-group newline"><p2>MFA is <b>enabled</b> for the admin account.</p2></div>';
        html += '<div class="form-group newline">';
        html += '<label for="mfa_disable_password">Confirm admin password to disable:</label>';
        html += '<input type="password" class="form-control" id="mfa_disable_password" value="" autocomplete="off" />';
        html += '</div>';
        html += '<div class="form-group newline"><div id="mfa_error" style="color:#ff6b6b;"></div></div>';
        html += '<div class="form-group newline">';
        html += `<button type="button" class="form-control btn" onclick="mfa_disable();" id="mfa_disable_button"><img src="${root}/assets/trash.svg" class="btn_logo"><p2>Disable MFA</p2></button>`;
        html += '</div>';
    } else {
        html += '<div class="form-group newline"><p2>MFA is <b>disabled</b>. Enable it to require a one-time code from an authenticator app at admin login.</p2></div>';
        html += '<div class="form-group newline"><div id="mfa_error" style="color:#ff6b6b;"></div></div>';
        html += '<div class="form-group newline">';
        html += `<button type="button" class="form-control btn" onclick="mfa_enroll();" id="mfa_enroll_button"><img src="${root}/assets/done.svg" class="btn_logo"><p2>Enable MFA</p2></button>`;
        html += '</div>';
    }

    section.innerHTML = html;
}

// mfa_enroll requests a new secret + QR code and renders the activation form.
function mfa_enroll() {
    var btn = document.getElementById("mfa_enroll_button");
    if(btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result = JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById("mfa_error").innerHTML = 'Failed to parse API response.';
                return;
            }

            if(result.error) {
                document.getElementById("mfa_error").innerHTML = result.error;
                if(btn) { btn.disabled = false; btn.style.opacity = '1'; }
                return;
            }

            renderMfaActivate(result.data);
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "mfa/enroll");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
}

// renderMfaActivate shows the QR code, manual secret, and the code-entry form.
function renderMfaActivate(data) {
    var section = document.getElementById("mfa_section");
    if(!section) { return; }

    var html = '';
    html += '<div class="form-group newline"><p2>Scan this QR code with your authenticator app, then enter the generated code to activate.</p2></div>';
    html += '<div class="form-group newline">';
    html += '<img src="' + data.qr_code_base64 + '" alt="MFA QR code" style="display:block; margin: 0 auto; width:200px; height:200px;" />';
    html += '</div>';
    html += '<div class="form-group newline"><p2>Or enter this secret manually:</p2><br><code style="word-break: break-all;">' + data.secret + '</code></div>';
    // Keep the secret available for the activation request.
    html += '<input type="hidden" id="mfa_secret" value="' + data.secret + '" />';
    html += '<div class="form-group newline">';
    html += '<label for="mfa_activate_code">Authenticator code:</label>';
    html += '<input type="text" class="form-control" id="mfa_activate_code" value="" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" />';
    html += '</div>';
    html += '<div class="form-group newline"><div id="mfa_error" style="color:#ff6b6b;"></div></div>';
    html += '<div class="form-group">';
    html += `<button type="button" class="form-control btn" onclick="mfa_activate();" id="mfa_activate_button"><img src="${root}/assets/done.svg" class="btn_logo"><p2>Activate</p2></button>`;
    html += '</div>';
    html += '<div class="form-group">';
    html += `<button type="button" class="form-control btn" onclick="loadMfaSection();" id="mfa_cancel_button"><p2>Cancel</p2></button>`;
    html += '</div>';

    section.innerHTML = html;
}

// mfa_activate confirms the enrollment by sending the secret + code.
function mfa_activate() {
    var btn = document.getElementById("mfa_activate_button");
    if(btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

    var form = {
        "secret" : document.getElementById('mfa_secret').value,
        "admin_mfa_code" : document.getElementById('mfa_activate_code').value
    };

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result = JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById("mfa_error").innerHTML = 'Failed to parse API response.';
                return;
            }

            if(result.error) {
                document.getElementById("mfa_error").innerHTML = result.error;
                if(btn) { btn.disabled = false; btn.style.opacity = '1'; }
                return;
            }

            loadMfaSection();
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "mfa/activate");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(JSON.stringify(form));
}

// mfa_disable clears MFA after confirming the admin password.
function mfa_disable() {
    var btn = document.getElementById("mfa_disable_button");
    if(btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

    var form = { "admin_password" : document.getElementById('mfa_disable_password').value };

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result = JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById("mfa_error").innerHTML = 'Failed to parse API response.';
                return;
            }

            if(result.error) {
                document.getElementById("mfa_error").innerHTML = result.error;
                if(btn) { btn.disabled = false; btn.style.opacity = '1'; }
                return;
            }

            loadMfaSection();
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "mfa/disable");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(JSON.stringify(form));
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

    var html = `
    <div class="admin-button-group">
    <div class="form-group">`;
    html += `<button class="form-control btn" onclick="update_password_form()"><img src="${root}/assets/config.svg" class="btn_logo"><p2>Admin settings</p2></button>`;
    html += `</div>`;

    html += `<div class="form-group">`;
    html += `<button class="form-control btn" name="plex_signout_button" id="plex_signout_button" onclick="sign_out()"><img src="${root}/assets/close.svg" class="btn_logo"></img><p2 id="plex_signout_button_text">Sign Out</p2></button>`;
    html += `</div>
    </div>
    `;

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

    html += `<div class="form-group newline">`;
    html += `<button class="form-control btn" onclick="UsersPageRedirect();" id="log_menu"><img src="${root}/assets/users.svg" class="btn_logo"><p2>Users</p2></button>`;
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