function cookie_login_actions() {

    // Get the cookie from the browser
    cookie = get_cookie('wrapperr-user');

    // If the cookie exists and 'plex_identity' is false, 
    if(cookie && !plex_identity) {
        document.getElementById('search_wrapped_form').style.display = 'block';
        document.getElementById('plex_login_form').style.display = 'none';
        document.getElementById('sign_out_div').style.display = 'block';
        
        validate_cookie_user(cookie);
    }

}

function wrapped_link_actions(hash) {

    hash_form = {
        "hash" : hash
    };

    var hash_data = JSON.stringify(hash_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById('stats').innerHTML = "API response can't be parsed.";
                console.log("API response can't be parsed. Response: " + this.responseText);
                reset_button();
                return;
            }

            if(result.error) {
                document.getElementById('stats').innerHTML = '<p>' + result.message + '</p><img id="bored_image" src="assets/img/bored.svg" style="width: 10em; height: 10em; display:block; margin: 1em auto;">';
            } else {
                results = result.content.data;
                functions = result.content.functions;
                load_page();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/share-link");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(hash_data);
}

function sign_out() {

    set_cookie("wrapperr-user", "", 1);
    document.getElementById('search_wrapped_form').style.display = 'none';
    document.getElementById('plex_login_form').style.display = 'block';
    document.getElementById("plex_login_button").disabled = false;
    document.getElementById("plex_login_button").style.opacity = '1';
    document.getElementById("search_wrapped_button").disabled = true;
    document.getElementById("search_wrapped_button").style.opacity = '0.5';
    document.getElementById('sign_out_div').style.display = 'none';

    document.getElementById('share_wrapped_title_div').style.display = 'none';
    document.getElementById('share_wrapped_div').style.display = 'none';

}

function search_wrapperr(){
    
    document.getElementById("search_wrapped_button").disabled = true;
    document.getElementById("search_wrapped_button").style.opacity = '0.5';
    document.getElementById("plex_signout_button").disabled = true;
    document.getElementById("plex_signout_button").style.opacity = '0.5';
    document.getElementById('results_error').innerHTML = "";
    get_functions();

}

function plex_login(){

    if(!wrapperr_configured) {
        document.getElementById('results_error').innerHTML = "Wrapperr is not configured.";
        return;
    }
    
    window_url = window.location.href.split('?')[0];

    var params = 'strong=true' + '&X-Plex-Product=Wrapperr' + '&X-Plex-Client-Identifier=' + client_key

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById('results_error').innerHTML = "API response can't be parsed.";
                console.log("API response can't be parsed. Response: " + this.responseText);
                return;
            }

            //console.log(result);

            if(result.id == "" || result.code == "") {
                document.getElementById('results_error').innerHTML = "Failed to retrieve ID and/or Code from Plex Auth.";

            } else {

                var base = "https://app.plex.tv/auth#?"
                var forwardUrl = window_url + "?close_me=true"

                var url_build = base + "clientID=" + client_key + "&code=" + result.code + "&context%5Bdevice%5D%5Bproduct%5D=" + "Wrapperr" + "&forwardUrl=" + forwardUrl

                url = url_build;
                code = result.code;
                id = result.id;

                document.getElementById("plex_login_button").disabled = false;
                document.getElementById("plex_login_button").style.opacity = '1';

            }
        }
    };
    xhttp.withCredentials = false;
    xhttp.open("post", "https://plex.tv/api/v2/pins");
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('Accept', 'application/json');
    xhttp.send(params);

}

function pop_up_login() {

    document.getElementById('plex_login_button_text').innerHTML = 'Loading...';
    document.getElementById("plex_login_button").disabled = true;
    document.getElementById("plex_login_button").style.opacity = '0.5';

    const openedWindow = window.open(
        url,
        "Plex Login",
        "width=500,height=750,resizable,scrollbars,popup=yes,toolbar=0,menubar=0,location=0,status=0",
    );

    if (openedWindow == null || typeof(openedWindow)=='undefined') {
        alert("Failed to open login window. Your browser might be blocking pop-up windows.");
        reset_button();
        return;
    }

    var timer = setInterval(function() { 
        if(openedWindow != null && typeof(openedWindow) !== 'undefined') {

            wait_for_close();

            clearInterval(timer);

        }
    }, 1000);


    function wait_for_close() {
        var timer = setInterval(function() { 
            if(openedWindow.closed) {
                
                check_token(code, id);

                clearInterval(timer);

            }
        }, 1000);
    }
}

