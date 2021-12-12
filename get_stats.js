var loaded = false;

function get_stats() {

    var loading_icon = document.getElementById("loading_icon");

    stats_form = {
                        "cookie" : cookie,
						"caching" : false
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 400 || this.status == 500)) {
			try {
				var result= JSON.parse(this.responseText);
			} catch(error) {
				console.log('Error: ' + error);
				console.log(this.responseText);
				loading_icon.style.display = "none";
                document.getElementById("search_wrapped_button").disabled = false;
                document.getElementById("search_wrapped_button").style.opacity = '1';
                document.getElementById("plex_signout_button").disabled = false;
                document.getElementById("plex_signout_button").style.opacity = '1';
                document.getElementById('results_error').innerHTML = "API response can't be parsed.";
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

    // Set body background color to introduction
    document.getElementById("body").classList.add('color-pink');

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
    text += "<div class='boks' data-color='pink' style='width: 100%; padding-bottom: 15em; padding-top: 15em; height:auto; background-color:none'>";

        text += "<div class='boks3'>";

            text += "<div class='boks2'>";
                text += '<img src="assets/img/finished-illustration.svg" style="width:100%; ">';
            text += "</div>";

            text += "<div class='boks2'>";
                text += "<br>";
                text += "<h1 style='font-size:3em; display: block;'>Hey there, " + results.user.name + "!</h1>";
                text += "<br><br><br><br>";
                text += "<h2>" + functions.stats_intro + "</h2>";
            text += "</div>";

        text += "</div>";

    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
}

//MOVIES
function load_movies() {
    var text = "";

    if(results.user.user_movies.data.movie_plays > 1) {

        text += "<div class='boks' data-color='purple' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color: none;'>";

            text += "<div class='boks3'>";
                text += "<h1>Movies!</h1>";
                text += "<br><br><br>";
                text += "<h2>You watched " + results.user.user_movies.data.movie_plays + " movies. That's a lot of movies!</h2><p>(or not, I am pre-programmed to say that)</p>"

                text += "<br><br>";
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_movies.data.movies, "Your top movies", false, true);
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    text += "<div class='boks2'>";
                        text += completion_movie(results.user.user_movies.data.user_movie_finishing_percent, false);
                    text += "</div>";

                    text += "<div class='boks2'>";
                        text += paused_movie(results.user.user_movies.data.user_movie_most_paused, false);
                    text += "</div>";

                    if(!results.user.user_movies.data.user_movie_oldest.error) {
                        text += "<div class='boks2'>";
                            text += oldest_movie(results.user.user_movies.data.user_movie_oldest);
                        text += "</div>";
                    }

                    text += "<div class='boks2'>";
                        text += you_spent(results.user.user_movies.data.movie_duration, 'movies', 'watching');
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_movies.data.movie_plays == 1) {

        text += "<div class='boks' data-color='purple' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>Movies!</h1>";
                text += "<br><br><br>";
                text += "<h2>You watched " + results.user.user_movies.data.movie_plays + " movie. You know what you like!</h2><p>(at least you tried it out)</p>";
                text += "<br><br>";
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_movies.data.movies, "Your movie", false, true);
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    text += "<div class='boks2'>";
                        text += completion_movie(results.user.user_movies.data.user_movie_finishing_percent, true);
                    text += "</div>";

                    text += "<div class='boks2'>";
                        text += paused_movie(results.user.user_movies.data.user_movie_most_paused, true);
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else {

        text += "<div class='boks' data-color='purple' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
				text += "<div class='boks2'>";
					text += "<div class='status'>";
						text += "<h1>Movies!</h1>";
						text += "<br><br><br>";
						text += "<h2>You watched " + results.user.user_movies.data.movie_plays + " movies. That's impressive in itself!</h2><p>(might wanna try it)</p>"
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
        text += "<div class='boks' data-color='green' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>Shows!</h1>";
                text += "<br><br><br><h2>You watched " + results.user.user_shows.data.show_plays + " different shows.</h2><p>(No, watching The Office twice doesn't count as two shows)</p>"
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_shows.data.shows, "Your top shows", false, true);
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    if(results.user.user_shows.data.shows.length > 0 && !results.user.user_shows.data.show_buddy.error && functions.get_user_show_buddy) {
                        text += "<div class='boks2'>";
                            text += load_showbuddy();
                        text += "</div>";
                    }
					
					if(results.user.user_shows.data.episode_duration_longest.plays != 0 && results.user.user_shows.data.episode_duration_longest.duration != 0) {
                        text += "<div class='boks2'>";
                            text += load_longest_episode(results.user.user_shows.data.episode_duration_longest);
                        text += "</div>";
                    }

                    text += "<div class='boks2'>";
                        text += you_spent(results.user.user_shows.data.show_duration, 'shows', 'watching');
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_shows.data.show_plays == 1) {

        text += "<div class='boks' data-color='green' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>Shows!</h1>";
                text += "<br><br><br><h2>You watched " + results.user.user_shows.data.show_plays + " show.</h2><p>(Better not be that same one again...)</p>"
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_shows.data.shows, "Your show", false, true);
                text += "</div>";

                if(results.user.user_shows.data.shows.length > 0 && !results.user.user_shows.data.show_buddy.error && functions.get_user_show_buddy) {
                    text += "<div class='boks2'>";
                        text += load_showbuddy();
                    text += "</div>";
                }
				
				if(results.user.user_shows.data.episode_duration_longest.plays != 0 && results.user.user_shows.data.episode_duration_longest.duration != 0) {
					text += "<div class='boks2'>";
						text += load_longest_episode(results.user.user_shows.data.episode_duration_longest);
					text += "</div>";
				}

            text += "</div>";
        text += "</div>";

    } else {

        text += "<div class='boks' data-color='green' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
				text += "<div class='boks2'>";
					text += "<div class='status'>";
						text += "<h1>Shows!</h1>";
						text += "<br><br><br>";
						text += "<h2>You watched " + results.user.user_shows.data.show_plays + " shows. I get it, it's not for everyone!</h2><p>(might wanna try it)</p>"
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
        text += "<div class='boks' data-color='brown' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>Music!</h1>";
                text += "<br><br><br><h2>You listened to " + results.user.user_music.data.track_plays + ' different tracks.</h2><p>(If you can call your taste "music"...)</p>'
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_music.data.tracks, "Your top tracks", "track", false);
                text += "</div>";
				
				text += "<div class='boks2'>";
                    text += top_list(results.user.user_music.data.albums, "Your top albums", "album", false);
                text += "</div>";
				
				text += "<div class='boks2'>";
                    text += top_list(results.user.user_music.data.artists, "Your top artists", "artist", false);
                text += "</div>";
				
				text += "<div class='boks2' style='padding: 0;'>";

                    if(!results.user.user_music.data.user_album_oldest.error) {
                        text += "<div class='boks2'>";
                            text += oldest_album(results.user.user_music.data.user_album_oldest);
                        text += "</div>";
					}

					text += "<div class='boks2'>";
						text += you_spent(results.user.user_music.data.track_duration, 'music', 'listening');
					text += "</div>";
				
				text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_music.data.track_plays == 1) {

        text += "<div class='boks' data-color='brown' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

            text += "<div class='boks3'>";
                text += "<h1>Music!</h1>";
                text += "<br><br><br><h2>You listened to " + results.user.user_music.data.track_plays + " track.</h2><p>(Whatever floats your boat...)</p>"
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<div class='boks2'>";
                    text += top_list(results.user.user_music.data.music, "Your track", true, false);
                text += "</div>";
            text += "</div>";

        text += "</div>";

        } else {

            text += "<div class='boks' data-color='brown' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:none;'>";

                text += "<div class='boks3'>";
					text += "<div class='boks2'>";
						text += "<div class='status'>";
							text += "<h1>Music!</h1>";
							text += "<br><br><br>";
							text += "<h2>You listened to " + results.user.user_music.data.track_plays + " tracks. No speakers, huh?</h2><p>(might wanna try it)</p>"
							text += '<img src="assets/img/bored.svg" style="margin: auto; display: block; width: 15em;">';
						text += "</div>";
					text += "</div>";
                text += "</div>";

            text += "</div>";
        }
	
	document.getElementById("search_results").innerHTML += text;
}

