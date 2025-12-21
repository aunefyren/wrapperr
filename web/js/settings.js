function loadAdminPage() {
    topFunction();

    var html = '<div class="form-group newline">';
    html += `<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="AdminPageRedirect();"><img src="${root}/assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>`;
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
    html += '<label for="wrapped_dynamic" title="Whether the time frame is static or dynamic.">Dynamic time frame:<br>';
    html += '<input type="checkbox" class="form-control" id="wrapped_dynamic" onclick="toggleWrappedPeriod();" ';
    if(wrapped_dynamic) {
        html += 'checked="' + wrapped_dynamic + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '</div>';

    html += '<div id="wrapped-static" class="wrapped-static static-enabled">';

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

    html += '</div>';

    html += '<div id="wrapped-dynamic" class="wrapped-dynamic dynamic-disabled">';

    html += '<div class="form-group">';
    html += '<label for="wrapped_dynamic_days" title="How many days into the past should be included in the time period?">Days in the past to include:<br>';
    html += '<input type="number" class="form-control" id="wrapped_dynamic_days" value="' + wrapped_dynamic_days + '" required /></label>';
    html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="timezone" title="The timezone the data is located in, like \'Europe/Oslo\'. Type it exactly as it is specified in the IANA Time Zone database.">Timezone: <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank">(List)</a></label>';
    html += '<input type="text" list="timezones" class="form-control" id="timezone" value="' + timezone + '" autocomplete="off" placeholder="" required /><br>';
    html += '<datalist id="timezones"></datalist>'
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
    html += '<label for="use_logs" title="Logs most actions into a log-file in the config folder. Requires a Wrapperr restart.">Log to file:<br>';
    html += '<input type="checkbox" class="form-control" id="use_logs" ';
    if(use_logs) {
        html += 'checked="' + use_logs + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="basic_auth" title="Whether the admin can login in using the HTTP Basic standard.">Use Basic Auth:<br>';
    html += '<input type="checkbox" class="form-control" id="basic_auth" ';
    if(basic_auth) {
        html += 'checked="' + basic_auth + '" ';
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

    html += '<div class="form-group newline" title="Delete all cached posters. They will be re-downloaded when needed.">';
    html += '<label for="clear_poster_cache">Clear photo cache now:<br>';
    html += '<input type="checkbox" class="form-control" id="clear_poster_cache" checked /></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button type="submit" class="form-control btn" onclick="set_wrapperr_settings_call();" id="set_wrapperr_settings_form_button"><img src="${root}/assets/done.svg" class="btn_logo"></img><p2 id="set_wrapperr_settings_form_button_text">Save</p2></button>`;
    html += '</div>';

    html += '</form>';

    document.getElementById("setup").innerHTML = html;

    getTimezones();

    if(wrapped_dynamic) {
        toggleWrappedPeriod();
    }
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
    basic_auth = document.getElementById('basic_auth').checked;
    wrapperr_root = document.getElementById('wrapperr_root').value;
    application_name_str = document.getElementById('application_name_str').value;
    application_url_str = document.getElementById('application_url_str').value;
    create_share_links = document.getElementById('create_share_links').checked;
    timezone = document.getElementById('timezone').value;
    clear_cache = document.getElementById('clear_cache').checked;
    clear_poster_cache = document.getElementById('clear_poster_cache').checked;
    winter_theme = document.getElementById('winter_theme').checked;
    wrapped_dynamic = document.getElementById('wrapped_dynamic').checked;
    wrapped_dynamic_days = document.getElementById('wrapped_dynamic_days').value;

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
        "clear_poster_cache" : clear_poster_cache,
        "data_type" : "wrapperr_data",
        "tautulli_config" : [],
        "wrapperr_customize" : {},
        "wrapperr_data" : {
            "use_cache" : use_cache,
            "use_logs" : use_logs,
            "plex_auth" : plex_auth,
            "basic_auth" : basic_auth,
            "wrapperr_root" : wrapperr_root,
            "create_share_links" : create_share_links,
            "timezone" : timezone,
            "application_name" : application_name_str,
            "application_url" : application_url_str,
            "wrapped_start" : Math.round(wrapped_start.getTime() / 1000),
            "wrapped_end" : Math.round(wrapped_end.getTime() / 1000),
            "wrapped_dynamic" : wrapped_dynamic,
            "wrapped_dynamic_days" : parseInt(wrapped_dynamic_days),
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
                alert(result.error);
                document.getElementById("set_wrapperr_settings_form_button").disabled = false;
                document.getElementById("set_wrapperr_settings_form_button").style.opacity = '1';
            } else {
                AdminPageRedirect();
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "set/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(wrapperr_settings_data);
    return;
}

function getTimezones() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Response: ' + this.responseText);
                return;
            }
            
            if(result.error) {
                alert(result.error);
            } else {
                placeTimezones(result.data);
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/timezones");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
    return;
}

function placeTimezones(timezoneArray) {
    dataList = document.getElementById("timezones");

    timezoneArray.forEach(function(item){
        var option = document.createElement('option');
        option.value = item;
        option.name = item;
        dataList.appendChild(option);
    });
}

function toggleWrappedPeriod() {
    wrapped_dynamic = document.getElementById("wrapped-dynamic")
    wrapped_static = document.getElementById("wrapped-static")

    if(wrapped_dynamic.classList.contains("dynamic-enabled")) {
        wrapped_dynamic.classList.remove("dynamic-enabled")
        wrapped_dynamic.classList.add("dynamic-disabled")
    } else if(wrapped_dynamic.classList.contains("dynamic-disabled")) {
        wrapped_dynamic.classList.add("dynamic-enabled")
        wrapped_dynamic.classList.remove("dynamic-disabled")
    } else {
        wrapped_dynamic.classList.add("dynamic-disabled")
    }

    if(wrapped_static.classList.contains("static-enabled")) {
        wrapped_static.classList.remove("static-enabled")
        wrapped_static.classList.add("static-disabled")
    } else if(wrapped_static.classList.contains("static-disabled")) {
        wrapped_static.classList.add("static-enabled")
        wrapped_static.classList.remove("static-disabled")
    } else {
        wrapped_static.classList.add("static-enabled")
    }
}