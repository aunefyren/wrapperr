var loaded = false;

function get_stats() {

    var loading_icon = document.getElementById("loading_icon");

    stats_form = {
                        "cookie" : cookie,
						"caching" : false,
                        "plex_identity" : plex_identity
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 400 || this.status == 500)) {
			try {
				var result= JSON.parse(this.responseText);
			} catch(error) {
                if(this.responseText.includes('Maximum execution time of')) {
                    loading_icon.style.display = "none";
                    document.getElementById("search_wrapped_button").disabled = false;
                    document.getElementById("search_wrapped_button").style.opacity = '1';
                    document.getElementById("plex_signout_button").disabled = false;
                    document.getElementById("plex_signout_button").style.opacity = '1';
                    document.getElementById('results_error').innerHTML = 'PHP runtime exceeded and stopped execution. Admin must shorten wrapped period or perform caching.';
                } else {
                    console.log('Error: ' + error);
                    console.log(this.responseText);
                    loading_icon.style.display = "none";
                    document.getElementById("search_wrapped_button").disabled = false;
                    document.getElementById("search_wrapped_button").style.opacity = '1';
                    document.getElementById("plex_signout_button").disabled = false;
                    document.getElementById("plex_signout_button").style.opacity = '1';
                    document.getElementById('results_error').innerHTML = "API response can't be parsed.";
                }
                return;
			}
            if(result.error) {
                loading_icon.style.display = "none";
                document.getElementById("search_wrapped_button").disabled = false;
                document.getElementById("search_wrapped_button").style.opacity = '1';
                document.getElementById("plex_signout_button").disabled = false;
                document.getElementById("plex_signout_button").style.opacity = '1';
                document.getElementById('results_error').innerHTML = result.message;

            } else {    
                results = result;
                load_page(results);
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_stats.php");
    xhttp.send(stats_data);

    loading_icon.style.display = "inline";
}

function load_page(data){

    // Remove snow
    document.getElementById('snowflakes').style.display = 'none';

    // Set body background color to introduction
    document.getElementById("body").classList.add('color-red');
    
    // Enable changing background colors JS
    loaded = true;

    if(results.error) {
        $('#results_error').html(results.message);
        loading_icon.style.display = "none";
        search_button("SEARCH");
        return
    }

    // Find HTML elements and hide them
    var search_box = document.getElementById("search_input");
    var login_content = document.getElementById("login_content");
    var footer = document.getElementById("footer");
    search_box.style.display = "none";
    login_content.style.display = "none";
    footer.style.display = "none";

    // Load the introduction
    load_introduction();

    // Load the segments based on configuration
    if(!results.user.user_movies.error && functions.get_user_movie_stats) {
        load_movies();
    }
	
    if(!results.user.user_shows.error && functions.get_user_show_stats) {
        load_shows();
    }
	
	if(!results.user.user_music.error && functions.get_user_music_stats) {
        load_music();
    }

    if(!results.year_stats.error && (functions.get_year_stats_movies || functions.get_year_stats_shows || functions.get_year_stats_music)) {
        load_users();
    }

    // Load the outro
    load_outro();
}

//INTRODUCTION
function load_introduction() {
    var text = "";
    text += "<div class='boks' data-color='red' style='width: 100%; padding-bottom: 15em; padding-top: 15em; height:auto; background-color:none'>";

        text += "<div class='boks3'>";

            text += "<div class='boks2'>";
                text += '<img src="assets/img/finished-illustration.svg" style="width:100%; ">';
            text += "</div>";

            text += "<div class='boks2' style='margin: auto 0;'>";
                text += "<h1>" + functions.stats_intro_title.replaceAll('{user}', results.user.name) + "</h1>";
                text += "<h2>" + functions.stats_intro_subtitle + "</h2>";
            text += "</div>";

        text += "</div>";

    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
}

// Toggle list to plays or duration
function top_list_sort_by(array, title, music, year, div_id, button_id, functions_data) {
    document.getElementById(div_id).outerHTML = top_list(array, title, music, year, div_id);

    var button_text = document.getElementById(button_id + '_text');
    if(button_text.innerHTML.includes(functions_data.wrapperr_sort_plays)) {
        button_text.innerHTML = functions_data.wrapperr_sort_duration;
    } else {
        button_text.innerHTML = functions_data.wrapperr_sort_plays;
    }

    var button = document.getElementById(button_id);
    if(button.getAttribute('onclick').includes('_duration')) {
        button.setAttribute( "onclick", button.getAttribute('onclick').replaceAll('_duration', '_plays'));
    } else {
        button.setAttribute( "onclick", button.getAttribute('onclick').replaceAll('_plays', '_duration'));
    }
}

//MOVIES
function load_movies() {
    var text = "";

    if(results.user.user_movies.data.movie_plays > 1) {

        text += "<div class='boks' data-color='orangered' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color: none;'>";

            // Get custom text fron functions
            text += "<div class='boks3'>";
                text += "<h1>" + functions.get_user_movie_stats_title + "</h1>";
            text += "</div>";

            // Replace custom string with movie plays
            text += "<div class='boks3'>";
                text += "<h2>" + functions.get_user_movie_stats_subtitle.replaceAll('{movie_count}', number_with_spaces(results.user.user_movies.data.movie_plays)) + "</h2>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<p>" + functions.get_user_movie_stats_subsubtitle + "</p>";
            text += "</div>";

            // Place stats
            text += "<div class='boks3'>";

                text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="user_movies_data_movies_button" id="user_movies_data_movies_button" onclick="top_list_sort_by(results.user.user_movies.data.movies_plays, functions.get_user_movie_stats_top_movie_plural, false, true, \'user_movies_data_movies\', \'user_movies_data_movies_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="user_movies_data_movies_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }
                    
                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.user.user_movies.data.movies_duration, functions.get_user_movie_stats_top_movie_plural, false, true, 'user_movies_data_movies');
                    } else {
                        text += top_list(results.user.user_movies.data.movies_plays, functions.get_user_movie_stats_top_movie_plural, false, true, 'user_movies_data_movies');
                    }

                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    text += "<div class='boks2'>";
                        text += completion_movie(results.user.user_movies.data.user_movie_finishing_percent, false, functions);
                    text += "</div>";

                    text += "<div class='boks2'>";
                        text += paused_movie(results.user.user_movies.data.user_movie_most_paused, false, functions);
                    text += "</div>";

                    if(!results.user.user_movies.data.user_movie_oldest.error) {
                        text += "<div class='boks2'>";
                            text += oldest_movie(results.user.user_movies.data.user_movie_oldest, functions);
                        text += "</div>";
                    }

                    text += "<div class='boks2'>";
                        text += you_spent(results.user.user_movies.data.movie_duration, 'movies', functions);
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_movies.data.movie_plays == 1) {

        text += "<div class='boks' data-color='orangered' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>" + functions.get_user_movie_stats_title + "</h1>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<h2>" + functions.get_user_movie_stats_subtitle_one + "</h2>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<p>" + functions.get_user_movie_stats_subsubtitle_one + "</p>";
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_movies.data.movies_duration, functions.get_user_movie_stats_top_movie, false, true);
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    text += "<div class='boks2'>";
                        text += completion_movie(results.user.user_movies.data.user_movie_finishing_percent, true, functions);
                    text += "</div>";

                    text += "<div class='boks2'>";
                        text += paused_movie(results.user.user_movies.data.user_movie_most_paused, true, functions);
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else {

        text += "<div class='boks' data-color='orangered' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
				text += "<div class='boks2'>";
					text += "<div class='status'>";
						text += "<h1>" + functions.get_user_movie_stats_title + "</h1>";
						text += "<h2>" + functions.get_user_movie_stats_subtitle_none + "</h2>";
                        text += "<p>" + functions.get_user_movie_stats_subsubtitle_none + "</p>";
						text += '<img src="assets/img/bored.svg" style="margin: auto; display: block; width: 15em;">';
					text += "</div>";
				text += "</div>";
            text += "</div>";

            text += "</div>";
    }
    document.getElementById("search_results").innerHTML += text;
}

