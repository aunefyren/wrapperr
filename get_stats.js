function get_stats() {
    var results;
    var functions;
    var loading_icon = document.getElementById("loading_icon");

    var p_identity = document.getElementById("p_identity").value;

    //var p_identity = p_identity.replace(/[&\/\\#,+()$~%:*?<>{}]/g, '');

    stats_form = {
                        "p_identity" : p_identity
                   };

    var stats_data = JSON.stringify(stats_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            if(result.error) {
                loading_icon.style.display = "none";
                search_button("SEARCH");
                document.getElementById('results_error').innerHTML = '<p style="color:inherit; text-shadow: none;">' + result.message + '</p>';

            } else {
                load_page(this.responseText);
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
        exit(1);
    }

    var search_box = document.getElementById("search_input");
    var login_content = document.getElementById("login_content");
    search_box.style.display = "none";
    login_content.style.display = "none";

    load_introduction();

    if(!results.user.user_movies.error && functions.get_user_movie_stats) {
        load_movies();
    }
    if(!results.user.user_shows.error && functions.get_user_show_stats) {
        load_shows();
    }

    if(!results.year_stats.error && functions.get_year_stats) {
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
                text += "<h1>Let's look at some movies.</h1>";
                text += "<br><br><br>";
                text += "<h2>You watched " + results.user.user_movies.data.movies.length + " movies. That's a lot of movies!</h2><p>(or not, I am pre-programmed to say that)</p>"

                text += "<br><br>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<div class='boks2'>";
                    text += "<div class='status' id='list3'>";
                        text += "<div class='stats'>";
                            text += "<div class='status-title'>Your top movies</div>";
                            text += "<div class='stats-list'>";
                                for(i = 0; (i < results.user.user_movies.data.movies.length && i < 10); i++) {
                                    text += "<div class='item'>";
                                        text += "<div class='number'>";
                                            text += i+1 + ". ";
                                        text += "</div>";

                                        text += "<div class='movie_name'><b>";
                                            text += results.user.user_movies.data.movies[i].title;
                                            var movie_hour = time_hours(results.user.user_movies.data.movies[i].duration)
                                            text += "</b> (" + results.user.user_movies.data.movies[i].year + ")<br>" + movie_hour[0] + " hours, " + movie_hour[1] + " minutes<br>" + results.user.user_movies.data.movies[i].plays + " plays";
                                        text += "</div>";
                                    text += "</div>";
                                }
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    text += "<div class='boks2'>";
                        text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                            text += "<div class='stats'>";
                                var str = JSON.stringify(results.user.user_movies.data.user_movie_finishing_percent);
                                var percent = str.split('.');
                                text += "<b>Your average movie finishing percentage was " + percent[0] + "%</b>";
                                if(percent[0] > 89) {
                                    text += '<br><br><img src="assets/img/champion.svg" style="margin: auto; display: block; width: 15em;">';
                                }
                                text += "<br><br>You're not watching the credits like a nerd, are you?";
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";

                    text += "<div class='boks2'>";
                        text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";

                            var str = JSON.stringify(results.user.user_movies.data.user_movie_most_paused.paused_counter / 60);
                            var minutes = str.split('.');

                            if(minutes[0] > 0) {
                            text += "<div class='stats'>";
                                text += "Your longest movie pause was watching <br><b>" + results.user.user_movies.data.user_movie_most_paused.title + " (" + results.user.user_movies.data.user_movie_most_paused.year + ")</b>";

                                text += "<br><br>It was paused for " + minutes[0] + " minutes...";
                            text += "</div>";
                            } else {
                                text += "<div class='stats'>";
                                    text += "<b>Bladder of steel</b>";
                                    text += '<br><br><img src="assets/img/awards.svg" style="margin: auto; display: block; width: 15em;">';
                                    text += "<br>You never paused a single movie.";
                                text += "</div>";
                            }
                        text += "</div>";
                    text += "</div>";

                    text += "<div class='boks2'>";
                        text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                            text += "<div class='stats'>";
                                text += "The oldest movie you watched was <br><b>" + results.user.user_movies.data.user_movie_oldest.title + " (" + results.user.user_movies.data.user_movie_oldest.year + ")</b><br>";
                                if(results.user.user_movies.data.user_movie_oldest.year < 1950) {
                                    text += "<br>I didn't even know they made movies back then.";
                                    text += '<br><br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
                                } else if(results.user.user_movies.data.user_movie_oldest.year < 1975) {
                                    text += "<br>Did it even have color?";
                                    text += '<br><br><img src="assets/img/old-man.svg" style="margin: auto; display: block; width: 15em;">';
                                } else if(results.user.user_movies.data.user_movie_oldest.year < 2000) {
                                    text += "<br>Was it a 4K, UHD, 3D, Dolby Atmos remaster?";
                                } else {
                                    text += "<br>Enjoying the classics, huh?";
                                }
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";

                    var sum = 0;
                    for(i = 0; (i < results.user.user_movies.data.movies.length); i++) {
                        sum += results.user.user_movies.data.movies[i].duration;
                    }
                    var sum_split = time_hours(sum);
                    text += "<div class='boks2'>";
                        text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                            text += "<div class='stats'>";
                                text += "You spent <b>" + sum_split[0] + " hours and " + sum_split[1] + " minutes</b>";
                                text += " watching movies";
                                text += '<br><img src="assets/img/watching-tv.svg" style="margin: auto; display: block; width: 15em;">';
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_movies.data.movies.length == 1) {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#B9A3D2;'>";

            text += "<div class='boks3'>";
                text += "<h1>Let's look at some movies.</h1>";
                text += "<br><br><br>";
                text += "<h2>You watched " + results.user.user_movies.data.movies.length + " movie. You know what you like!</h2><p>(at least you tried it out)</p>";
                text += "<br><br>";
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<div class='boks2'>";
                    text += "<div class='status' id='list3'>";
                        text += "<div class='stats'>";
                            text += "<div class='status-title'>Your movie</div>";
                            text += "<div class='stats-list'>";
                                for(i = 0; (i < results.user.user_movies.data.movies.length && i < 10); i++) {
                                    text += "<div class='item'>";
                                        text += "<div class='number'>";
                                            text += i+1 + ". ";
                                        text += "</div>";

                                        text += "<div class='movie_name'><b>";
                                            text += results.user.user_movies.data.movies[i].title;
                                            var movie_hour = time_hours(results.user.user_movies.data.movies[i].duration)
                                            text += "</b> (" + results.user.user_movies.data.movies[i].year + ")<br>" + movie_hour[0] + " hours, " + movie_hour[1] + " minutes<br>" + results.user.user_movies.data.movies[i].plays + " plays";
                                        text += "</div>";
                                    text += "</div>";
                                }
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    text += "<div class='boks2'>";
                        text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                            text += "<div class='stats'>";
                                var str = JSON.stringify(results.user.user_movies.data.user_movie_finishing_percent);
                                var percent = str.split('.');
                                text += "<b>Your saw " + percent[0] + "%</b>";
                                if(percent[0] > 89) {
                                    text += '<br><br><img src="assets/img/champion.svg" style="margin: auto; display: block; width: 15em;">';
                                }
                                text += "<br><br>You're not watching the credits like a nerd, are you?";
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";

                    text += "<div class='boks2'>";
                        text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";

                            var str = JSON.stringify(results.user.user_movies.data.user_movie_most_paused.paused_counter / 60);
                            var minutes = str.split('.');

                            if(minutes[0] > 0) {
                            text += "<div class='stats'>";
                                text += "Your longest movie pause was watching <br><b>" + results.user.user_movies.data.user_movie_most_paused.title + " (" + results.user.user_movies.data.user_movie_most_paused.year + ")</b>";

                                text += "<br><br>It was paused for " + minutes[0] + " minutes...";
                            text += "</div>";
                            } else {
                                text += "<div class='stats'>";
                                    text += "<b>Bladder of steel</b>";
                                    text += '<br><br><img src="assets/img/awards.svg" style="margin: auto; display: block; width: 15em;">';
                                    text += "<br>You never paused the movie.";
                                text += "</div>";
                            }
                        text += "</div>";
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#B9A3D2;'>";

            text += "<div class='boks3'>";
                text += "<div class='status'>";
                    text += "<h1>Let's look at some movies.</h1>";
                    text += "<br><br><br>";
                    text += "<h2>You watched " + results.user.user_movies.data.movies.length + " movies. That's impressive in itself!</h2><p>(might wanna try it out)</p>"
                    text += '<img src="assets/img/bored.svg" style="margin: auto; display: block; width: 15em;">';
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
                text += "<h1>Now, let's have a look at some shows!</h1>";
                text += "<br><br><br><h2>You watched " + results.user.user_shows.data.shows.length + " different shows.</h2><p>(No, watching The Office twice in a year doesn't count as two shows)</p>"
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<div class='boks2'>";
                    text += "<div class='status' id='list3' style=''>";
                        text += "<div class='stats'>";
                            text += "<div class='status-title'>Your top shows</div>";
                            text += "<div class='stats-list'>";
                            for(i = 0; (i < results.user.user_shows.data.shows.length && i < 10); i++) {
                                text += "<div class='item'>";
                                    text += "<div class='number'>";
                                        text += i+1 + ". ";
                                    text += "</div>";

                                    text += "<div class='movie_name'><b>";
                                        text += results.user.user_shows.data.shows[i].title;
                                        var show_hour = time_hours(results.user.user_shows.data.shows[i].duration)
                                        text += "</b><br>" + show_hour[0] + " hours, " + show_hour[1] + " minutes<br>" + results.user.user_shows.data.shows[i].plays + " plays";
                                    text += "</div>";
                                text += "</div>";
                            }
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";
                text += "</div>";

                text += "<div class='boks2' style='padding: 0;'>";

                    if(results.user.user_shows.data.shows.length > 0 && !results.user.user_shows.data.show_buddy.error && functions.get_user_show_buddy) {
                        text += "<div class='boks2'>";
                            text += load_showbuddy();
                        text += "</div>";
                    }

                    var sum = 0;
                    for(i = 0; (i < results.user.user_shows.data.shows.length); i++) {
                        sum += results.user.user_shows.data.shows[i].duration;
                    }
                    var sum_split = time_hours(sum);
                    text += "<div class='boks2'>";
                        text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                            text += "<div class='stats'>";
                                text += "You spent <b>" + sum_split[0] + " hours and " + sum_split[1] + " minutes</b>";
                                text += " watching shows";
                                text += '<br><img src="assets/img/watching-tv.svg" style="margin: auto; display: block; width: 15em;">';
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";

                text += "</div>";

            text += "</div>";
        text += "</div>";

    } else if(results.user.user_shows.data.shows.length == 1) {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#BBD2A3;'>";

            text += "<div class='boks3'>";
                text += "<h1>Now, let's have a look at some shows!</h1>";
                text += "<br><br><br><h2>You watched " + results.user.user_shows.data.shows.length + " show.</h2><p>(Better not be that same one again...)</p>"
            text += "</div>";

            text += "<div class='boks3'>";
                text += "<div class='boks2'>";
                    text += "<div class='status' id='list3' style=''>";
                        text += "<div class='stats'>";
                            text += "<div class='status-title'>Your show</div>";
                            text += "<div class='stats-list'>";
                            for(i = 0; (i < results.user.user_shows.data.shows.length && i < 10); i++) {
                                text += "<div class='item'>";
                                    text += "<div class='number'>";
                                        text += i+1 + ". ";
                                    text += "</div>";

                                    text += "<div class='movie_name'><b>";
                                        text += results.user.user_shows.data.shows[i].title;
                                        var show_hour = time_hours(results.user.user_shows.data.shows[i].duration)
                                        text += "</b><br>" + show_hour[0] + " hours, " + show_hour[1] + " minutes<br>" + results.user.user_shows.data.shows[i].plays + " plays";
                                    text += "</div>";
                                text += "</div>";
                            }
                            text += "</div>";
                        text += "</div>";
                    text += "</div>";
                text += "</div>";

                if(results.user.user_shows.data.shows.length > 0 && !results.user.user_shows.data.show_buddy.error && functions.get_user_show_buddy) {
                    text += "<div class='boks2'>";

                    text += load_showbuddy();

                    text += "</div>";
                }

            text += "</div>";
        text += "</div>";

    } else {

        text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:#B9A3D2;'>";

            text += "<div class='boks3'>";
                text += "<div class='status'>";
                    text += "<h1>Now, let's have a look at some shows!</h1>";
                    text += "<br><br><br>";
                    text += "<h2>You watched " + results.user.user_shows.data.shows.length + " shows. I get it, it's not for everyone!</h2><p>(might wanna try it out)</p>"
                    text += '<img src="assets/img/bored.svg" style="margin: auto; display: block; width: 15em;">';
                text += "</div>";
            text += "</div>";

            text += "</div>";
    }

    document.getElementById("search_results").innerHTML += text;
}

function load_showbuddy() {
    var html = "";
    html += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
        html += "<div class='stats'>";
            html += "<b>Your show was " + results.user.user_shows.data.shows[0].title + "</b><br>";
            if(!results.user.user_shows.data.show_buddy.error) {
                if(!results.user.user_shows.data.show_buddy.user.found) {
                    html += '<br><img src="assets/img/quest.svg" style="margin: auto; display: block; width: 15em;">';
                    html += "<br>That means you dared to explore where no one else would, because you're the only viewer of that show";
                } else {
                    html += "And you're not alone! Your " + results.user.user_shows.data.shows[0].title + "-buddy is ";
                    html += "<b>" + results.user.user_shows.data.show_buddy.user.user + "!</b><br><br>";
                    var combined = results.user.user_shows.data.show_buddy.user.duration + parseInt(results.user.user_shows.data.shows[0].duration);
                    var combined_2 = time_hours(combined);
                    html += '<img src="assets/img/social-event.svg" style="margin: auto; display: block; width: 15em;">';
                    html += "<br>Your combined efforts resulted in <b>" + combined_2[0] + " hours and " + combined_2[1] + " minutes</b> of " + results.user.user_shows.data.shows[0].title + "!</b>";
                }
            }
        html += "</div>";
    html += "</div>";
    return html;
}

//TOP USERS
function load_users() {
    var text = "";

    text += "<div class='boks' style='height: auto !important; width: 100%; padding-bottom: 25em; padding-top: 25em; height:10em; background-color:	#a2d1d0;'>";
        text += "<h1>Finally, let's look at the top users, movies and shows!</h1>";
        text += "<br><br><br><br><h2>It's okay to feel shame if you are on the list.</h2><p>(or missing from it...)</p>"
        text += "<br><br>";

        text += "<div class='boks3'>";

            text += "<div class='boks2'>";
                text += "<div class='status' id='list3'>";
                    text += "<div class='stats'>";
                        text += "<div class='status-title'>Top users</div>";
                        text += "<div class='stats-list'>";
                        for(i = 0; i < 10 && i < results.year_stats.data.users.length; i++) {
                            if(i == 0) {
                                text += "<div class='item gold'>";
                            } else if(i == 1) {
                                text += "<div class='item silver'>";
                            } else if(i == 2) {
                                text += "<div class='item bronze'>";
                            } else {
                                text += "<div class='item'>";
                            }
                                text += "<div class='number'>";
                                    text += i+1 + ". ";
                                text += "</div>";

                                if(results.year_stats.data.users[i].user == results.user.name) {
                                    text += "<div class='name you'>";
                                        text += results.year_stats.data.users[i].user;
                                    text += "</div>";
                                }else {
                                    text += "<div class='name'>";
                                        text += results.year_stats.data.users[i].user;
                                    text += "</div>";
                                }
                            text += "</div>";
                        }
                        text += "</div>";
                    text += "</div>";
                text += "</div>";
            text += "</div>";

            var sum_movies = 0;
            for(i = 0; (i < results.year_stats.data.top_movies.length); i++) {
                sum_movies += results.year_stats.data.top_movies[i].duration;
            }
            var sum_movies_split = time_days(sum_movies);

            var sum_shows = 0;
            for(i = 0; (i < results.year_stats.data.top_shows.length); i++) {
                sum_shows += results.year_stats.data.top_shows[i].duration;
            }
            var sum_shows_split = time_days(sum_shows);
            text += "<div class='boks2'>";
                text += "<div class='status' id='list3' style='padding:1em;min-width:15em;'>";
                    text += "<div class='stats'>";
                        text += "All the different users combined spent <b>" + sum_movies_split[0] + " days and " + sum_movies_split[1] + " hours</b>";
                        text += " watching movies.";
                        text += "<br><br>And, the users spent <b>" + sum_shows_split[0] + " days and " + sum_shows_split[1] + " hours</b>";
                        text += " watching shows.";
                        text += "<br><br>That is <b>" + Number(sum_shows_split[0] + sum_movies_split[0]) + " days and " + Number(sum_shows_split[1] + sum_movies_split[1]) + " hours </b><br>of content!";
                        text += '<img src="assets/img/home.svg" style="margin: auto; display: block; width: 15em;">';
                    text += "</div>";
                text += "</div>";
            text += "</div>";

        text += "</div>";
        text += "<div class='boks3'>";

            text += "<div class='boks2'>";
                text += "<div class='status' id='list3' style=''>";
                    text += "<div class='stats'>";
                        text += "<div class='status-title'>Top movies</div>";
                        text += "<div class='stats-list'>";
                        for(i = 0; i < 10 && i < results.year_stats.data.top_movies.length; i++) {
                            text += "<div class='item'>";
                                text += "<div class='number'>";
                                    text += i+1 + ". ";
                                text += "</div>";

                                text += "<div class='movie_name'><b>";
                                    text += results.year_stats.data.top_movies[i].title;
                                    var movie_hour = time_hours(results.year_stats.data.top_movies[i].duration)
                                    text += "</b><br>" + movie_hour[0] + " hours and " + movie_hour[1] + " minutes<br>" + results.year_stats.data.top_movies[i].plays + " plays";
                                text += "</div>";
                            text += "</div>";
                        }
                        text += '</div>';
                    text += "</div>";
                text += "</div>";
            text += "</div>";

            text += "<div class='boks2'>";
                text += "<div class='status' id='list3' style=''>";
                    text += "<div class='stats'>";
                        text += "<div class='status-title'>Top shows</div>";
                        text += "<div class='stats-list'>";
                        for(i = 0; i < 10 && i < results.year_stats.data.top_shows.length; i++) {
                            text += "<div class='item'>";
                                text += "<div class='number'>";
                                    text += i+1 + ". ";
                                text += "</div>";

                                text += "<div class='movie_name'><b>";
                                    text += results.year_stats.data.top_shows[i].title;
                                    var show_hour = time_hours(results.year_stats.data.top_shows[i].duration)
                                    text += "</b><br>" + show_hour[0] + " hours and " + show_hour[1] + " minutes<br>" + results.year_stats.data.top_shows[i].plays + " plays";
                                text += "</div>";
                            text += "</div>";
                        }
                        text += '</div>';
                    text += "</div>";
                text += "</div>";
            text += "</div>";

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