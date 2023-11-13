function get_functions() {

    config_form = {};

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.error) {
                document.getElementById("search_wrapped_button").disabled = false;
                document.getElementById("search_wrapped_button").style.opacity = '1';
                document.getElementById("plex_signout_button").disabled = false;
                document.getElementById("plex_signout_button").style.opacity = '1';
                document.getElementById('results_error').innerHTML = result.error;
            } else {
                functions = result.data.wrapperr_customize;
                functions.plex_auth = result.data.plex_auth
                functions.create_share_links = result.data.create_share_links
                functions.wrapperr_version = result.data.wrapperr_version
                get_stats();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/functions");
    xhttp.send(config_data);
}