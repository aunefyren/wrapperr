<?php
$data = json_decode(file_get_contents("php://input"));
$config = json_decode(file_get_contents("../config.json"));

// Libraries for movies and shows
$library_id_movies = $config->library_id_movies;
$library_id_shows = $config->library_id_shows;

//Base-URL for connections
$connection = create_url();

//Declare given email
if($data){
	$p_email = htmlspecialchars($data->p_email);
} else {
	$p_email = htmlspecialchars($_GET["email"]);
}

// Get user ID
$id = tautulli_get_user($p_email);
if (!$id) {
    echo json_encode(array("message" => "No user found with that email.", "error" => "true"));
    exit(0);
}

// Get user name
$name = tautulli_get_name($id);
if(!$name) {
    echo json_encode(array("message" => "Could not find username.", "error" => "true"));
    exit(0);
}

if($config->get_user_movie_stats) {
    $user_movies = array("data" => tautulli_get_user_movies($id), "message" => "Success. User movie-stats are loaded.", "error" => False);
} else {
    $user_movies = array("error" => True, "message" => "Disabled in config.");
}

if($config->get_user_show_stats) {
    $user_shows = array("data" => tautulli_get_user_shows($id), "message" => "Success. User show-stats are loaded.", "error" => False);
} else {
    $user_shows = array("error" => True, "message" => "Disabled in config.", "data" => array());
}

if($config->get_user_show_buddy && $config->get_user_show_stats) {
    $user_shows["data"] = $user_shows["data"] + array("show_buddy" => array("user" => tautulli_get_user_show_buddy($id, $user_shows["data"]["shows"]), "error" => False, "Message" => "Buddy is loaded."));
} else {
    $user_shows["data"] = $user_shows["data"] + array("show_buddy" => array("message" => "Disabled in config.", "error" => True));
}

if($config->get_year_stats) {
    $year_stats = array("data" => tautulli_get_year_stats($id), "error" => False, "Message" => "Year stats are loaded.");
} else {
    $year_stats = array("data" => array(), "message" => "Disabled in config.", "error" => True);
}

// Print results
echo json_encode(array( "error" => False,
                        "message" => "Data processed.",
                        "user" => array("name" => $name,
                                        "id" => $id,
                                        "user_movies" => $user_movies,
                                        "user_shows" => $user_shows
                                        ),
                        "year_stats" => $year_stats,
                        ));

function create_url() {
    global $config;
    //creating url

    if($config->tautulli_root != "") {
        $root = "/" . $config->tautulli_root;
    } else {
        $root = $config->tautulli_root;
    }

    if($config->tautulli_port != "") {
        $port = ":" . $config->tautulli_port;
    } else {
        $port = "";
    }

    $ip = $config->tautulli_ip;

    if($config->ssl) {
        $base = "https://";
    } else {
        $base = "http://";
    }

    return $base . $ip . $port . $root;
}

function tautulli_get_user($email) {
    global $connection;
    global $config;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_users";
    $response = json_decode(file_get_contents($url));

    for ($i = 0; $i < count($response->response->data); $i++) {
        if ($response->response->data[$i]->email == $email) {
            return $response->response->data[$i]->user_id;
        }
    }
    return False;
}

function tautulli_get_name($id) {
    global $connection;
    global $config;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_user_ips&user_id=" . $id;
    $response = json_decode(file_get_contents($url));
    $name = $response->response->data->data[0]->friendly_name;
    if($name != "" && $name != Null) {
        return $name;
    } else {
        return False;
    }
}

