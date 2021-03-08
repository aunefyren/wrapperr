function get_functions() {

    config_form = {};

    var config_data = JSON.stringify(config_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.error) {
                document.getElementById('results_error').innerHTML = '<p style="color:inherit; text-shadow: none;">' + result.message + '</p>';
            } else {
                functions = result;
                get_stats();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_functions.php");
    xhttp.send(config_data);
}