function check_token(code, id) {

    auth_form = {
                    "code" : code,
                    "id" : id
                };

    var auth_data = JSON.stringify(auth_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById('results_error').innerHTML = "API response can't be parsed.";
                console.log('API response can\'t be parsed. Response: ' + this.responseText);
                reset_button();
                return;
            }
            
            //console.log(result);

            if(result.error) {
                reset_button();
            } else {
                set_cookie("wrapperr-user", result.data, 7);
                location.reload();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "login/plex-auth");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(auth_data);

}

function reset_button() {
    document.getElementById('plex_login_button_text').innerHTML = 'Sign in using Plex';
    document.getElementById("plex_login_button").disabled = false;
    document.getElementById("plex_login_button").style.opacity = '1';
}

function validate_cookie_user(cookie) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById('results_error').innerHTML = "API response can't be parsed.";
                console.log("API response can't be parsed. Response: " + this.responseText);
                reset_button();
                return;
            }
            
            //console.log(result);

            if(result.error) {
                set_cookie("wrapperr-user", "", 1);
                document.getElementById('search_wrapped_form').style.display = 'none';
                document.getElementById('sign_out_div').style.display = 'none';
                document.getElementById('plex_login_form').style.display = 'block';
            } else {
                document.getElementById("plex_login_button").disabled = true;
                document.getElementById("plex_login_button").style.opacity = '0.5';
                document.getElementById("search_wrapped_button").disabled = false;
                document.getElementById("search_wrapped_button").style.opacity = '1';
                get_user_links(cookie);
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "validate/plex-auth");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send();
    return;
}

function get_user_links(cookie) {
    
    cookie_form = {};
    var cookie_data = JSON.stringify(cookie_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse Wrapperr links. Response: ' + this.responseText)
                return;
            }
            
            if(!result.error) {

                document.getElementById('share_wrapped_url').innerHTML = window.location.href.split('?')[0] + '?hash=' + result.data;
                document.getElementById('share_wrapped_title_div').style.display = 'block';
                document.getElementById('share_wrapped_div').style.display = 'flex';

            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get/user-share-link");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(cookie_data);
    return;
}

// Contact the Wrapperr API and get configuration details. Start processes based on the result
function get_wrapper_version(link_mode, hash) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            // Attempt to parse the JSON response
            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse Wrapperr version. Response: ' + this.responseText)
                // Place error on the loading screen
                document.getElementById("results_error_loading_screen").innerHTML = 'The API did not respond correctly.';
                return;
            }
            
            // If there was no error in the API request and link mode is not enabled
            if(!result.error && !link_mode) {

                // Set the current version in the footer
                document.getElementById('github_link').innerHTML = 'GitHub (' + result.wrapperr_version + ')';

                // Change the application name based on Wrapperr configuration
                if(result.application_name && result.application_name !== '') {
                    document.getElementById('application_name').innerHTML = result.application_name;
                    document.title = result.application_name;
                }

                // Set the client key in the JS variable
                client_key = result.client_key;

                 // Set the theme option in the JS variable
                winter_theme = result.winter_theme;

                // Enable snow and background image based on variable
                if(winter_theme) {
                    document.getElementById('snowflakes').style.display = "block";
                    document.getElementById('snowflakes2').style.display = "block";
                    document.getElementById('background_image').style.backgroundImage = "url('assets/winter.webp')";
                }

                // Change the title based based on Wrapperr configuration
                if(result.wrapperr_front_page_title !== '') {
                    document.getElementById('wrapperr_front_page_title').innerHTML = result.wrapperr_front_page_title;
                }

                // Change the subtitle based based on Wrapperr configuration
                if(result.wrapperr_front_page_subtitle !== '') {
                    document.getElementById('wrapperr_front_page_subtitle').innerHTML = result.wrapperr_front_page_subtitle;
                }

                // Set the 'configured' option in the JS variable
                wrapperr_configured = result.wrapperr_configured;
            
                if(result.wrapperr_root != "") {
                    api_url = window.location.origin + "/" + result.wrapperr_root + "/api/";
                    console.log("URL: " + api_url)
                }
                
                // If link mode, call the API and return form here
                if(link_mode) {
                    wrapped_link_actions(hash);
                    return;
                }
                
                // Change search function to use Plex search instead
                if(!result.plex_auth) {
                    wrapperr_search_function();
                }
                
                // If configured and using Plex Auth, call function
                // If not configured throw error
                if(result.plex_auth && wrapperr_configured) {
                    cookie_login_actions();
                    plex_login();
                } else if(!wrapperr_configured) {
                    document.getElementById('results_error').innerHTML = "Wrapperr is not configured.";
                }   

                // Remove the loading screen after one second
                setTimeout(function(){
                    document.getElementById('loading').style.display = "none";
                },1000);
                
            }

        }
    };
    xhttp.withCredentials = true;
    
    // Try to guess API URL from current URL
    try {

        var window_location_str = window.location.toString();

        if(window_location_str.includes("?")) {
            url_array = window_location_str.split("?")
            var init_url = url_array[0]
        } else {
            var init_url = window_location_str
        }

        var last_char = init_url.charAt(init_url.length-1);

        if(last_char == "/") {
            var final_url = init_url
        } else {
            var final_url = init_url + "/"
        }
        
    } catch(e) {
        console.log("Error occured while guessing API URL. Error: " + e);
        var final_url = window.location.toString() + "/"
    }

    xhttp.open("post", final_url + "api/get/wrapperr-version");

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send();
    return;
}