function tautulli_get_user_movies($id) {
    global $connection;
    global $config;
    global $library_id_movies;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&user_id=" . $id . "&section_id=" . $library_id_movies . "&order_column=date&order_dir=desc&include_activity=0&length=" . $config->tautulli_length . "";
    $response = json_decode(file_get_contents($url));
    $array = $response->response->data->data;
    $movies = array();
    $movies_percent_complete = array();

    for ($i = 0; $i < count($array); $i++) {
        if($array[$i]->date > $config->wrapped_end) {
            continue;
        } else if ($array[$i]->date < $config->wrapped_start) {
            break;
        }

        $duration = $array[$i]->duration;

        if($duration > 300) {
            array_push($movies_percent_complete, $array[$i]->percent_complete);
        }

        $title = $array[$i]->full_title;
        $year = $array[$i]->year;
        $percent_complete = $array[$i]->percent_complete;
        $paused_counter = $array[$i]->paused_counter;

        $found = False;

        for ($j = 0; $j < count($movies); $j++) {
            if($movies[$j]["title"] == $title && $movies[$j]["year"] == $year ) {
                $movies[$j]["plays"] = intval($movies[$j]["plays"]) + 1;
                $movies[$j]["duration"] = intval($movies[$j]["duration"]) + intval($duration);
                $found = True;

                break;
            }
        }

        if(!$found) {
            array_push($movies, array("title" => $title, "year" => $year, "plays" => 1, "duration" => $duration, "paused_counter" => $paused_counter));
        }
    }

    // Sort $movies for longest pause
    $paused_counter = array_column($movies, 'paused_counter');
    array_multisort($paused_counter, SORT_DESC, $movies);
    if(count($movies) > 0) {
        $movie_most_paused = array("title" => $movies[0]["title"], "year" => $movies[0]["year"], "plays" => $movies[0]["plays"], "duration" => $movies[0]["duration"], "paused_counter" => $movies[0]["paused_counter"]);
    } else {
        $movie_most_paused = array("title" => "No movies watched", "year" => 0, "plays" => 0, "duration" => 0, "paused_counter" => 0);
    }

    // Sort $movies for oldest movie
    $year = array_column($movies, 'year');
    array_multisort($year, SORT_ASC, $movies);
    if(count($movies) > 0) {
        $movie_oldest = array("title" => $movies[0]["title"], "year" => $movies[0]["year"], "plays" => $movies[0]["plays"], "duration" => $movies[0]["duration"], "paused_counter" => $movies[0]["paused_counter"]);
    } else {
        $movie_oldest = array("title" => "No movies watched", "year" => 0, "plays" => 0, "duration" => 0, "paused_counter" => 0);
    }

    // Sort $movies by longest duration
    $duration = array_column($movies, 'duration');
    array_multisort($duration, SORT_DESC, $movies);


    // Calculate average movie finishing percentage
    $sum = 0;
    for($i = 0; $i < count($movies_percent_complete); $i++) {
        $sum = $sum + $movies_percent_complete[$i];
    }
    if(count($movies_percent_complete) > 0) {
        $movie_percent_average = $sum / count($movies_percent_complete);
    } else {
        $movie_percent_average = 0;
    }

    return array("movies" => $movies, "user_movie_most_paused" => $movie_most_paused, "user_movie_finishing_percent" => $movie_percent_average, "user_movie_oldest" => $movie_oldest);
}

function tautulli_get_user_shows($id) {
    global $connection;
    global $config;
    global $library_id_shows;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&user_id=" . $id . "&section_id=" . $library_id_shows . "&order_column=date&order_dir=desc&include_activity=0&length=" . $config->tautulli_length . "";
    $response = json_decode(file_get_contents($url));
    $array = $response->response->data->data;
    $shows = array();

    for ($i = 0; $i < count($array); $i++) {
        if($array[$i]->date > $config->wrapped_end) {
            continue;
        } else if ($array[$i]->date < $config->wrapped_start) {
            break;
        }

        $title = $array[$i]->grandparent_title;
        $duration = $array[$i]->duration;
        $found = False;

        for ($j = 0; $j < count($shows); $j++) {
            if($shows[$j]["title"] == $title) {
                $shows[$j]["duration"] = intval($shows[$j]["duration"]) + intval($duration);
                $shows[$j]["plays"] = intval($shows[$j]["plays"]) + 1;
                $found = True;

                break;
            }
        }

        if(!$found) {
            array_push($shows, array("title" => $title, "duration" => $duration, "plays" => 1));
        }
    }

    //Sort shows by duration
    $duration = array_column($shows, 'duration');
    array_multisort($duration, SORT_DESC, $shows);

    return array("shows" => $shows);
}

function tautulli_get_user_show_buddy($id, $shows) {
    global $connection;
    global $config;
    global $library_id_shows;
    global $name;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&section_id=" . $library_id_shows . "&order_column=date&include_activity=0&media_type=episode&order_dir=desc&length=" . $config->tautulli_length . "&search=" . urlencode($shows[0]["title"]);
    $response = json_decode(file_get_contents($url));
    $array = $response->response->data->data;
    $top_show_users = array();

    for ($i = 0; $i < count($array); $i++) {
        $user = $array[$i]->friendly_name;
        $duration = $array[$i]->duration;

        if($array[$i]->date > $config->wrapped_end || $array[$i]->grandparent_title != $shows[0]["title"]) {
    		continue;
        } else if($array[$i]->date < $config->wrapped_start) {
            break;
        }

        $found = False;

        for ($j = 0; $j < count($top_show_users); $j++) {
            if($top_show_users[$j]["user"] == $user) {
                $top_show_users[$j]["duration"] = intval($top_show_users[$j]["duration"]) + intval($duration);
                $found = True;

                break;
            }
        }

        if(!$found) {
            array_push($top_show_users, array("user" => $user, "duration" => $duration));
        }
    }

    // Sort show-buddies by duration
    $duration = array_column($top_show_users, 'duration');
    array_multisort($duration, SORT_DESC, $top_show_users);

    $index = 0;
    if(count($top_show_users) > 1) {
        for($i = 0; $i < count($top_show_users); $i++) {
            if($top_show_users[$i]["user"] == $name) {
                $index = $i;
            }
        }

        if((($index == 0) || ($index % 2 == 0)) AND ($index < count($top_show_users)-1)) {
            $buddy = array("user" => $top_show_users[$index+1]["user"], "duration" => $top_show_users[$index+1]["duration"], "found" => True, "watched_relative_to_you" => "less");
        } else {
            $buddy = array("user" => $top_show_users[$index-1]["user"], "duration" => $top_show_users[$index-1]["duration"], "found" => True, "watched_relative_to_you" => "more");
        }

    } else {
        $buddy = array("user" => False, "duration" => 0, found => False, "watched_relative_to_you" => False);
    }

    return $buddy;
}