function oldest_movie(array) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "The oldest movie you watched was <br><b>" + array.title + " (" + array.year + ")</b><br>";
            if(array.year < 1950) {
                html += "<br>I didn't even know they made movies back then.";
                html += '<br><br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
            } else if(array.year < 1975) {
                html += "<br>Did it even have color?";
                html += '<br><br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
            } else if(array.year < 2000) {
                html += "<br>Was it a 4K, UHD, 3D, Dolby Atmos remaster?";
                html += '<br><br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
            } else {
                html += "<br>Enjoying the classics, huh?";
                html += '<br><br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
            }
        html += "</div>";
    html += "</div>";

    return html;
}

function oldest_album(album) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "The oldest album you listened to was <br><b>" + album.parent_title + " (" + album.year + ")</b> by " + album.grandparent_title + "<br>";
			html += "<br>Maybe get the vinyl release?";
			html += '<br><br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
            
        html += "</div>";
    html += "</div>";

    return html;
}

function completion_movie(user_movie_finishing_percent, single) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            var str = JSON.stringify(user_movie_finishing_percent);
            var percent = str.split('.');
            if(!single) {
                html += "<b>Your average movie finishing percentage was " + percent[0] + "%</b>";
            } else {
                html += "<b>Your saw " + percent[0] + "%</b>";
            }
            if(percent[0] > 89) {
                html += '<br><br><img src="assets/img/champion.svg" style="margin: auto; display: block; width: 15em;">';
            }
            html += "<br><br>You're not watching the credits like a nerd, are you?";
        html += "</div>";
    html += "</div>";

    return html;
}