//SHOWS
function load_shows() {
    var text = "";

    if(results.user.user_shows.data.show_plays > 1) {
        text += "<div class='boks' data-color='orangeyellow' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>" + functions.get_user_show_stats_title + "</h1>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<h2>" + functions.get_user_show_stats_subtitle.replaceAll('{show_count}', number_with_spaces(results.user.user_shows.data.show_plays)) + "</h2>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<p>" + functions.get_user_show_stats_subsubtitle + "</p>";
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="user_shows_data_shows_button" id="user_shows_data_shows_button" onclick="top_list_sort_by(results.user.user_shows.data.shows_plays, functions.get_user_show_stats_top_show_plural, false, true, \'user_shows_data_shows\', \'user_shows_data_shows_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="user_shows_data_shows_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }
                    
                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.user.user_shows.data.shows_duration, functions.get_user_show_stats_top_show_plural, false, true, 'user_shows_data_shows');
                    } else {
                        text += top_list(results.user.user_shows.data.shows_plays, functions.get_user_show_stats_top_show_plural, false, true, 'user_shows_data_shows');
                    }
                
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    if(results.user.user_shows.data.shows_duration.length > 0 && !results.user.user_shows.data.show_buddy.error && functions.get_user_show_stats_buddy) {
                        text += "<div class='boks2'>";
                            text += load_showbuddy(results.user.user_shows.data.show_buddy, results.user.user_shows.data.shows_duration[0], functions);
                        text += "</div>";
                    }
					
					if(results.user.user_shows.data.episode_duration_longest.plays != 0 && results.user.user_shows.data.episode_duration_longest.duration != 0) {
                        text += "<div class='boks2'>";
                            text += load_longest_episode(results.user.user_shows.data.episode_duration_longest, functions);
                        text += "</div>";
                    }

                    text += "<div class='boks2'>";
                        text += you_spent(results.user.user_shows.data.show_duration, 'shows', functions);
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_shows.data.show_plays == 1) {

        text += "<div class='boks' data-color='orangeyellow' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>" + functions.get_user_show_stats_title + "</h1>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<h2>" + functions.get_user_show_stats_subtitle_one + "</h2>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<p>" + functions.get_user_show_stats_subsubtitle_one + "</p>";
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_shows.data.shows_duration, functions.get_user_show_stats_top_show, false, true);
                text += "</div>";

                if(results.user.user_shows.data.shows_duration.length > 0 && !results.user.user_shows.data.show_buddy.error && functions.get_user_show_stats_buddy) {
                    text += "<div class='boks2'>";
                        text += load_showbuddy(results.user.user_shows.data.show_buddy, results.user.user_shows.data.shows_duration[0], functions);
                    text += "</div>";
                }
				
				if(results.user.user_shows.data.episode_duration_longest.plays != 0 && results.user.user_shows.data.episode_duration_longest.duration != 0) {
					text += "<div class='boks2'>";
						text += load_longest_episode(results.user.user_shows.data.episode_duration_longest, functions);
					text += "</div>";
				}

            text += "</div>";
        text += "</div>";

    } else {

        text += "<div class='boks' data-color='orangeyellow' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
				text += "<div class='boks2'>";
					text += "<div class='status'>";
                        text += "<h1>" + functions.get_user_show_stats_title + "</h1>";
						text += "<h2>" + functions.get_user_show_stats_subtitle_none + "</h2>";
                        text += "<p>" + functions.get_user_show_stats_subsubtitle_none + "</p>";
						text += '<img src="assets/img/bored.svg" style="margin: auto; display: block; width: 15em;">';
					text += "</div>";
				text += "</div>";
            text += "</div>";

            text += "</div>";
    }

    document.getElementById("search_results").innerHTML += text;
}