function tautulli_get_year_stats($id) {
    global $connection;
    global $config;
    global $library_id_shows;
    global $name;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&media_type=movie&include_activity=0&order_column=date&order_dir=desc&length=" . $config->tautulli_length;
    $response = json_decode(file_get_contents($url));
    $array = $response->response->data->data;
    $users = array();
    $movies = array();
    $shows = array();

    for ($i = 0; $i < count($array); $i++) {
        if(intval($array[$i]->date) > $config->wrapped_end) {
            continue;
        } else if(intval($array[$i]->date) < $config->wrapped_start) {
            break;
        }

        $title = $array[$i]->full_title;
        $duration = $array[$i]->duration;
        $user = $array[$i]->friendly_name;
        $user_id = $array[$i]->user_id;
        $year = $array[$i]->year;

        $user_found = False;
        $movie_found = False;

        for ($j = 0; $j < count($users); $j++) {
            if($users[$j]["id"] == $user_id) {
                $users[$j]["duration_movies"] = intval($users[$j]["duration_movies"]) + intval($duration);
                $users[$j]["duration"] = intval($users[$j]["duration"]) + intval($duration);
                $users[$j]["plays"] = intval($users[$j]["plays"]) + 1;
                $user_found = True;
                break;
            }
        }

        if(!$user_found) {
            array_push($users, array("user" => $user, "id" => $user_id, "duration" => $duration, "duration_movies" => $duration, "duration_shows" => 0, "plays" => 1));
        }

        for ($j = 0; $j < count($movies); $j++) {
            if($movies[$j]["title"] == $title && $movies[$j]["year"] == $year) {
                $movies[$j]["duration"] = intval($movies[$j]["duration"]) + intval($duration);
                $movies[$j]["plays"] = intval($movies[$j]["plays"]) + 1;
                $movie_found = True;
                break;
            }
        }

        if(!$movie_found) {
            array_push($movies, array("title" => $title, "year" => $year, "duration" => $duration, "plays" => 1));
        }
    }

    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&media_type=episode&include_activity=0&order_column=date&order_dir=desc&length=" . $config->tautulli_length;
    $response = json_decode(file_get_contents($url));
    $array = $response->response->data->data;

    for ($i = 0; $i < count($array); $i++) {
        if(intval($array[$i]->date) > $config->wrapped_end) {
            continue;
        } else if(intval($array[$i]->date) < $config->wrapped_start) {
            break;
        }

        $title = $array[$i]->grandparent_title;
        $duration = $array[$i]->duration;
        $user = $array[$i]->friendly_name;
        $user_id = $array[$i]->user_id;
        $year = $array[$i]->year;

        $user_found = False;
        $show_found = False;

        for ($j = 0; $j < count($users); $j++) {
            if($users[$j]["id"] == $user_id) {
                $users[$j]["duration_shows"] = intval($users[$j]["duration_shows"]) + intval($duration);
                $users[$j]["duration"] = intval($users[$j]["duration"]) + intval($duration);
                $users[$j]["plays"] = intval($users[$j]["plays"]) + 1;
                $user_found = True;
                break;
            }
        }

        if(!$user_found) {
            array_push($users, array("user" => $user, "id" => $user_id, "duration" => $duration, "duration_movies" => 0, "duration_shows" => $duration, "plays" => 1));
        }

        for ($j = 0; $j < count($shows); $j++) {
            if($shows[$j]["title"] == $title) {
                $shows[$j]["duration"] = intval($shows[$j]["duration"]) + intval($duration);
                $shows[$j]["plays"] = intval($shows[$j]["plays"]) + 1;
                $show_found = True;
                break;
            }
        }

        if(!$show_found) {
            array_push($shows, array("title" => $title, "duration" => $duration, "plays" => 1));
        }
    }

    // Sort movies by duration
    $duration = array_column($movies, 'duration');
    array_multisort($duration, SORT_DESC, $movies);

    // Sort movies by duration
    $duration = array_column($shows, 'duration');
    array_multisort($duration, SORT_DESC, $shows);

    // Sort users by combined duration
    $duration = array_column($users, 'duration');
    array_multisort($duration, SORT_DESC, $users);

    return array("top_movies" => $movies, "users" => $users, "top_shows" => $shows);
}
?>