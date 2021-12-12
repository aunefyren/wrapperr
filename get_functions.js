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
                document.getElementById('results_error').innerHTML = result.message;
            } else {
                functions = result;
                if(!link_mode) {
                    get_stats();
                } else {
                    load_page(results);
                }
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", root + "api/get_functions.php");
    xhttp.send(config_data);
}