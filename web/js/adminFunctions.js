function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function get_wrapper_version() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse Wrapperr version. Response: ' + this.responseText)
                alert("Failed to parse API response");
                return;
            }
            
            if(!result.error) {
                document.getElementById('github_link').innerHTML = 'GitHub (' + result.wrapperr_version + ')';

                if(result.application_name && result.application_name !== '') {
                    document.getElementById('application_name').innerHTML = result.application_name + ' Setup';
                    document.title = result.application_name;
                }

                if(result.wrapperr_root != "") {
                    api_url = window.location.origin + "/" + result.wrapperr_root + "/api/";
                    console.log("URL: " + api_url)
                }

                get_admin_state(result.basic_auth);
            } else {
              
                get_admin_state(false);

            }

        } else if(this.readyState == 4 && this.status !== 200) {
            var html = '<h2>' + this.status + ' Error</h2>';
            html += '<p>The API did not respond correctly.</p>';
            document.getElementById("setup").innerHTML = html;
        }
    };
    xhttp.withCredentials = true;

    // Get the root without "/admin*"
    root = window.location.pathname.replace(/\/admin.*/gm, '') // Remove /admin and any later chars

    // Maybe add trailing slash depending on the end of "window.location.origin"
    var trailingslash = ""
    if(window.location.origin.charAt(window.location.origin.length-1) != "/") {
        trailingslash = "/"
    }

    // Reach the API to get URL base
    xhttp.open("post", root + trailingslash + "api/get/wrapperr-version");
    xhttp.send();
    return;
}

// Get admin configuration state
function get_admin_state(basic_auth) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
                return;
            }
            
            if(result.error) {
                console.log(result.error);
            } else if(!result.data) {
                first_time = true;
                set_password_form();
            } else {
                cookie = get_cookie('wrapperr-admin');

                if(cookie) {
                    validate_cookie_admin(cookie, basic_auth);
                } else {
                    login_menu(basic_auth);
                }
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/admin-state");
    xhttp.send();
    return;
}

// Validate admin login
function validate_cookie_admin(cookie, basic_auth) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                console.log('Failed to parse API response. Response: ' + this.responseText)
            }
            
            if(result.error) {
                set_cookie("wrapperr-admin", "", 1);
                login_menu(basic_auth);
                document.getElementById("password_login_form_error").innerHTML = result.error;
            } else {
                get_config(get_cookie('wrapperr-admin'));
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "validate/admin");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
    return;
}

