function get_stats() {
    var results;
    var functions;
    var loading_icon = document.getElementById("loading_icon");

    var p_identity = document.getElementById("p_identity").value;

    stats_form = {
                        "p_identity" : p_identity.trim(),
						"caching" : "False"
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
			try {
				var result= JSON.parse(this.responseText);
				if(result.error) {
					loading_icon.style.display = "none";
					search_button("SEARCH");
					document.getElementById('results_error').innerHTML = '<p style="color:inherit; text-shadow: none;">' + result.message + '</p>';
				} else {
					load_page(this.responseText);
				}
			} catch(error) {
				document.getElementById('results_error').innerHTML = '<p style="color:inherit; text-shadow: none;">' + "API response can't be parsed." + '</p>';
				console.log('Error: ' + error);
				console.log(this.responseText);
				loading_icon.style.display = "none";
			}
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", "api/get_stats.php");
    xhttp.send(stats_data);

    loading_icon.style.display = "inline";
}

function load_page(data){
    results = JSON.parse(data);

    if(results.error) {
        $('#results_error').html(results.message);
        loading_icon.style.display = "none";
        search_button("SEARCH");
        return
    }

    var search_box = document.getElementById("search_input");
    var login_content = document.getElementById("login_content");
    var footer = document.getElementById("footer");
    search_box.style.display = "none";
    login_content.style.display = "none";
    footer.style.display = "none";

    load_introduction();

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

    load_outro();
}
//INTRODUCTION
function load_introduction() {
    var text = "";
    text += "<div class='boks' style='width: 100%; padding-bottom: 15em; padding-top: 15em; height:auto; background-color:#D2A3A4;'>";

        text += "<div class='boks3'>";

            text += "<div class='boks2'>";
                text += '<img src="assets/img/finished-illustration.svg" style="width:100%; ">';
            text += "</div>";

            text += "<div class='boks2'>";
                text += "<br>";
                text += "<h1 style='font-size:3em; display: block;'>Hey there, " + results.user.name + "!</h1>";
                text += "<br><br><br><br>";
                text += "<h2>New year, new page of statistics...</h2>";
            text += "</div>";

        text += "</div>";

    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
}

//MOVIES
function load_movies() {
    var text = "";

    if(results.user.user_movies.data.movies.length > 1) {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#B9A3D2;'>";

            text += "<div class='boks3'>";
                text += "<h1>Movies!</h1>";
                text += "<br><br><br>";
                text += "<h2>You watched " + results.user.user_movies.data.movies.length + " movies. That's a lot of movies!</h2><p>(or not, I am pre-programmed to say that)</p>"

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

                    text += "<div class='boks2'>";
                        text += oldest_movie(results.user.user_movies.data.user_movie_oldest);
                    text += "</div>";

                    var sum = 0;
                    for(i = 0; (i < results.user.user_movies.data.movies.length); i++) {
                        sum += results.user.user_movies.data.movies[i].duration;
                    }

                    text += "<div class='boks2'>";
                        text += you_spent(sum, 'movies', 'watching');
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_movies.data.movies.length == 1) {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#B9A3D2;'>";

            text += "<div class='boks3'>";
                text += "<h1>Movies!</h1>";
                text += "<br><br><br>";
                text += "<h2>You watched " + results.user.user_movies.data.movies.length + " movie. You know what you like!</h2><p>(at least you tried it out)</p>";
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

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#B9A3D2;'>";

            text += "<div class='boks3'>";
				text += "<div class='boks2'>";
					text += "<div class='status'>";
						text += "<h1>Movies!</h1>";
						text += "<br><br><br>";
						text += "<h2>You watched " + results.user.user_movies.data.movies.length + " movies. That's impressive in itself!</h2><p>(might wanna try it)</p>"
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

    if(results.user.user_shows.data.shows.length > 1) {
        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#BBD2A3;'>";

            text += "<div class='boks3'>";
                text += "<h1>Shows!</h1>";
                text += "<br><br><br><h2>You watched " + results.user.user_shows.data.shows.length + " different shows.</h2><p>(No, watching The Office twice in a year doesn't count as two shows)</p>"
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

                    var sum = 0;
                    for(i = 0; (i < results.user.user_shows.data.shows.length); i++) {
                        sum += results.user.user_shows.data.shows[i].duration;
                    }

                    text += "<div class='boks2'>";
                        text += you_spent(sum, 'shows', 'watching');
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_shows.data.shows.length == 1) {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#BBD2A3;'>";

            text += "<div class='boks3'>";
                text += "<h1>Shows!</h1>";
                text += "<br><br><br><h2>You watched " + results.user.user_shows.data.shows.length + " show.</h2><p>(Better not be that same one again...)</p>"
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

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#B9A3D2;'>";

            text += "<div class='boks3'>";
				text += "<div class='boks2'>";
					text += "<div class='status'>";
						text += "<h1>Shows!</h1>";
						text += "<br><br><br>";
						text += "<h2>You watched " + results.user.user_shows.data.shows.length + " shows. I get it, it's not for everyone!</h2><p>(might wanna try it)</p>"
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
	
	var albums = [];
	var artists = [];
	var tracks = results.user.user_music.data.music;
	
	for(var i = 0; i < results.user.user_music.data.music.length; i++) {
		var found = false;
		
		for(var j = 0; j < albums.length; j++) {
			if(albums[j].title == results.user.user_music.data.music[i].parent_title && albums[j].grandparent_title == results.user.user_music.data.music[i].grandparent_title) {
				albums[j]["plays"] = albums[j].plays + 1;
				albums[j]["duration"] = results.user.user_music.data.music[i].duration + albums[j].duration;
				found = true;
				break;
			}
		}
		
		if(!found && results.user.user_music.data.music[i].parent_title != "" && results.user.user_music.data.music[i].grandparent_title != "") {
			albums.push({"title" : results.user.user_music.data.music[i].parent_title, "parent_rating_key" : results.user.user_music.data.music[i].parent_rating_key,"grandparent_title" : results.user.user_music.data.music[i].grandparent_title, "plays" : 1, "duration" : results.user.user_music.data.music[i].duration, "year" : results.user.user_music.data.music[i].year});
		}
	}
	
	albums.sort(function(a, b) {
		return parseFloat(b.duration) - parseFloat(a.duration);
	});
	
	for(var i = 0; i < results.user.user_music.data.music.length; i++) {
		var found = false;
		
		for(var j = 0; j < artists.length; j++) {
			if(artists[j].title == results.user.user_music.data.music[i].grandparent_title) {
				artists[j]["plays"] = artists[j].plays + 1;
				artists[j]["duration"] = results.user.user_music.data.music[i].duration + artists[j].duration;
				found = true;
				break;
			}
		}
		
		if(!found && results.user.user_music.data.music[i].grandparent_title != "") {
			artists.push({"title" : results.user.user_music.data.music[i].grandparent_title, "grandparent_rating_key" : results.user.user_music.data.music[i].grandparent_rating_key, "plays" : 1, "duration" : results.user.user_music.data.music[i].duration});
		}
	}
	
	artists.sort(function(a, b) {
		return parseFloat(b.duration) - parseFloat(a.duration);
	});

    if(results.user.user_music.data.music.length > 1) {
        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#CFA38C;'>";

            text += "<div class='boks3'>";
                text += "<h1>Music!</h1>";
                text += "<br><br><br><h2>You listened to " + results.user.user_music.data.music.length + ' different tracks.</h2><p>(If you can call your taste "music"...)</p>'
            text += "</div>";

            text += "<div class='boks3'>";

                text += "<div class='boks2'>";
                    text += top_list(results.user.user_music.data.music, "Your top tracks", true, false);
                text += "</div>";
				
				text += "<div class='boks2'>";
                    text += top_list(albums, "Your top albums", true, false);
                text += "</div>";
				
				text += "<div class='boks2'>";
                    text += top_list(artists, "Your top artists", false, false);
                text += "</div>";
				
				text += "<div class='boks2' style='padding: 0;'>";
					
					albums.sort(function(a, b) {
						return parseFloat(a.year) - parseFloat(b.year);
					});
					text += "<div class='boks2'>";
						text += oldest_album(albums);
					text += "</div>";
					
					var sum = 0;
					for(i = 0; (i < results.user.user_music.data.music.length); i++) {
						sum += results.user.user_music.data.music[i].duration;
					}

					text += "<div class='boks2'>";
						text += you_spent(sum, 'music', 'listening');
					text += "</div>";
				
				text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_music.data.music.length == 1) {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#CFA38C;'>";

            text += "<div class='boks3'>";
                text += "<h1>Music!</h1>";
                text += "<br><br><br><h2>You listened to " + results.user.user_music.data.music.length + " track.</h2><p>(Whatever floats your boat...)</p>"
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<div class='boks2'>";
                    text += top_list(results.user.user_music.data.music, "Your track", true, false);
                text += "</div>";
            text += "</div>";

        text += "</div>";

        } else {

            text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#CFA38C;'>";

                text += "<div class='boks3'>";
					text += "<div class='boks2'>";
						text += "<div class='status'>";
							text += "<h1>Music!</h1>";
							text += "<br><br><br>";
							text += "<h2>You listened to " + results.user.user_music.data.music.length + " tracks. No speakers, huh?</h2><p>(might wanna try it)</p>"
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

function oldest_album(array) {
    var html = "";

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "The oldest album you listened to was <br><b>" + array[0].title + " (" + array[0].year + ")</b> by " + array[0].grandparent_title + "<br>";
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
                    html += "Your longest movie pause was watching <br><b>" + array.title + " (" + array.year + ")</b>";
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
            html += "Your really liked the episode <b>" + array.title + "</b> from " + array.grandparent_title + "<br>";
			html += "<br>It recieved " + play_plays(array.plays) + " and was endured for " + seconds_to_time(array.duration, false) + ".";
        html += "</div>";
    html += "</div>";

    return html;
}

function you_spent(time, category, verb) {
    var html = "";

    var time = seconds_to_time(time, false);

    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "You spent <b>" + time + "</b>";
            html += " " + verb + " ";
            html += category;
            if(category == 'music') {
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
							if(music) {
								html+= array[i].grandparent_title + "<br>";
							}
							
							html += "<b>";
							
							html += array[i].title;
                            html += "</b>";
                            var movie_hour = seconds_to_time(array[i].duration, true);

                            if(typeof(array[i].year) != "undefined" && year) {
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

    text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:	#a2d1d0;'>";
        text += "<h1>Server-wide statistics!</h1>";
        text += "<br><br><br><br><h2>It's okay to feel shame if you are on the list.</h2><p>(or missing from it...)</p>"
        text += "<br><br>";

        text += "<div class='boks3'>";

            if(functions.get_year_stats_leaderboard) {

                text += "<div class='boks2'>";
                    text += top_list_names(results.year_stats.year_users.data, 'Top users');
                text += "</div>";

                var sum_movies = 0;
                var sum_shows = 0;
                var sum_artists = 0;

                if(functions.get_year_stats_movies && results.year_stats.year_movies.data.length > 0) {
                    for(i = 0; (i < results.year_stats.year_movies.data.length); i++) {
                        sum_movies += results.year_stats.year_movies.data[i].duration;
                    }
                }

                if(functions.get_year_stats_shows && results.year_stats.year_shows.data.length > 0) {
                    for(i = 0; (i < results.year_stats.year_shows.data.length); i++) {
                        sum_shows += results.year_stats.year_shows.data[i].duration;
                    }
                }

                if(functions.get_year_stats_music && results.year_stats.year_music.data.length > 0) {
                    for(i = 0; (i < results.year_stats.year_music.data.length); i++) {
                        sum_artists += results.year_stats.year_music.data[i].duration;
                    }
                }

                var time_movies = seconds_to_time(sum_movies, false);
                var time_shows = seconds_to_time(sum_shows, false);
                var time_artists = seconds_to_time(sum_artists, false);
                var time_all = seconds_to_time(Math.floor(sum_movies + sum_shows + sum_artists), false);
				var function_sum = 0;

                text += "<div class='boks2'>";
                    text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                        text += "<div class='stats'>";

                            if(functions.get_year_stats_movies && results.year_stats.year_movies.data.length > 0) {
                                text += "All the different users combined spent <b>" + time_movies + "</b>";
                                text += " watching movies.";
                                text += "<br><br>";
								function_sum += 1;
                            }

                            if(functions.get_year_stats_shows && results.year_stats.year_shows.data.length > 0) {
                                text += "All the different users combined spent <b>" + time_shows + "</b>";
                                text += " watching shows.";
                                text += "<br><br>";
								function_sum += 1;
                            }

                            if(functions.get_year_stats_music && results.year_stats.year_music.data.length > 0) {
                                text += "All the different users combined spent <b>" + time_artists + "</b>";
                                text += " listening to artists.";
                                text += "<br><br>";
								function_sum += 1;
                            }

                            if(function_sum > 1) {
                                text += "That is <b>" + time_all + "</b><br>of content!";
                            }

                            text += '<img src="assets/img/home.svg" style="margin: auto; display: block; width: 15em;">';

                        text += "</div>";
                    text += "</div>";
                text += "</div>";

            }

        text += "</div>";
        text += "<div class='boks3'>";

            if(functions.get_year_stats_movies && results.year_stats.year_movies.data.length > 0) {
                text += "<div class='boks2'>";
                    text += top_list(results.year_stats.year_movies.data, "Top movies", false, true);
                text += "</div>";
            }

            if(functions.get_year_stats_shows && results.year_stats.year_shows.data.length > 0) {
                text += "<div class='boks2'>";
                    text += top_list(results.year_stats.year_shows.data, "Top shows", false, false);
                text += "</div>";
            }

            if(functions.get_year_stats_music && results.year_stats.year_music.data.length > 0) {
                var artists = [];

                for(var i = 0; i < results.year_stats.year_music.data.length; i++) {
                    var found = false;

                    for(var j = 0; j < artists.length; j++) {
                        if(artists[j].title == results.year_stats.year_music.data[i].grandparent_title) {
                            artists[j]["plays"] = artists[j].plays + 1;
                            artists[j]["duration"] = results.year_stats.year_music.data[i].duration + artists[j].duration;
                            found = true;
                            break;
                        }
                    }

                    if(!found && results.year_stats.year_music.data[i].grandparent_title != "") {
                        artists.push({"title" : results.year_stats.year_music.data[i].grandparent_title, "grandparent_rating_key" : results.year_stats.year_music.data[i].grandparent_rating_key, "plays" : 1, "duration" : results.year_stats.year_music.data[i].duration});
                    }
                }

                artists.sort(function(a, b) {
                    return parseFloat(b.duration) - parseFloat(a.duration);
                });


                text += "<div class='boks2'>";
                    text += top_list(artists, "Top artists", false, false);
                text += "</div>";
            }

        text += "</div>";
    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
}

//Outro
function load_outro() {
    var text = "";

    text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 15em; padding-top: 15em; height:10em; background-color:#39393A;'>";
        text += "<div class='boks3'>";
            text += "<div class='boks2'>";
                text += '<img src="assets/img/new-years.svg" style="width:100%; ">';
            text += "</div>";
            text += "<div class='boks2' style='margin-top:5em;'>";
                text += "<h1>Hope you are staying safe!</h1><br><br><h4>Goodybye.</h4>";
            text += "</div>";
        text += "</div>";
    text += "</div>";

    document.getElementById("search_results").innerHTML += text;
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

    if(day < 2) {
        day_string += day + ' day';
    } else {
        day_string += day + ' days';
    }

    if(hour < 2) {
        hour_string += hour + ' hour';
    } else {
        hour_string += hour + ' hours';
    }

    if(minute < 2) {
        minute_string += minute + ' minute';
    } else {
        minute_string += minute + ' minutes';
    }

    if(!hour == 0) {
        if(!minute == 0) {
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

    if(hour < 2) {
        hour_string += hour + ' hour';
    } else {
        hour_string += hour + ' hours';
    }

    if(minute < 2) {
        minute_string += minute + ' minute';
    } else {
        minute_string += minute + ' minutes';
    }

    if(!minute == 0) {
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


    if(minute < 2) {
        minute_string += minute + ' minute';
    } else {
        minute_string += minute + ' minutes';
    }

    if(seconds < 2) {
        second_string += rest + ' second';
    } else {
        second_string += rest + ' seconds';
    }

    if(!seconds == 0) {
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