//MUSIC
function load_music() {
	var text = "";

    if(results.user.user_music.data.track_plays > 1) {
        text += "<div class='boks' data-color='mango' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>" + functions.get_user_music_stats_title + "</h1>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<h2>" + functions.get_user_music_stats_subtitle.replaceAll('{track_count}', number_with_spaces(results.user.user_music.data.track_plays)) + "</h2>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<p>" + functions.get_user_music_stats_subsubtitle + "</p>";
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="user_music_data_tracks_button" id="user_music_data_tracks_button" onclick="top_list_sort_by(results.user.user_music.data.tracks_plays, functions.get_user_music_stats_top_track_plural, \'track\', false, \'user_music_data_tracks\', \'user_music_data_tracks_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="user_music_data_tracks_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }

                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.user.user_music.data.tracks_duration, functions.get_user_music_stats_top_track_plural, "track", false, 'user_music_data_tracks');
                    } else {
                        text += top_list(results.user.user_music.data.tracks_plays, functions.get_user_music_stats_top_track_plural, "track", false, 'user_music_data_tracks');
                    }

                text += "</div>";
				
				text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="user_music_data_albums_button" id="user_music_data_albums_button" onclick="top_list_sort_by(results.user.user_music.data.albums_plays, functions.get_user_music_stats_top_album_plural, \'album\', false, \'user_music_data_albums\', \'user_music_data_albums_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="user_music_data_albums_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }
                    
                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.user.user_music.data.albums_duration, functions.get_user_music_stats_top_album_plural, "album", false, 'user_music_data_albums');
                    } else {
                        text += top_list(results.user.user_music.data.albums_plays, functions.get_user_music_stats_top_album_plural, "album", false, 'user_music_data_albums');
                    }

                text += "</div>";
				
				text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="user_music_data_artists_button" id="user_music_data_artists_button" onclick="top_list_sort_by(results.user.user_music.data.artists_plays, functions.get_user_music_stats_top_artist_plural, \'artist\', false, \'user_music_data_artists\', \'user_music_data_artists_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="user_music_data_artists_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }

                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.user.user_music.data.artists_duration, functions.get_user_music_stats_top_artist_plural, "artist", false, 'user_music_data_artists');
                    } else {
                        text += top_list(results.user.user_music.data.artists_plays, functions.get_user_music_stats_top_artist_plural, "artist", false, 'user_music_data_artists');
                    }
                    
                text += "</div>";

            text += "</div>";

            text += "<div class='boks3'>";
				
				text += "<div class='boks2' style='padding: 0;'>";

                    if(!results.user.user_music.data.user_album_oldest.error) {
                        text += "<div class='boks2'>";
                            text += oldest_album(results.user.user_music.data.user_album_oldest, functions);
                        text += "</div>";
					}

					text += "<div class='boks2'>";
						text += you_spent(results.user.user_music.data.track_duration, 'music', functions);
					text += "</div>";
				
				text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_music.data.track_plays == 1) {

        text += "<div class='boks' data-color='mango' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>" + functions.get_user_music_stats_title + "</h1>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<h2>" + functions.get_user_music_stats_subtitle_one + "</h2>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<p>" + functions.get_user_music_stats_subsubtitle_one + "</p>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<div class='boks2'>";
                    text += top_list(results.user.user_music.data.tracks_duration, functions.get_user_music_stats_top_track, true, false);
                text += "</div>";
            text += "</div>";

        text += "</div>";

        } else {

            text += "<div class='boks' data-color='mango' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

                text += "<div class='boks3'>";
					text += "<div class='boks2'>";
						text += "<div class='status'>";
							text += "<h1>" + functions.get_user_music_stats_title + "</h1>";
							text += "<h2>" + functions.get_user_music_stats_subtitle_none + "</h2>";
                            text += "<p>" + functions.get_user_music_stats_subsubtitle_none + "</p>";
							text += '<img src="assets/img/bored.svg" style="margin: auto; display: block; width: 15em;">';
						text += "</div>";
					text += "</div>";
                text += "</div>";

            text += "</div>";
        }
	
	document.getElementById("search_results").innerHTML += text;
}

