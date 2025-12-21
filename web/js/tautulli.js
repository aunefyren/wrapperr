function loadAdminPage() {

    topFunction();

    var html = '<div>';
    html += '<div class="form-group newline">';
    html += `<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="AdminPageRedirect();"><img src="${root}/assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<form id="set_tautulli_form" onsubmit="return false;">'

    for(var i = 0; i < tautulli.length; i++) {

        if(tautulli.length > 1) {
            html += '<div class="form-group newline">';
            html += `<button style="" type="button" class="form-control btn" id="remove_tautulli_${i}" onclick="remove_tautulli_server(${i});"><img src="${root}/assets/trash.svg" class="btn_logo"><p2 id="test_tautulli_text">Remove Tautulli server</p2></button>`;
            html += '</div>';
        }

        html += '<div class="form-group">';
        html += '<label for="tautulli_name_' + i + '" title="Just what we shall name your server.">Tautulli Server name:</label>';
        html += '<input type="text" class="form-control" id="tautulli_name_' + i + '" value="' + tautulli[i].tautulli_name + '" autocomplete="off" required placeholder="" required /><br>';
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
        html += `<button style="background-color: lightgrey;" type="button" class="form-control btn" id="test_connection_${i}" onclick="test_tautulli_connection('${i}')"><img src="${root}/assets/synchronize.svg" class="btn_logo"><p2 id="test_tautulli_text">Test Tautulli connection</p2></button>`;
        html += '</div>';

        html += '<div class="form-group newline">';
        html += '<hr>';
        html += '</div>';

    }

    html += '<div class="form-group newline">';
    html += `<button style="" type="button" class="form-control btn" id="add_tautulli_server" onclick="additional_tautulli_server();"><img src="${root}/assets/plus.svg" class="btn_logo"><p2 id="test_tautulli_text">Add Tautulli server</p2></button>`;
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

    html += '<div class="form-group newline" title="Delete all cached posters. They will be re-downloaded when needed.">';
    html += '<label for="clear_poster_cache">Clear photo cache now:<br>';
    html += '<input type="checkbox" class="form-control" id="clear_poster_cache" checked /></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button type="submit" class="form-control btn" onclick="set_tautulli_settings_call();" id="set_tautulli_form_button"><img src="${root}/assets/done.svg" class="btn_logo"></img><p2 id="set_tautulli_form_button_text">Save</p2></button>`;
    html += '</div>';

    html += '</form>';

    html += '</div>';

    document.getElementById("setup").innerHTML = html;
}

function additional_tautulli_server() {

    console.log("Saving current settings.")
    tautulli = set_tautulli_settings_call(true);

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
    loadAdminPage();
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
    loadAdminPage();
    return;

}

function set_tautulli_settings_call(dont_call_api) {

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

        if(tautulli_ip === '') {
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            alert('Tautulli IP is required for Tautulli to function.');
            document.getElementById('tautulli_ip_' + i).focus();
            return;
        }

        if(tautulli_name === '') {
            document.getElementById("set_tautulli_form_button").disabled = false;
            document.getElementById("set_tautulli_form_button").style.opacity = '1';
            alert('Tautulli server name is required for Tautulli to function.');
            document.getElementById('tautulli_name_' + i).focus();
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
    clear_poster_cache = document.getElementById('clear_poster_cache').checked;

    if(!dont_call_api) {
        set_tautulli_settings_call_two(clear_cache, clear_poster_cache, tautulli_settings_array)
    } else {
        return tautulli_settings_array
    }
}

function set_tautulli_settings_call_two(clear_cache, clear_poster_cache, tautulli_settings_array) {
    tautulli_settings_form = {
        "clear_cache" : clear_cache,
        "clear_poster_cache" : clear_poster_cache,
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
                alert(result.error);
                document.getElementById("set_tautulli_form_button").disabled = false;
                document.getElementById("set_tautulli_form_button").style.opacity = '1';
            } else {
                AdminPageRedirect();
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "set/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(tautulli_settings_data);
    return;
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
                alert(result.error);
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