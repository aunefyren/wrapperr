function loadAdminPage() {

    var html = '<div class="form-group newline">';
    html += `<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="AdminPageRedirect();"><img src="${root}/assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    var min_day_length = 1;
    if(tautulli.length > 1) {
        min_day_length = tautulli.length + 1 
    }

    html += `
        
		<div class='form-group newline'>
			<h3>
				Caching Tautulli data for later use to prevent long load times.
			</h3>

			<div class="form_hidden" id="caching_desc">
				<p style="font-size:1em;">
					When you configured a wrapped period, you set the number of days to process. Each unique day in that period is a new API request to Tautulli, which holds the data which needs processing. 
					<br>
					<br>
					Wrapperr can cache data from Tautulli to decrease load times, but it needs to be loaded once. If the time frame is long this can take several minutes. Instead of loading your own stats, you can perform caching here. Afterward, everything is cached and saved. Only additional/new data is downloaded on future Wrapperr usage.
					<br>
					<br>
					The loop used on this page ensures the cache is saved after a certain amount of days are downloaded. If the value below is set to 50, it will save the cache for every 50 days downloaded.
					<br>
					<br>
				</p>
			</div>

			<div class="form-group newline">
				<button class="form-control btn" name="get_user_show_stats_custom_button" id="get_user_show_stats_custom_button" onclick="toggle_hidden_form(\'caching_desc\')"><img src="${root}/assets/about.svg" class="btn_logo"></img><p2 id="get_user_show_stats_custom_button_text">Info</p2></button>
			</div>
		</div>
			
		<form id='stats_form' class='form' onsubmit='event.preventDefault(); cache_initiate();' action="" method="post">

            <div class='form-group newline'>

                <label for="days" title="">Days between safety-save of cache:</label>
                <input type="number" class='form-control' name="days" id="days" min='` + min_day_length + `' value='50' autocomplete="off" required />

            </div>

            <div class="form-group newline">
                <button class="form-control btn" type="submit" name="cache_button" id="cache_button"><img src="${root}/assets/download.svg" class="btn_logo"></img><p2 id="cache_button_text">Cache</p2></button>
            </div>

            <div id="cache"></div>

        </form>
    `;

    document.getElementById("setup").innerHTML = html;
}

function add_to_cache_log(log_message, state, color) {
    var today = new Date();
    var time = pad_number(today.getHours(), 2) + ":" + pad_number(today.getMinutes(), 2) + ":" + pad_number(today.getSeconds(), 2);

    if(state) {
        style = 'color:' + color + ';';
    } else {
        style = '';
    }

    var tablerow = `
    <tr class='cacher-tr'>
        <td class='cacher-td'>` + time + `</td>
        <td class='cacher-td' style='` + style + `'>` + log_message + `</td>
    </tr>
    `;

    document.getElementById('cache_results_body').innerHTML += tablerow

}

function cache_initiate() {

    var days = parseInt(document.getElementById('days').value);

    var html = `
        <form id='stats_form' class='form' onsubmit='return false' action="" method="post">

            <div class='form-group newline'>
                <img id="loading_icon" src="${root}/assets/loading.gif" style="border-radius: 25px; background-color: white; padding: 1em; width: 4em; height: 4em; display: inline;">
            </div>

            <h3>Caching log:</h3>

            <div id="cache_results" style="max-height: 15em; overflow-y: scroll;">
                <table class='cacher-table'>
                    <tbody id="cache_results_body"> 
                        <tr>
                            <th class='cacher-th' style='width: 25%'>Time</th>
                            <th class='cacher-th' style='width: 75%'>Message</th>
                        </tr>
                    </tbody>
                </table
            </div>


        </form>
        `;

    document.getElementById('cache').innerHTML = html;
	
    add_to_cache_log('Creating new cache request. Maximum ' + days + ' days.')

    get_stats(days);
}

function cache_log(days, result, complete) {

    if(result) {
        add_to_cache_log('Completed caching with a maximum of ' + days + ' days.', false, '');
    } else {
        add_to_cache_log('Error caching ' + days + ' days. Stopping.', true, 'var(--red)');
		document.getElementById('loading_icon').style.display = "none";
        document.getElementById("cache_button").disabled = false;
        document.getElementById("cache_button").style.opacity = '1';
    }
	
	if(complete) {
		add_to_cache_log('Finished caching request.', true, 'var(--green)');
		document.getElementById('loading_icon').style.display = "none";
        document.getElementById("cache_button").disabled = false;
        document.getElementById("cache_button").style.opacity = '1';
	} else {
		add_to_cache_log('Requesting new cache from Wrapperr. Maximum ' + days + ' days.', false, '');
	}

    var cache_results = document.getElementById("cache_results");
    cache_results.scrollTop = cache_results.scrollHeight;
}

function get_stats(days) {

    document.getElementById("cache_button").disabled = true;
    document.getElementById("cache_button").style.opacity = '0.5';

    stats_form = {
						"caching" : true,
						"cache_limit" : days
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                if(this.responseText.includes('Maximum execution time of')) {
                    cache_log(days, false, true);
                    document.getElementById("cache_button").disabled = false;
                    document.getElementById("cache_button").style.opacity = '1';
                    alert('PHP runtime was exceeded and stopped execution. Lower days cached to prevent this.');
                    console.log('Failed to parse API response. Error: ' + this.responseText);
                } else {
                    cache_log(days, false, true);
                    alert('Failed to parse API response.');
                    console.log('Failed to parse API response. Error: ' + this.responseText);
                    document.getElementById("cache_button").disabled = false;
                    document.getElementById("cache_button").style.opacity = '1';
                }
                return;
            }

            if(result.error) {
                alert(result.error);
                cache_log(days, false, true);
            } else {
                if(!result.data) {
                    cache_log(days, true, result.data);
                    get_stats(days);
                } else {
                    cache_log(days, true, result.data);
                }
            }
        }
        
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/statistics", );
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(stats_data);
    return;
}