function oldest_movie(array, functions_data) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += functions_data.get_user_movie_stats_oldest_title.replaceAll('{movie_title}', '<b>' + array.title + "</b> (" + array.year + ")");
            
            html += '<br>';
            html += '<br>';

            if(array.year < 1950) {
                html += functions_data.get_user_movie_stats_oldest_subtitle_pre_1950;
            } else if(array.year < 1975) {
                html += functions_data.get_user_movie_stats_oldest_subtitle_pre_1975;
            } else if(array.year < 2000) {
                html += functions_data.get_user_movie_stats_oldest_subtitle_pre_2000;
            } else {
                html += functions_data.get_user_movie_stats_oldest_subtitle;
            }

            html += '<br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
        html += "</div>";
    html += "</div>";

    return html;
}

function oldest_album(album, functions_data) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += functions_data.get_user_music_stats_oldest_album_title.replaceAll('{album_title}', '<b>' + album.parent_title + "</b> (" + album.year + ")</b>").replaceAll('{album_artist}', album.grandparent_title);
			html += "<br><br>";
            html += functions_data.get_user_music_stats_oldest_album_subtitle; 
			html += '<br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
            
        html += "</div>";
    html += "</div>";

    return html;
}

function completion_movie(user_movie_finishing_percent, single, functions_data) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            var str = JSON.stringify(user_movie_finishing_percent);

            if(str.includes('.')) {
                var percent = str.split('.');
                percent = percent[0] + '.' + percent[1].slice(0, 2);
            } else {
                var percent = str;
            }

            if(!single) {
                html += "<b>" + functions_data.get_user_movie_stats_movie_completion_title_plural.replaceAll('{movie_finish_percent}', percent) + "</b>";
            } else {
                html += "<b>" + functions_data.get_user_movie_stats_movie_completion_title.replaceAll('{movie_finish_percent}', percent) + "</b>";
            }
            
            if(user_movie_finishing_percent >= 90.0) {
                html += '<img src="assets/img/champion.svg" style="margin: 1em auto; display: block; width: 15em;">';
            } else {
                html += '<br><br>';
            }
            html += functions_data.get_user_movie_stats_movie_completion_subtitle;
        html += "</div>";
    html += "</div>";

    return html;
}