function paused_movie(array, single) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        if(array.paused_counter > 0) {
            var pause_time = seconds_to_time(array.paused_counter, false);
            if(!single) {
                html += "<div class='stats'>";
                    html += "Your longest movie pause was watching <br><b>" + array.title;
                    if(typeof array.year !== 'undefined' && array.year !== "" && array.year > 1000) {
                        html += " (" + array.year + ")</b>";
                    } else {
                        html += "</b>";
                    }
                    html += "<br><br>It was paused for " + pause_time + "...";
                html += "</div>";
            } else {
                html += "<div class='stats'>";
                    html += "One movie, but you still paused it<br>";
                    html += "<br><br>It was paused for " + pause_time + "...";
                html += "</div>";
            }
        } else {
            html += "<div class='stats'>";
                html += "<b>Bladder of steel</b>";
                html += '<br><br><img src="assets/img/awards.svg" style="margin: auto; display: block; width: 15em;">';
                html += "<br>You never paused a single movie.";
            html += "</div>";
        }
    html += "</div>";

    return html;
}

function load_showbuddy() {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "<b>Your top show was " + results.user.user_shows.data.shows[0].title + "</b><br>";
            if(!results.user.user_shows.data.show_buddy.error) {
                if(!results.user.user_shows.data.show_buddy.found) {
                    html += '<br><img src="assets/img/quest.svg" style="margin: auto; display: block; width: 15em;">';
                    html += "<br>That means you dared to explore where no one else would, because you are the only viewer of that show";
                } else {
                    html += "And you're not alone! Your " + results.user.user_shows.data.shows[0].title + "-buddy is ";
                    html += "<b>" + results.user.user_shows.data.show_buddy.friendly_name + "!</b><br><br>";
                    var combined = results.user.user_shows.data.show_buddy.duration + parseInt(results.user.user_shows.data.shows[0].duration);
                    var combined_2 = seconds_to_time(combined);
                    html += '<img src="assets/img/social-event.svg" style="margin: auto; display: block; width: 15em;">';
                    html += "<br>Your combined efforts resulted in <b>" + combined_2 + "</b> of " + results.user.user_shows.data.shows[0].title + "!</b>";
                }
            }
        html += "</div>";
    html += "</div>";

    return html;
}