function open_link_user() {
    window.open(document.getElementById('share_wrapped_url').innerHTML, '_blank').focus();
}

function delete_link_user() {

    if(!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    cookie_form = {};
    var cookie_data = JSON.stringify(cookie_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse Wrapperr response. Response: ' + this.responseText)
                return;
            }
            
            if(!result.error) {
                document.getElementById('share_wrapped_title_div').style.display = 'none';
                document.getElementById('share_wrapped_div').style.display = 'none';
            } else {
                console.log(result.message);
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "delete/user-share-link");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", "Bearer " + cookie);
    xhttp.send(cookie_data);
    return;
}

function wrapperr_search_function() {

    var html = '';
    
    html += '<div class="form-group">';
        html += '<label for="plex_identity" title="Your Plex username or email.">Plex username or email:</label>';
        html += '<input type="text" class="form-control" id="plex_identity" value="" autocomplete="on" required />';
    html += '</div>';

    html += '<div class="form-group" id="search_wrapped_button">';
        html += '<button class="form-control btn" name="search_wrapped_button" id="search_wrapped_button" style="opacity: 1;" onclick="search_wrapperr_no_auth()">';
            html += '<img src="assets/done.svg" class="btn_logo">';
            html += '<p2 id="search_wrapped_button_text">Unwrap</p2>';
        html += '</button>';
    html += '</div>';

    html += '<div class="form-group" id="sign_out_div" style="display: none;">';
        html += '<button class="form-control btn" name="plex_signout_button" id="plex_signout_button" onclick="sign_out()">';
            html += '<img src="assets/close.svg" class="btn_logo">';
            html += '<p2 id="plex_signout_button_text">Sign Out</p2>';
        html += '</button>';
    html += '</div>';

    document.getElementById('search_wrapped_form').innerHTML = html;
    document.getElementById('search_wrapped_form').style.display = 'block';
    document.getElementById('plex_login_form').style.display = 'none';
}

function search_wrapperr_no_auth(){

    document.getElementById("search_wrapped_button").disabled = true;
    document.getElementById("search_wrapped_button").style.opacity = '0.5';
    document.getElementById('results_error').innerHTML = "";

    plex_identity = document.getElementById("plex_identity").value

    if(plex_identity == "") {
        document.getElementById('results_error').innerHTML = 'You must provide a Plex username or email.';
        document.getElementById("search_wrapped_button").disabled = false;
        document.getElementById("search_wrapped_button").style.opacity = '1';
        return;
    }

    get_functions();

}