// Get config for admin to configure
function get_config(cookie) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result = JSON.parse(this.responseText);
            }
            catch {
                alert("Failed to parse API response.");
                return;
            }
			
            if(result.error) {
                alert(result.error);
                location.reload();
            } else {
                tautulli = result.data.tautulli_config;

                timezone = result.data.timezone;
                create_share_links = result.data.create_share_links;
                plex_auth = result.data.plex_auth;
                basic_auth = result.data.basic_auth;
                use_cache = result.data.use_cache;
				use_logs = result.data.use_logs;
                clientID = result.data.clientID;
                wrapperr_root = result.data.wrapperr_root;
                application_name_str = result.data.application_name;
                application_url_str = result.data.application_url;
                winter_theme = result.data.winter_theme;

                wrapped_start = new Date(0);
                wrapped_start.setUTCSeconds(result.data.wrapped_start);

                wrapped_end = new Date(0);
                wrapped_end.setUTCSeconds(result.data.wrapped_end);

                wrapped_dynamic = result.data.wrapped_dynamic
                wrapped_dynamic_days = result.data.wrapped_dynamic_days

                stats_order_by_plays = result.data.wrapperr_customize.stats_order_by_plays;
                stats_order_by_duration = result.data.wrapperr_customize.stats_order_by_duration;

                wrapperr_front_page_title = result.data.wrapperr_customize.wrapperr_front_page_title;
                wrapperr_front_page_subtitle = result.data.wrapperr_customize.wrapperr_front_page_subtitle;
                wrapperr_front_page_search_title = result.data.wrapperr_customize.wrapperr_front_page_search_title;
                stats_intro_title = result.data.wrapperr_customize.stats_intro_title;
                stats_intro_subtitle = result.data.wrapperr_customize.stats_intro_subtitle;
                stats_outro_title = result.data.wrapperr_customize.stats_outro_title;
                stats_outro_subtitle = result.data.wrapperr_customize.stats_outro_subtitle;
                stats_top_list_length = result.data.wrapperr_customize.stats_top_list_length;
                obfuscate_other_users = result.data.wrapperr_customize.obfuscate_other_users;

                get_user_movie_stats = result.data.wrapperr_customize.get_user_movie_stats;
                get_user_movie_stats_title = result.data.wrapperr_customize.get_user_movie_stats_title;
                get_user_movie_stats_subtitle = result.data.wrapperr_customize.get_user_movie_stats_subtitle;
                get_user_movie_stats_subsubtitle = result.data.wrapperr_customize.get_user_movie_stats_subsubtitle;
                get_user_movie_stats_subtitle_one = result.data.wrapperr_customize.get_user_movie_stats_subtitle_one;
                get_user_movie_stats_subsubtitle_one = result.data.wrapperr_customize.get_user_movie_stats_subsubtitle_one;
                get_user_movie_stats_subtitle_none = result.data.wrapperr_customize.get_user_movie_stats_subtitle_none;
                get_user_movie_stats_subsubtitle_none = result.data.wrapperr_customize.get_user_movie_stats_subsubtitle_none;
                get_user_movie_stats_top_movie = result.data.wrapperr_customize.get_user_movie_stats_top_movie;
                get_user_movie_stats_top_movie_plural = result.data.wrapperr_customize.get_user_movie_stats_top_movie_plural;
                get_user_movie_stats_movie_completion_title = result.data.wrapperr_customize.get_user_movie_stats_movie_completion_title;
                get_user_movie_stats_movie_completion_title_plural = result.data.wrapperr_customize.get_user_movie_stats_movie_completion_title_plural;
                get_user_movie_stats_movie_completion_subtitle = result.data.wrapperr_customize.get_user_movie_stats_movie_completion_subtitle;
                get_user_movie_stats_pause_title = result.data.wrapperr_customize.get_user_movie_stats_pause_title;
                get_user_movie_stats_pause_subtitle = result.data.wrapperr_customize.get_user_movie_stats_pause_subtitle;
                get_user_movie_stats_pause_title_one = result.data.wrapperr_customize.get_user_movie_stats_pause_title_one;
                get_user_movie_stats_pause_subtitle_one = result.data.wrapperr_customize.get_user_movie_stats_pause_subtitle_one;
                get_user_movie_stats_pause_title_none = result.data.wrapperr_customize.get_user_movie_stats_pause_title_none;
                get_user_movie_stats_pause_subtitle_none = result.data.wrapperr_customize.get_user_movie_stats_pause_subtitle_none;
                get_user_movie_stats_oldest_title = result.data.wrapperr_customize.get_user_movie_stats_oldest_title;
                get_user_movie_stats_oldest_subtitle = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle;
                get_user_movie_stats_oldest_subtitle_pre_1950 = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle_pre_1950;
                get_user_movie_stats_oldest_subtitle_pre_1975 = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle_pre_1975;
                get_user_movie_stats_oldest_subtitle_pre_2000 = result.data.wrapperr_customize.get_user_movie_stats_oldest_subtitle_pre_2000;
                get_user_movie_stats_spent_title = result.data.wrapperr_customize.get_user_movie_stats_spent_title;

                get_user_show_stats = result.data.wrapperr_customize.get_user_show_stats;
                get_user_show_stats_buddy = result.data.wrapperr_customize.get_user_show_stats_buddy;
                get_user_show_stats_title = result.data.wrapperr_customize.get_user_show_stats_title;
                get_user_show_stats_subtitle = result.data.wrapperr_customize.get_user_show_stats_subtitle;
                get_user_show_stats_subsubtitle = result.data.wrapperr_customize.get_user_show_stats_subsubtitle;
                get_user_show_stats_subtitle_one = result.data.wrapperr_customize.get_user_show_stats_subtitle_one;
                get_user_show_stats_subsubtitle_one = result.data.wrapperr_customize.get_user_show_stats_subsubtitle_one;
                get_user_show_stats_subtitle_none = result.data.wrapperr_customize.get_user_show_stats_subtitle_none;
                get_user_show_stats_subsubtitle_none = result.data.wrapperr_customize.get_user_show_stats_subsubtitle_none;
                get_user_show_stats_top_show = result.data.wrapperr_customize.get_user_show_stats_top_show;
                get_user_show_stats_top_show_plural = result.data.wrapperr_customize.get_user_show_stats_top_show_plural;
                get_user_show_stats_spent_title = result.data.wrapperr_customize.get_user_show_stats_spent_title;
                get_user_show_stats_most_played_title = result.data.wrapperr_customize.get_user_show_stats_most_played_title;
                get_user_show_stats_most_played_subtitle = result.data.wrapperr_customize.get_user_show_stats_most_played_subtitle;
                get_user_show_stats_buddy_title = result.data.wrapperr_customize.get_user_show_stats_buddy_title;
                get_user_show_stats_buddy_subtitle = result.data.wrapperr_customize.get_user_show_stats_buddy_subtitle;
                get_user_show_stats_buddy_title_none = result.data.wrapperr_customize.get_user_show_stats_buddy_title_none;
                get_user_show_stats_buddy_subtitle_none = result.data.wrapperr_customize.get_user_show_stats_buddy_subtitle_none;
                
                get_user_music_stats = result.data.wrapperr_customize.get_user_music_stats;
                get_user_music_stats_title = result.data.wrapperr_customize.get_user_music_stats_title;
                get_user_music_stats_subtitle = result.data.wrapperr_customize.get_user_music_stats_subtitle;
                get_user_music_stats_subsubtitle = result.data.wrapperr_customize.get_user_music_stats_subsubtitle;
                get_user_music_stats_subtitle_one = result.data.wrapperr_customize.get_user_music_stats_subtitle_one;
                get_user_music_stats_subsubtitle_one = result.data.wrapperr_customize.get_user_music_stats_subsubtitle_one;
                get_user_music_stats_subtitle_none = result.data.wrapperr_customize.get_user_music_stats_subtitle_none;
                get_user_music_stats_subsubtitle_none = result.data.wrapperr_customize.get_user_music_stats_subsubtitle_none;
                get_user_music_stats_top_track = result.data.wrapperr_customize.get_user_music_stats_top_track;
                get_user_music_stats_top_track_plural = result.data.wrapperr_customize.get_user_music_stats_top_track_plural;
                get_user_music_stats_top_album_plural = result.data.wrapperr_customize.get_user_music_stats_top_album_plural;
                get_user_music_stats_top_artist_plural = result.data.wrapperr_customize.get_user_music_stats_top_artist_plural;
                get_user_music_stats_spent_title = result.data.wrapperr_customize.get_user_music_stats_spent_title;
                get_user_music_stats_spent_subtitle = result.data.wrapperr_customize.get_user_music_stats_spent_subtitle;
                get_user_music_stats_oldest_album_title = result.data.wrapperr_customize.get_user_music_stats_oldest_album_title;
                get_user_music_stats_oldest_album_subtitle = result.data.wrapperr_customize.get_user_music_stats_oldest_album_subtitle;

                get_year_stats_title = result.data.wrapperr_customize.get_year_stats_title;
                get_year_stats_subtitle = result.data.wrapperr_customize.get_year_stats_subtitle;
                get_year_stats_subsubtitle = result.data.wrapperr_customize.get_year_stats_subsubtitle;
                get_year_stats_movies = result.data.wrapperr_customize.get_year_stats_movies;
                get_year_stats_movies_title = result.data.wrapperr_customize.get_year_stats_movies_title;
                get_year_stats_movies_duration_title = result.data.wrapperr_customize.get_year_stats_movies_duration_title;
                get_year_stats_shows = result.data.wrapperr_customize.get_year_stats_shows;
                get_year_stats_shows_title = result.data.wrapperr_customize.get_year_stats_shows_title;
                get_year_stats_shows_duration_title = result.data.wrapperr_customize.get_year_stats_shows_duration_title;
                get_year_stats_music = result.data.wrapperr_customize.get_year_stats_music;
                get_year_stats_music_title = result.data.wrapperr_customize.get_year_stats_music_title;
                get_year_stats_music_duration_title = result.data.wrapperr_customize.get_year_stats_music_duration_title;
                get_year_stats_leaderboard = result.data.wrapperr_customize.get_year_stats_leaderboard;
                get_year_stats_leaderboard_numbers = result.data.wrapperr_customize.get_year_stats_leaderboard_numbers;
                get_year_stats_leaderboard_title = result.data.wrapperr_customize.get_year_stats_leaderboard_title;
                get_year_stats_duration_sum_title = result.data.wrapperr_customize.get_year_stats_duration_sum_title;
                
                wrapperr_and = result.data.wrapperr_customize.wrapperr_and;
                wrapperr_play = result.data.wrapperr_customize.wrapperr_play;
                wrapperr_play_plural = result.data.wrapperr_customize.wrapperr_play_plural;
                wrapperr_day = result.data.wrapperr_customize.wrapperr_day;
                wrapperr_day_plural = result.data.wrapperr_customize.wrapperr_day_plural;
                wrapperr_hour = result.data.wrapperr_customize.wrapperr_hour;
                wrapperr_hour_plural = result.data.wrapperr_customize.wrapperr_hour_plural;
                wrapperr_minute = result.data.wrapperr_customize.wrapperr_minute;
                wrapperr_minute_plural = result.data.wrapperr_customize.wrapperr_minute_plural;
                wrapperr_second = result.data.wrapperr_customize.wrapperr_second;
                wrapperr_second_plural = result.data.wrapperr_customize.wrapperr_second_plural;
                wrapperr_sort_plays = result.data.wrapperr_customize.wrapperr_sort_plays;
                wrapperr_sort_duration = result.data.wrapperr_customize.wrapperr_sort_duration;

                username = result.username;

                if(wrapperr_root !== "") {
                    root = "/" + wrapperr_root
                }

                loadAdminPage();
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
}

function sign_out() {
    set_cookie("wrapperr-admin", "", 1);
    window.location.href="/admin";
}

function toggle_hidden_form(div_id) {
    var div = document.getElementById(div_id);
    if(div.className === "form_shown") {
        div.classList.remove('form_shown');
        div.classList.add('form_hidden');
    } else {
        div.classList.remove('form_hidden');
        div.classList.add('form_shown');
    }
}

function AdminPageRedirect() {
    window.location.href = root+"/admin";
}

function TautulliPageRedirect() {
    console.log(root)
    window.location.href = root+"/admin/tautulli";
}

function SettingsPageRedirect() {
    window.location.href = root+"/admin/settings";
}

function CustomizationPageRedirect() {
    window.location.href = root+"/admin/customization";
}

function CachingPageRedirect() {
    window.location.href = root+"/admin/caching";
}

function LogsPageRedirect() {
    window.location.href = root+"/admin/logs";
}

function UsersPageRedirect() {
    window.location.href = root+"/admin/users";
}