function paused_movie(array, single, functions_data) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        if(array.paused_counter > 0) {
            var pause_time = seconds_to_time(array.paused_counter, false);
            if(!single) {
                html += "<div class='stats'>";
                    html += functions_data.get_user_movie_stats_pause_title.replaceAll('{movie_title}', '<b>' + array.title + '</b>' + ' (' + array.year + ')');
                    html += "<br>";
                    html += "<br>";
                    html += functions_data.get_user_movie_stats_pause_subtitle.replaceAll('{pause_duration}', pause_time);
                html += "</div>";
            } else {
                html += "<div class='stats'>";
                    html += functions_data.get_user_movie_stats_pause_title_one;
                    html += "<br>";
                    html += "<br>";
                    html += functions_data.get_user_movie_stats_pause_subtitle_one.replaceAll('{pause_duration}', pause_time);
                html += "</div>";
            }
        } else {
            html += "<div class='stats'>";
                html += '<b>' + functions_data.get_user_movie_stats_pause_title_none + '</b>';
                html += '<br><img src="assets/img/awards.svg" style="margin: auto; display: block; width: 15em;">';
                html += "<br>";
                html += functions_data.get_user_movie_stats_pause_subtitle_none;
            html += "</div>";
        }
    html += "</div>";

    return html;
}

function load_showbuddy(buddy_object, top_show, functions_data) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            if(!buddy_object.error) {
                if(!buddy_object.found) {
                    html += functions_data.get_user_show_stats_buddy_title_none.replaceAll('{top_show_title}', '<b>' + top_show.title + '</b>');
                    html += '<br><img src="assets/img/quest.svg" style="margin: auto; display: block; width: 15em;"><br>';
                    html += functions_data.get_user_show_stats_buddy_subtitle_none;
                } else {
                    html += functions_data.get_user_show_stats_buddy_title.replaceAll('{top_show_title}', '<b>' + top_show.title + '</b>').replaceAll('{buddy_username}', buddy_object.friendly_name);
                    var combined = results.user.user_shows.data.show_buddy.duration + parseInt(results.user.user_shows.data.shows_duration[0].duration);
                    var combined_2 = seconds_to_time(combined);
                    html += '<img src="assets/img/social-event.svg" style="margin: auto; display: block; width: 15em;">';
                    html += functions_data.get_user_show_stats_buddy_subtitle.replaceAll('{buddy_duration_sum}', combined_2).replaceAll('{top_show_title}', top_show.title);
                }
            }
        html += "</div>";
    html += "</div>";

    return html;
}

function load_longest_episode(array, functions_data) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += functions_data.get_user_show_stats_most_played_title.replaceAll('{show_episode}', '<b>' + array.title + '</b>').replaceAll('{show_title}', array.grandparent_title);
			html += '<br><br>';
            html += functions_data.get_user_show_stats_most_played_subtitle.replaceAll('{episode_play_sum}', play_plays(array.plays)).replaceAll('{episode_duration_sum}', seconds_to_time(array.duration, false));
        html += "</div>";
    html += "</div>";

    return html;
}

function you_spent(time, category, functions_data) {
    var html = "";

    var time_str = seconds_to_time(time, false);

    if(category === 'movies') {
        html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
            html += "<div class='stats'>";

                html += functions_data.get_user_movie_stats_spent_title.replaceAll('{movie_sum_duration}', time_str);

                html += '<br><img src="assets/img/watching-tv.svg" style="margin: auto; display: block; width: 15em;">';

            html += "</div>";
        html += "</div>";
    } else if(category === 'shows') {
        html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
            
            html += functions_data.get_user_show_stats_spent_title.replaceAll('{show_sum_duration}', time_str);

            html += '<br><img src="assets/img/watching-tv.svg" style="margin: auto; display: block; width: 15em;">';

        html += "</div>";
    } else if(category === 'music') {
        html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
            html += "<div class='stats'>";
                html += functions_data.get_user_music_stats_spent_title.replaceAll('{music_sum_duration}', time_str);
                if(time > 3600) {
                    var time_min = Math.floor(time / 60);
                    var time_str = time_min + ' ' + functions.wrapperr_minute_plural;
                    html += '<br><br>';
                    html += functions_data.get_user_music_stats_spent_subtitle.replaceAll('{music_sum_minutes}', number_with_spaces(time_str));
                }
                html += '<br><img src="assets/img/music.svg" style="margin: auto; display: block; width: 15em;">';
                html += "</div>";
        html += "</div>";
    } else {
        html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
            html += "Unknown category.";
        html += "</div>";
    }

    return html;
}

