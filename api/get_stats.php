<?php
$data = json_decode(file_get_contents("php://input"));
$config = json_decode(file_get_contents("../config/config.json"));

$arrContextOptions= [
    'ssl' => [
        'verify_peer'=> false,
        'verify_peer_name'=> false,
    ],
];

if (empty($config)) {
    echo json_encode(array("message" => "Plex Wrapped is not configured.", "error" => true));
    exit(0);
}

// Libraries for movies and shows
$library_id_movies = $config->library_id_movies;
$library_id_shows = $config->library_id_shows;

//Base-URL for connections
$connection = create_url();

//Declare given email
if(!empty($data)){
	$p_identity = htmlspecialchars($data->p_identity);
} else if(isset($_GET["p_identity"])) {
	$p_identity = htmlspecialchars($_GET["p_identity"]);
} else {
    echo json_encode(array("message" => "No input provided.", "error" => true));
    exit(0);
}

// Get user ID
$id = tautulli_get_user($p_identity);
if (!$id) {
    echo json_encode(array("message" => "No user found.", "error" => true));
    exit(0);
}

// Use cache
if($config->use_cache) {
    if($cache = check_cache()) {
        $now = new DateTime('NOW');
        $then = new DateTime($cache->date);
        $diff = $now->diff($then);

        if($diff->format('%D') < $config->cache_age_limit) {
            echo json_encode($cache);
            exit(0);
        }
    }
}

// Get user name
$name = tautulli_get_name($id);
if(!$name) {
    echo json_encode(array("message" => "Could not find username.", "error" => true));
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

if($config->get_user_show_buddy && $config->get_user_show_stats && !empty($user_shows["data"]["shows"])) {
    $user_shows["data"] = $user_shows["data"] + array("show_buddy" => array("user" => tautulli_get_user_show_buddy($id, $user_shows["data"]["shows"]), "error" => False, "Message" => "Buddy is loaded."));
} else {
    $user_shows["data"] = $user_shows["data"] + array("show_buddy" => array("message" => "Disabled in config.", "error" => True));
}

if($config->get_year_stats) {
    if($config->use_cache) {
        $year_stats = array("data" => tautulli_get_year_stats_cache($id), "error" => False, "Message" => "Year stats are loaded.");
    } else {
        $year_stats = array("data" => tautulli_get_year_stats($id), "error" => False, "Message" => "Year stats are loaded.");
    }
} else {
    $year_stats = array("data" => array(), "message" => "Disabled in config.", "error" => True);
}

$now = new DateTime('NOW');

// Print results
$result = json_encode(array("error" => False,
                            "date" => $now->format('Y-m-d'),
                            "message" => "Data processed.",
                            "user" => array("name" => $name,
                                            "id" => $id,
                                            "user_movies" => $user_movies,
                                            "user_shows" => $user_shows
                                            ),
                            "year_stats" => $year_stats,
                            ));

if($config->use_cache) {
    update_cache($result);
}

echo $result;
exit(0);

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

function tautulli_get_user($input) {
    global $connection;
    global $config;
    global $arrContextOptions;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_users";

    try {
        if($config->ssl) {
            @$response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
        } else {
            @$response = json_decode(file_get_contents($url));
        }

        if(!isset($response)) {
            throw new Exception('Could not reach Tautulli.');
        }
    } catch (Exception $e) {
        echo json_encode(array("message" => $e->getMessage(), "error" => true));
        exit(0);
    }

    for ($i = 0; $i < count($response->response->data); $i++) {
        if ($response->response->data[$i]->email == $input || $response->response->data[$i]->username == $input) {
            return $response->response->data[$i]->user_id;
        }
    }

    return false;
}

function tautulli_get_name($id) {
    global $connection;
    global $config;
    global $arrContextOptions;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_user_ips&user_id=" . $id;

    if($config->ssl) {
        $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } else {
        $response = json_decode(file_get_contents($url));
    }

    if(!empty($response->response->data->data[0]->friendly_name)) {
        return $response->response->data->data[0]->friendly_name;
    } else if(!empty($response->response->data->data[0]->username)) {
        return $response->response->data->data[0]->username;
    } else if(!empty($response->response->data->data[0]->email)) {
        return $response->response->data->data[0]->email;
    } else {
        return false;
    }
}

function check_cache() {
    global $config;
    global $id;
    $cache = json_decode(file_get_contents("../config/cache.json"));

    if(!empty($cache)) {
        for($i = 0; $i < count($cache); $i++) {
            if($cache[$i]->user->id == $id) {
                return $cache[$i];
            }
        }
    }

    return False;
}

function update_cache($result) {
    global $config;
    $cache = json_decode(file_get_contents("../config/cache.json"));
    $decode_result = json_decode($result);
    $found = False;

    if(!empty($cache)) {
        for($i = 0; $i < count($cache); $i++) {
            if($cache[$i]->user->id == $decode_result->user->id && !$found) {
                $cache[$i] = $decode_result;
                $found = True;
                break;
            }
        }
    } else {
        $cache = array();
    }

    if(!$found) {
        array_push($cache, $decode_result);
    }

    $save = json_encode($cache);
    file_put_contents("../config/cache.json", $save);
    return True;
}

function tautulli_get_user_movies($id) {
    global $connection;
    global $config;
    global $library_id_movies;
    global $arrContextOptions;

    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&user_id=" . $id . "&section_id=" . $library_id_movies . "&order_column=date&order_dir=desc&include_activity=0&length=" . $config->tautulli_length . "";

    if($config->ssl) {
        $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } else {
        $response = json_decode(file_get_contents($url));
    }

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
    global $arrContextOptions;

    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&user_id=" . $id . "&section_id=" . $library_id_shows . "&order_column=date&order_dir=desc&include_activity=0&length=" . $config->tautulli_length . "";

    if($config->ssl) {
        $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } else {
        $response = json_decode(file_get_contents($url));
    }

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
    global $arrContextOptions;

    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&section_id=" . $library_id_shows . "&order_column=date&include_activity=0&media_type=episode&order_dir=desc&length=" . $config->tautulli_length . "&search=" . urlencode($shows[0]["title"]);

    if($config->ssl) {
        $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } else {
        $response = json_decode(file_get_contents($url));
    }

    $array = $response->response->data->data;
    if(empty($array)) {
        $array = array();
    }
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
        $buddy = array("user" => False, "duration" => 0, "found" => False, "watched_relative_to_you" => False);
    }

    return $buddy;
}

function tautulli_get_year_stats_cache($id) {
    $cache = json_decode(file_get_contents("../config/cache.json"));
    global $config;

    if(!empty($cache)) {
        for($i = 0; $i < count($cache); $i++) {
            $now = new DateTime('NOW');
            $then = new DateTime($cache[$i]->date);
            $diff = $now->diff($then);

            if($diff->format('%D') < $config->cache_age_limit) {
                return $cache[$i]->year_stats->data;
            }
        }
    }

    return tautulli_get_year_stats($id);
}

function tautulli_get_year_stats($id) {
    global $connection;
    global $config;
    global $library_id_shows;
    global $name;
    global $arrContextOptions;

    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&media_type=movie&include_activity=0&order_column=date&order_dir=desc&length=" . $config->tautulli_length;

    if($config->ssl) {
        $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } else {
        $response = json_decode(file_get_contents($url));
    }

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

    if($config->ssl) {
        $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } else {
        $response = json_decode(file_get_contents($url));
    }

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