function load_longest_episode(array) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "You really liked the episode <b>" + array.title + "</b> from " + array.grandparent_title + "<br>";
			html += "<br>It recieved " + play_plays(array.plays) + " and was endured for " + seconds_to_time(array.duration, false) + "";
        html += "</div>";
    html += "</div>";

    return html;
}

function you_spent(time, category, verb) {
    var html = "";

    var time_str = seconds_to_time(time, false);

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "You spent <b>" + time_str + "</b>";
            html += " " + verb + " ";
            html += category;
            if(category == 'music') {
                if(time > 3600) {
                    var time_min = Math.floor(time / 60);
                    html += '<br><br>That\'s ' + time_min + ' minutes!';
                }
                html += '<br><img src="assets/img/music.svg" style="margin: auto; display: block; width: 15em;">';
            } else {
                html += '<br><img src="assets/img/watching-tv.svg" style="margin: auto; display: block; width: 15em;">';
            }
        html += "</div>";
    html += "</div>";

    return html;
}

function top_list(array, title, music, year) {
    var html = "";
	
    html += "<div class='status' id='list3'>";
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

function top_list_names(array, title) {
    var html = "";

    html += "<div class='status' id='list3'>";
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

//TOP USERS
function load_users() {
    var text = "";

    text += "<div class='boks' data-color='blue' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color: none;'>";
        text += "<h1>Server-wide statistics!</h1>";
        text += "<br><br><br><br><h2>It's okay to feel shame if you are on the list.</h2><p>(or missing from it...)</p>"
        text += "<br><br>";

        text += "<div class='boks3'>";

            if(functions.get_year_stats_leaderboard) {

                text += "<div class='boks2'>";
                    text += top_list_names(results.year_stats.year_users.data, 'Top users');
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
                                text += "All the different users combined spent<br><b>" + time_movies + "</b>";
                                text += "<br>watching movies.";
                                text += "<br><br>";
								function_sum += 1;
                                time += results.year_stats.year_movies.data.movie_duration;
                            }

                            if(functions.get_year_stats_shows && results.year_stats.year_shows.data.show_plays > 0) {
                                text += "All the different users combined spent<br><b>" + time_shows + "</b>";
                                text += "<br>watching shows.";
                                text += "<br><br>";
								function_sum += 1;
                                time += results.year_stats.year_shows.data.show_duration;
                            }

                            if(functions.get_year_stats_music && results.year_stats.year_music.data.music_plays > 0) {
                                text += "All the different users combined spent<br><b>" + time_artists + "</b>";
                                text += "<br>listening to artists.";
                                text += "<br><br>";
								function_sum += 1;
                                time += results.year_stats.year_music.data.music_duration;
                            }

                            if(function_sum > 1) {
                                var time_all = seconds_to_time(Math.floor(time), false);
                                text += "That is<br><b>" + time_all + "</b><br>of content!";
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
                    text += top_list(results.year_stats.year_movies.data.movies, "Top movies", false, true);
                text += "</div>";
            }

            if(functions.get_year_stats_shows && results.year_stats.year_shows.data.show_plays > 0) {
                text += "<div class='boks2'>";
                    text += top_list(results.year_stats.year_shows.data.shows, "Top shows", false, false);
                text += "</div>";
            }

            if(functions.get_year_stats_music && results.year_stats.year_music.data.music_plays > 0) {
                text += "<div class='boks2'>";
                    text += top_list(results.year_stats.year_music.data.artists, "Top artists", "artist", false);
                text += "</div>";
            }

        text += "</div>";
    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
}

//Outro
function load_outro() {
    var text = "";

    text += "<div class='boks' data-color='black' style='height: auto !important; width: 100%; padding-bottom: 15em; padding-top: 15em; height:10em; background-color:none;'>";
        text += "<div class='boks3'>";
            
            text += "<div class='boks2'>";
                text += '<img src="assets/img/new-years.svg" style="width:100%; ">';
            text += "</div>";

            text += "<div class='boks2' style='margin-top:5em;'>";
                text += "<h1>Hope you are staying safe!</h1><br><br><h4>Goodbye.</h4>";
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
                            text += "<div id='share_wrapped_results_url' style='padding: 0.25em; background-color: white; border-radius: 0.25em; overflow: auto;'></div>";
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
                        "cookie" : get_cookie('plex-wrapped'),
                        "data" : results
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

function play_plays(plays) {
    plays = parseInt(plays);

    if(plays == 1) {
        var play_string = plays + ' play';
    } else {
        var play_string = plays + ' plays';
    }

    return play_string;
}

//Converting seconds to time in string
var seconds_in_day = 86400;
var seconds_in_hour = 3600;
var seconds_in_minute = 60;

function seconds_to_time(seconds, comma) {

    if(seconds >= seconds_in_day) {
        var time = seconds_to_days(seconds, comma);
    } else if(seconds >= seconds_in_hour) {
        var time = seconds_to_hours(seconds, comma);
    } else if(seconds >= seconds_in_minute) {
        var time = seconds_to_minutes(seconds, comma);
    } else {
        var time = seconds_to_seconds(seconds);
    }

    return time;
}

function seconds_to_days(seconds, comma) {
    var day = Math.floor(seconds / seconds_in_day);
    var rest = Math.floor(seconds % seconds_in_day);

    var hour = Math.floor(rest / seconds_in_hour);
    rest = Math.floor(rest % seconds_in_hour);

    var minute = Math.floor(rest / seconds_in_minute);
    rest = Math.floor(rest % seconds_in_minute);

    var day_string = '';
    var hour_string = '';
    var minute_string = '';

    if(day == 1) {
        day_string += day + ' day';
    } else {
        day_string += day + ' days';
    }

    if(hour == 1) {
        hour_string += hour + ' hour';
    } else {
        hour_string += hour + ' hours';
    }

    if(minute == 1) {
        minute_string += minute + ' minute';
    } else {
        minute_string += minute + ' minutes';
    }

    if(hour >= 1) {
        if(minute >= 1) {
            if(comma) {
                return day_string + ', ' + hour_string + ', ' + minute_string;
            } else {
                return day_string + ', ' + hour_string + ' and ' + minute_string;
            }
        } else {
            if(comma) {
                return day_string + ', ' + hour_string;
            } else {
                return day_string + ' and ' + hour_string;
            }
        }
    } else {
        return day_string;
    }
}

function seconds_to_hours(seconds, comma) {
    var hour = Math.floor(seconds / seconds_in_hour);
    var rest = Math.floor(seconds % seconds_in_hour);

    var minute = Math.floor(rest / seconds_in_minute);
    rest = Math.floor(rest % seconds_in_minute);

    var hour_string = '';
    var minute_string = '';

    if(hour == 1) {
        hour_string += hour + ' hour';
    } else {
        hour_string += hour + ' hours';
    }

    if(minute == 1) {
        minute_string += minute + ' minute';
    } else {
        minute_string += minute + ' minutes';
    }

    if(minute >= 1) {
        if(comma) {
            return hour_string + ', ' + minute_string;
        } else {
            return hour_string + ' and ' + minute_string;
        }
    } else {
        return hour_string;
    }
}

function seconds_to_minutes(seconds, comma) {
    seconds = parseInt(seconds);

    var minute = Math.floor(seconds / seconds_in_minute);
    var rest = Math.floor(seconds % seconds_in_minute);

    var minute_string = '';
    var second_string = '';

    if(minute == 1) {
        minute_string += minute + ' minute';
    } else {
        minute_string += minute + ' minutes';
    }

    if(seconds == 1) {
        second_string += rest + ' second';
    } else {
        second_string += rest + ' seconds';
    }
    
    if(rest >= 1) {
        if(comma) {
            return minute_string + ', ' + second_string;
        } else {
            return minute_string + ' and ' + second_string;
        }
    } else {
        return minute_string;
    }
}

function seconds_to_seconds(seconds) {
    var second_string = '';

    if(seconds == 1) {
        second_string += seconds + ' second';
    } else {
        second_string += seconds + ' seconds';
    }

    return second_string;
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