function top_list(array, title, music, year, div_id) {
    var html = "";

    html += "<div class='status' id='" + div_id + "'>";
        html += "<div class='stats'>";
            html += "<div class='status-title'>" + title + "</div>";
            html += "<div class='stats-list'>";
                for(i = 0; (i < array.length && i < 10); i++) {
                    html += "<div class='item'>";
                        html += "<div class='number'>";
                            html += i+1 + ". ";
                        html += "</div>";

                        html += "<div class='movie_name'>";
							if(music === "track" || music === "album") {
								html+= array[i].grandparent_title + "<br>";
							}
							
							html += "<b>";

							if(music === "album") {
							    html += array[i].parent_title;
							} else if(music === "artist") {
							    html += array[i].grandparent_title;
							} else {
							    html += array[i].title;
							}

                            html += "</b>";
                            var movie_hour = seconds_to_time(array[i].duration, true);

                            if(typeof(array[i].year) !== "undefined" && year) {
                                html += " (" + array[i].year + ")";
                            }

                            html += "<br>" + movie_hour + "<br>" + play_plays(array[i].plays);
                        html += "</div>";
                    html += "</div>";
                }
            html += "</div>";
        html += "</div>";
    html += "</div>";

    return html;
}

function top_list_names(array, title, div_id) {
    var html = "";

    html += "<div class='status' id='" + div_id + "'>";
        html += "<div class='stats'>";
            html += "<div class='status-title'>" + title + "</div>";
            html += "<div class='stats-list'>";
            for(i = 0; i < 10 && i < array.length; i++) {
                if(i == 0) {
                    html += "<div class='item gold'>";
                } else if(i == 1) {
                    html += "<div class='item silver'>";
                } else if(i == 2) {
                    html += "<div class='item bronze'>";
                } else {
                    html += "<div class='item'>";
                }
                    html += "<div class='number'>";
                        html += i+1 + ". ";
                    html += "</div>";

                    if(array[i].user == results.user.name) {
                        html += "<div class='name you'>";
                            html += array[i].user;
                        html += "</div>";
                    }else {
                        html += "<div class='name'>";
                            html += array[i].user;
                        html += "</div>";
                    }
                html += "</div>";
            }
            html += "</div>";
        html += "</div>";
    html += "</div>";

    return html;
}

// Toggle names list to plays or duration
function top_list_names_sort_by(array, title, div_id, button_id, functions_data) {
    document.getElementById(div_id).outerHTML = top_list_names(array, title, div_id);

    var button_text = document.getElementById(button_id + '_text');
    if(button_text.innerHTML.includes(functions_data.wrapperr_sort_plays)) {
        button_text.innerHTML = button_text.innerHTML = functions_data.wrapperr_sort_duration;
    } else {
        button_text.innerHTML = button_text.innerHTML = functions_data.wrapperr_sort_plays;
    }

    var button = document.getElementById(button_id);
    if(button.getAttribute('onclick').includes('_duration')) {
        button.setAttribute( "onclick", button.getAttribute('onclick').replaceAll('_duration', '_plays'));
    } else {
        button.setAttribute( "onclick", button.getAttribute('onclick').replaceAll('_plays', '_duration'));
    }
}

