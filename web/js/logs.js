function loadAdminPage() {

    var html = '<div class="form-group newline">';
    html += `<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="AdminPageRedirect();"><img src="${root}/assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>`;
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
                <button class="form-control btn" name="log_button" id="log_button" onclick="get_log();" style="opacity: 0.5;" disabled><img src="${root}/assets/synchronize.svg" class="btn_logo"></img><p2 id="cache_button_text">Refresh</p2></button>
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
                alert(result.error);
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
    xhttp.setRequestHeader("Authorization", cookie);
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