function cookie_login_actions() {
    cookie = get_cookie('plex-wrapped');

    if(cookie) {
        document.getElementById('search_wrapped_form').style.display = 'block';
        document.getElementById('plex_login_form').style.display = 'none';
        document.getElementById('sign_out_div').style.display = 'block';
        
        validate_cookie(cookie);
    }
}

function wrapped_link_actions(hash) {

    hash_form = {
        "hash" : hash
    };

    var hash_data = JSON.stringify(hash_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 400 || this.status == 500)) {
            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById('stats').innerHTML = "API response can't be parsed.";
                reset_button();
            }

            if(result.error) {
                document.getElementById('stats').innerHTML = '<p>' + result.message + '</p><img id="bored_image" src="assets/img/bored.svg" style="width: 10em; height: 10em; display:block; margin: 1em auto;">';
            } else {
                results = result.data;
                get_functions();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_link.php");
    xhttp.send(hash_data);
}

function sign_out() {
    set_cookie("plex-wrapped", "", 1);
    document.getElementById('search_wrapped_form').style.display = 'none';
    document.getElementById('plex_login_form').style.display = 'block';
    document.getElementById("plex_login_button").disabled = false;
    document.getElementById("plex_login_button").style.opacity = '1';
    document.getElementById("search_wrapped_button").disabled = true;
    document.getElementById("search_wrapped_button").style.opacity = '0.5';
    document.getElementById('sign_out_div').style.display = 'none';
}

$(document).on('submit', '#search_wrapped_form', function(){
    
    document.getElementById("search_wrapped_button").disabled = true;
    document.getElementById("search_wrapped_button").style.opacity = '0.5';
    document.getElementById("plex_signout_button").disabled = true;
    document.getElementById("plex_signout_button").style.opacity = '0.5';
    document.getElementById('results_error').innerHTML = "";
    get_functions();

});

$(document).on('submit', '#plex_login_form', function(){
    
    window_url = window.location.href.split('?')[0];

    auth_form = {"home_url" : window_url};

    var auth_data = JSON.stringify(auth_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 400 || this.status == 500)) {
            try {
                var result= JSON.parse(this.responseText);
                document.getElementById('snowflakes').style.display = 'none';
            } catch(error) {
                document.getElementById('results_error').innerHTML = "API response can't be parsed.";
            }
            if(result.error) {
                document.getElementById('results_error').innerHTML = result.message;

            } else {
                pop_up_login(result.url, result.code, result.id);
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_login_url.php");
    xhttp.send(auth_data);

});

function pop_up_login(url, code, id) {

    document.getElementById('plex_login_button_text').innerHTML = 'Loading...';
    document.getElementById("plex_login_button").disabled = true;
    document.getElementById("plex_login_button").style.opacity = '0.5';

    const openedWindow = window.open(
        url,
        "Plex Login",
        "width=500,height=750,resizable,scrollbars"
    );

    var timer = setInterval(function() { 
        if(openedWindow.closed) {
            
            check_token(code, id);

            clearInterval(timer);

        }
    }, 1000);

}

function check_token(code, id) {

    auth_form = {
                    "code" : code,
                    "id" : id
                };

    var auth_data = JSON.stringify(auth_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 400 || this.status == 500)) {
            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById('results_error').innerHTML = "API response can't be parsed.";
                reset_button();
            }
            
            if(result.error) {
                reset_button();
            } else {
                set_cookie("plex-wrapped", result.cookie, 1);
                location.reload();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_login_cookie.php");
    xhttp.send(auth_data);

}

function reset_button() {
    document.getElementById('plex_login_button_text').innerHTML = 'Sign in using Plex';
    document.getElementById("plex_login_button").disabled = false;
    document.getElementById("plex_login_button").style.opacity = '1';
}

function set_cookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function get_cookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' '){
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function validate_cookie(cookie) {
    var json_cookie = JSON.stringify({"cookie": cookie});
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                document.getElementById('results_error').innerHTML = "API response can't be parsed.";
                reset_button();
            }
            
            if(result.error) {
                set_cookie("plex-wrapped", "", 1);
                document.getElementById('search_wrapped_form').style.display = 'none';
                document.getElementById('sign_out_div').style.display = 'none';
                document.getElementById('plex_login_form').style.display = 'block';
            } else {
                document.getElementById("plex_login_button").disabled = true;
                document.getElementById("plex_login_button").style.opacity = '0.5';
                document.getElementById("search_wrapped_button").disabled = false;
                document.getElementById("search_wrapped_button").style.opacity = '1';
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/validate_login_cookie.php");
    xhttp.send(json_cookie);
    return;
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
    xhttp.open("post", "api/get_plex_wrapped_version.php");
    xhttp.send();
    return;
}