//TOP USERS
function load_users() {
    var text = "";

    text += "<div class='boks' data-color='pistach' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color: none;'>";
        text += "<h1>" + functions.get_year_stats_title + "</h1>";
        text += "<h2>" + functions.get_year_stats_subtitle + "</h2>";
        text += "<p>" + functions.get_year_stats_subsubtitle + "</p>";

        text += "<div class='boks3'>";

            if(functions.get_year_stats_leaderboard) {

                text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="year_stats_year_users_button" id="year_stats_year_users_button" onclick="top_list_names_sort_by(results.year_stats.year_users.data.users_plays, \'Top users\', \'year_stats_year_users\', \'year_stats_year_users_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="year_stats_year_users_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }
                    
                    if(functions.stats_order_by_plays == false) {
                        text += top_list_names(results.year_stats.year_users.data.users_duration, functions.get_year_stats_leaderboard_title, 'year_stats_year_users');
                    } else {
                        text += top_list_names(results.year_stats.year_users.data.users_plays, functions.get_year_stats_leaderboard_title, 'year_stats_year_users');
                    }

                text += "</div>";

                var time_movies = seconds_to_time(results.year_stats.year_movies.data.movie_duration, false);
                var time_shows = seconds_to_time(results.year_stats.year_shows.data.show_duration, false);
                var time_artists = seconds_to_time(results.year_stats.year_music.data.music_duration, false);
				var function_sum = 0;
                var time = 0;

                text += "<div class='boks2'>";
                    text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                        text += "<div class='stats'>";

                            if(functions.get_year_stats_movies && results.year_stats.year_movies.data.movie_plays > 0) {
                                text += functions.get_year_stats_movies_duration_title.replaceAll('{movie_duration_sum}', '<b>' + time_movies + '</b>');
                                text += "<br><br>";
								function_sum += 1;
                                time += results.year_stats.year_movies.data.movie_duration;
                            }

                            if(functions.get_year_stats_shows && results.year_stats.year_shows.data.show_plays > 0) {
                                text += functions.get_year_stats_shows_duration_title.replaceAll('{show_duration_sum}', '<b>' + time_shows + '</b>');
                                text += "<br><br>";
								function_sum += 1;
                                time += results.year_stats.year_shows.data.show_duration;
                            }

                            if(functions.get_year_stats_music && results.year_stats.year_music.data.music_plays > 0) {
                                text += functions.get_year_stats_music_duration_title.replaceAll('{music_duration_sum}', '<b>' + time_artists + '</b>');
                                text += "<br><br>";
								function_sum += 1;
                                time += results.year_stats.year_music.data.music_duration;
                            }

                            if(function_sum > 1) {
                                var time_all = seconds_to_time(Math.floor(time), false);
                                text += functions.get_year_stats_duration_sum_title.replaceAll('{all_duration_sum}', '<b>' + time_all + '</b>');
                            }

                            text += '<img src="assets/img/home.svg" style="margin: auto; display: block; width: 15em;">';

                        text += "</div>";
                    text += "</div>";
                text += "</div>";

            }

        text += "</div>";
        text += "<div class='boks3'>";

            if(functions.get_year_stats_movies && results.year_stats.year_movies.data.movie_plays > 0) {
                text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="year_stats_year_movies_button" id="year_stats_year_movies_button" onclick="top_list_sort_by(results.year_stats.year_movies.data.movies_plays, \'Top movies\', false, true, \'year_stats_year_movies\', \'year_stats_year_movies_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="year_stats_year_movies_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }

                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.year_stats.year_movies.data.movies_duration, functions.get_year_stats_movies_title, false, true, 'year_stats_year_movies');
                    } else {
                        text += top_list(results.year_stats.year_movies.data.movies_plays, functions.get_year_stats_movies_title, false, true, 'year_stats_year_movies');
                    }

                text += "</div>";
            }

            if(functions.get_year_stats_shows && results.year_stats.year_shows.data.show_plays > 0) {
                text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="year_stats_year_shows_button" id="year_stats_year_shows_button" onclick="top_list_sort_by(results.year_stats.year_shows.data.shows_plays, \'Top shows\', false, false, \'year_stats_year_shows\', \'year_stats_year_shows_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="year_stats_year_shows_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }
                    
                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.year_stats.year_shows.data.shows_duration, functions.get_year_stats_shows_title, false, false, 'year_stats_year_shows');
                    } else {
                        text += top_list(results.year_stats.year_shows.data.shows_plays, functions.get_year_stats_shows_title, false, false, 'year_stats_year_shows');
                    }

                text += "</div>";
            }

            if(functions.get_year_stats_music && results.year_stats.year_music.data.music_plays > 0) {
                text += "<div class='boks2'>";

                    if(functions.stats_order_by_plays !== false && functions.stats_order_by_duration !== false) {
                        text += '<button class="form-control btn" style="margin: 0.5em auto; width: fit-content;" name="year_stats_year_music_button" id="year_stats_year_music_button" onclick="top_list_sort_by(results.year_stats.year_music.data.artists_plays, \'Top artists\', \'artist\', false, \'year_stats_year_music\', \'year_stats_year_music_button\', functions);"><img src="assets/tweak.svg" class="btn_logo"><p2 id="year_stats_year_music_button_text">' + functions.wrapperr_sort_plays + '</p2></button>';
                    }
                    
                    if(functions.stats_order_by_plays == false) {
                        text += top_list(results.year_stats.year_music.data.artists_duration, functions.get_year_stats_music_title, "artist", false, 'year_stats_year_music');
                    } else {
                        text += top_list(results.year_stats.year_music.data.artists_plays, functions.get_year_stats_music_title, "artist", false, 'year_stats_year_music');
                    }
                
                text += "</div>";
            }

        text += "</div>";
    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
}

//Outro
function load_outro() {
    var text = "";

    text += "<div class='boks' data-color='charcoal' style='height: auto !important; width: 100%; padding-bottom: 15em; padding-top: 15em; height:10em; background-color:none;'>";
        text += "<div class='boks3'>";
            
            text += "<div class='boks2' style='margin: auto 0;'>";
                text += '<img src="assets/img/new-years.svg" style="width:100%; ">';
            text += "</div>";

            text += "<div class='boks2' style='margin: auto 0;'>";
                text += "<h1>" + functions.stats_outro_title + "</h1>";
                text += "<h2>" + functions.stats_outro_subtitle + "</h2>";
            text += "</div>";
        
        text += "</div>";
        text += "<div class='boks3'>";

            text += "<div class='boks2' style='margin-top:5em;'>";
                
                if(!link_mode && functions.create_share_links) {

                    text += "<div class='form-group' id='share_wrapped_div' style=''>";
                        text += "<button class='form-control btn' name='share_wrapped_button' id='share_wrapped_button' onclick='create_wrapped_link()'>";
                            text += "<img src='assets/share.svg' class='btn_logo'>";
                            text += "<p2 id='share_wrapped_button_text'>Share wrapped page</p2>";
                        text += "</button>";

                        text += "<div class='form-group' id='share_wrapped_results_div' style='display: none; margin: 0.5em 0;'>";
                            text += "<div><p>This URL is valid for 7 days:</p></div>";
                            text += "<div id='share_wrapped_results_url' style='padding: 0.25em; background-color: var(--white); border-radius: 0.25em; overflow: auto;'></div>";
                        text += "</div>";

                    text += "</div>";

                }
                
                var url_home = window.location.href.split('?')[0];

                text += "<div class='form-group' id='return_home_div' style=''>";
                    text += `<button class='form-control btn' name='return_home_button' id='return_home_button' onclick='window.location.href = "` + url_home + `";'>`;
                        text += "<img src='assets/restart.svg' class='btn_logo'>";
                        text += "<p2 id='return_home_text'>Return</p2>";
                    text += "</button>";
                text += "</div>";

            text += "</div>";

        text += "</div>";
    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
}

function create_wrapped_link() {

    document.getElementById("share_wrapped_button").disabled = true;
    document.getElementById("share_wrapped_button").style.opacity = '0.5';

    wrapped_form = {
                        "cookie" : get_cookie('wrapperr-user'),
                        "data" : results,
                        "functions" : functions
                    };

    var wrapped_data = JSON.stringify(wrapped_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && (this.status == 200 || this.status == 400 || this.status == 500)) {
        try {
            var result= JSON.parse(this.responseText);
        } catch(error) {
            alert("API response can't be parsed.");
            console.log('Error: ' + error);
            console.log(this.responseText);
            document.getElementById("share_wrapped_button").disabled = false;
            document.getElementById("share_wrapped_button").style.opacity = '1';
        }
        if(result.error) {
            alert(result.message);
            document.getElementById("share_wrapped_button").disabled = false;
            document.getElementById("share_wrapped_button").style.opacity = '1';

        } else {
            document.getElementById('share_wrapped_results_url').innerHTML = '<span style="white-space: nowrap;">' + window.location.href.split('?')[0] + result.url + '</span>';
            document.getElementById('share_wrapped_results_div').style.display = 'inline-block';
            document.getElementById("share_wrapped_button").disabled = false;
            document.getElementById("share_wrapped_button").style.opacity = '1';
        }
    }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/create_link.php");
    xhttp.send(wrapped_data);
}

//Converting seconds to time in string
var seconds_in_day = 86400;
var seconds_in_hour = 3600;
var seconds_in_minute = 60;

function seconds_to_time(seconds, comma) {

    if(seconds >= seconds_in_day) {
        var time = seconds_to_days(seconds, comma, functions);
    } else if(seconds >= seconds_in_hour) {
        var time = seconds_to_hours(seconds, comma, functions);
    } else if(seconds >= seconds_in_minute) {
        var time = seconds_to_minutes(seconds, comma, functions);
    } else {
        var time = seconds_to_seconds(seconds, functions);
    }

    return time;
}

// Change background color for each category
$(window).scroll(function() {
    
    if(loaded) {

        // Select the window, body and elements containing stats
        var $window = $(window),
            $body = $('body'),
            $panel = $('.boks');
        
        // Change 33% earlier than scroll position so colour is there when you arrive
        var scroll = $window.scrollTop() + ($window.height() / 3);
    
        $panel.each(function () {
            var $this = $(this);

            // If position is within range of this panel.
            // So position of (position of top of div <= scroll position) && (position of bottom of div > scroll position).
            // Remember we set the scroll to 33% earlier in scroll var.
            if ($this.position().top <= scroll && $this.position().top + $this.height() > scroll) {

            // Remove all classes on body with color-
            $body.removeClass(function (index, css) {
                return (css.match (/(^|\s)color-\S+/g) || []).join(' ');
            });

            // Add class of currently active div
            $body.addClass('color-' + $(this).data('color'));
            }
        });    

    }
    
  }).scroll();