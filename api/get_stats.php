<?php
$data = json_decode(file_get_contents("php://input"));

$path = "../config/config.json";
if(!file_exists($path)) {
	fopen($path, "w");
}	
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
$library_id_music = $config->library_id_music;

// Set time-zone
date_default_timezone_set($config->timezone);

//Base-URL for connections
$connection = create_url();

//Declare given email
if(!empty($data)){
	$p_identity = htmlspecialchars(trim($data->p_identity));
} else if(isset($_GET["p_identity"])) {
	$p_identity = htmlspecialchars(trim($_GET["p_identity"]));
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

// Log API request if enabled
if($config->use_logs) {
	if(!log_activity($id, "")) {
		echo json_encode(array("message" => "Failed to log event.", "error" => true));
		exit(0);
	}
}

// Get user name
$name = tautulli_get_name($id);
if(!$name) {
    echo json_encode(array("message" => "Could not find username.", "error" => true));
    exit(0);
}

// GET WRAPPED DATES CACHE
if($config->use_cache) {
    if($cache = check_cache()) {
        $tautulli_data = $cache;
    } else {
        $tautulli_data = array();
    }
}

// UPDATE THE CACHE
$tautulli_data = tautulli_get_wrapped_dates($id, $tautulli_data);

// SAVE WRAPPED DATES CACHE
if($config->use_cache) {
    update_cache($tautulli_data);
}

// NEW LOOP USER-STATS
if($config->get_user_movie_stats || $config->get_user_show_stats || $config->get_user_music_stats) {
    $user_stats = data_get_user_stats_loop($id, $tautulli_data);

    if($config->get_user_movie_stats) {
        $user_movies = array("data" => $user_stats["movies"], "message" => "Success. User movie-stats are loaded.", "error" => False);
    } else {
        $user_movies = array("error" => True, "message" => "Disabled in config.");
    }

    if($config->get_user_show_stats) {
        $user_shows = array("data" => $user_stats["shows"], "message" => "Success. User show-stats are loaded.", "error" => False);
    } else {
        $user_shows = array("error" => True, "message" => "Disabled in config.");
    }

    if($config->get_user_show_stats) {
        $user_music = array("data" => $user_stats["music"], "message" => "Success. User music-stats are loaded.", "error" => False);
    } else {
        $user_music = array("error" => True, "message" => "Disabled in config.");
    }
} else {
    $user_movies = array("error" => True, "message" => "Disabled in config.");
    $user_shows = array("error" => True, "message" => "Disabled in config.");
    $user_music = array("error" => True, "message" => "Disabled in config.");
}

$user_shows["data"] = $user_shows["data"] + array("show_buddy" => array("message" => "Disabled in config.", "error" => True));
/*
if($config->get_year_stats_movies || $config->get_year_stats_shows || $config->get_year_stats_music) {
    if($config->use_cache) {
        $year_stats = array("data" => tautulli_get_year_stats_cache($id), "error" => False, "message" => "Year stats are loaded.");
    } else {
        $year_stats = array("data" => tautulli_get_year_stats($id), "error" => False, "message" => "Year stats are loaded.");
    }
} else {
    $year_stats = array("data" => array(), "message" => "Disabled in config.", "error" => True);
}
*/
$year_stats = array("data" => array(), "message" => "Disabled in config.", "error" => True);

$now = new DateTime('NOW');

// Print results
$result = json_encode(array("error" => False,
                            "date" => $now->format('Y-m-d'),
                            "message" => "Data processed.",
                            "user" => array("name" => $name,
                                            "id" => $id,
                                            "user_movies" => $user_movies,
                                            "user_shows" => $user_shows,
											"user_music" => $user_music
                                            ),
                            "year_stats" => $year_stats,
                            ));


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
        if (strtolower($response->response->data[$i]->email) == strtolower($input) || strtolower($response->response->data[$i]->username) == strtolower($input)) {
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
	
	$path = "../config/cache.json";
	if(!file_exists($path)) {
		fopen($path, "w");
	}	
    $cache = json_decode(file_get_contents($path));

    if(!empty($cache)) {
        return $cache;
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

function log_activity($id, $message) {
	$date = date('Y-m-d H:i:s');
	
	$path = "../config/wrapped.log";
	if(!file_exists($path)) {
		$temp = fopen($path, "w");
		fwrite($temp, 'Plex Wrapped');
		fclose($temp);
	}	
	
	$log_file = fopen($path, 'a');
	fwrite($log_file, PHP_EOL . $date . ' - get_stats.php - ID: ' . $id . ' - ' . $message);
	
	if(fclose($log_file)) {
		return True;
	}
	
	return False;
}

function tautulli_get_wrapped_dates($id, $array) {
    global $connection;
    global $config;
    global $arrContextOptions;

    $loop_time = $config->wrapped_start;
    $end_loop_date = $config->wrapped_end;

    for ($i = 0; $loop_time <= $end_loop_date; $i++) {

        $current_loop_date = date('Y-m-d', $loop_time);

        for($j = 0; $j < count($array); $j++) {
            if($array[$j]["date"] == $current_loop_date) {
                continue;
            }
        }

        $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&order_column=date&order_dir=desc&include_activity=0&length=" . $config->tautulli_length . "&start_date=" . $current_loop_date;

        if($config->ssl) {
            $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
        } else {
            $response = json_decode(file_get_contents($url));
        }

        $temp = $response->response->data->data;
        if(!empty($temp)) {
            for($j = 0; $j < count($temp); $j++) {
                if($temp[$j]->media_type == "movie" || $temp[$j]->media_type == "episode" || $temp[$j]->media_type == "track") {
                    array_push($array, array("date" => $current_loop_date, "data" => $temp[$j]));
                }
            }
        }

        $loop_time += 86400;
    }

    // Sort data by date
    $date = array_column($array, 'date');
    array_multisort($date, SORT_DESC, $array);

    return $array;
}

function data_get_user_stats_loop($id, $array_data) {

    $movies = array();
    $movies_percent_complete = array();
    $shows = array();
    $tracks = array();

    for ($i = 0; $i < count($array); $i++) {

        for($d = 0; $d < count($array->data); $d++) {

            if($config->get_user_movie_stats && $array[$i]->data[$d]->media_type == "movie" && $array[$i]->data[$d]->user_id == $id) {

                if($array[$i]->data[$d]->date > $config->wrapped_end) {
                    continue;
                } else if ($array[$i]->data[$d]->date < $config->wrapped_start) {
                    break;
                }

                $duration = $array[$i]->data[$d]->duration;

                if($duration > 300) {
                    array_push($movies_percent_complete, $array[$i]->data[$d]->percent_complete);
                }

                $title = $array[$i]->data[$d]->full_title;
                $year = $array[$i]->data[$d]->year;
                $percent_complete = $array[$i]->data[$d]->percent_complete;
                $paused_counter = $array[$i]->data[$d]->paused_counter;

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

            if($config->get_user_show_stats && $array[$i]->data[$d]->media_type == "episode" && $array[$i]->data[$d]->user_id == $id) {
                if($array[$i]->data[$d]->date > $config->wrapped_end) {
                    continue;
                } else if ($array[$i]->data[$d]->date < $config->wrapped_start) {
                    break;
                }

                $title = $array[$i]->data[$d]->grandparent_title;
                $duration = $array[$i]->data[$d]->duration;
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

            if($config->get_user_music_stats && $array[$i]->data[$d]->media_type == "track" && $array[$i]->data[$d]->user_id == $id) {
                if($array[$i]->data[$d]->date > $config->wrapped_end) {
                    continue;
                } else if ($array[$i]->data[$d]->date < $config->wrapped_start) {
                    break;
                }

                if($array[$i]->data[$d]->title == "" || $array[$i]->data[$d]->grandparent_title == "" || $array[$i]->data[$d]->parent_title == "") {
                    continue;
                }

                $found = False;

                for ($j = 0; $j < count($tracks); $j++) {
                    if($array[$i]->data[$d]->title == $tracks[$j]["title"] && $array[$i]->data[$d]->parent_title == $tracks[$j]["parent_title"] && $array[$i]->data[$d]->grandparent_title == $tracks[$j]["grandparent_title"]) {
                        $tracks[$j]["plays"] = intval($tracks[$j]["plays"]) + 1;
                        $tracks[$j]["duration"] = intval($tracks[$j]["duration"]) + $array[$i]->data[$d]->duration;
                        break;
                    }
                }

                if(!$found) {
                    array_push($tracks, array("title" => $array[$i]->data[$d]->title, "parent_title" => $array[$i]->data[$d]->parent_title, "grandparent_title" => $array[$i]->data[$d]->grandparent_title, "plays" => 1, "duration" => $array[$i]->data[$d]->duration, "year" => $array[$i]->data[$d]->year, "rating_key" => $array[$i]->data[$d]->rating_key, "parent_rating_key" => $array[$i]->data[$d]->parent_rating_key, "grandparent_rating_key" => $array[$i]->data[$d]->grandparent_rating_key));
                }
            }
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

    //Sort shows by duration
    $duration = array_column($shows, 'duration');
    array_multisort($duration, SORT_DESC, $shows);

    // Sort $tracks for longest pause
    $duration = array_column($tracks, 'duration');
    array_multisort($duration, SORT_DESC, $tracks);

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


    if($config->get_user_movie_stats) {
        $return_movies = array("movies" => $movies, "user_movie_most_paused" => $movie_most_paused, "user_movie_finishing_percent" => $movie_percent_average, "user_movie_oldest" => $movie_oldest);
    } else {
        $return_movies = array();
    }

    if($config->get_user_show_stats) {
        $return_shows = array("shows" => $shows);
    } else {
        $return_shows = array();
    }

    if($config->get_user_music_stats) {
        $return_music = array("music" => $tracks);
    }else {
        $return_music = array();
    }

    return array("movies" => $return_movies, "shows" => $return_shows, "music" => $return_music);
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
            $then = new DateTime($cache[$i]->year_stats->data->origin_date);
            $diff = $then->diff($now);

            if(($diff->format('%a') < $config->cache_age_limit || $config->cache_age_limit == "" || $config->cache_age_limit == 0) && !$cache[$i]->year_stats->error) {
                return $cache[$i]->year_stats->data;
            }
        }
    }

    return tautulli_get_year_stats($id);
}

function tautulli_get_year_stats($id) {
    global $connection;
    global $config;
    global $library_id_movies;
	global $library_id_shows;
	global $library_id_music;
    global $name;
    global $arrContextOptions;
	
	$users = array();
    $movies = array();
    $shows = array();
	$tracks = array();

    $earliest_date_movies = 999999999999;
    $earliest_date_shows = 999999999999;
    $earliest_date_tracks = 999999999999;

	if($config->get_year_stats_movies) {
        //GET MOVIES
        $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&section_id=" . $library_id_movies . "&media_type=movie&include_activity=0&order_column=date&order_dir=desc&length=" . $config->tautulli_length;

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

            $title = $array[$i]->full_title;
            $duration = $array[$i]->duration;
            $user = $array[$i]->friendly_name;
            $user_id = $array[$i]->user_id;
            $year = $array[$i]->year;

            $user_found = False;
            $movie_found = False;

            if($array[$i]->date < $earliest_date_movies) {
                $earliest_date_movies = $array[$i]->date;
            }

            for ($j = 0; $j < count($users); $j++) {
                if($users[$j]["id"] == $user_id) {
                    $users[$j]["duration"] = intval($users[$j]["duration"]) + intval($duration);
                    $users[$j]["duration_movies"] = intval($users[$j]["duration_movies"]) + intval($duration);
                    $users[$j]["plays"] = intval($users[$j]["plays"]) + 1;
                    $user_found = True;
                    break;
                }
            }

            if(!$user_found) {
                array_push($users, array("user" => $user, "id" => $user_id, "duration" => $duration, "duration_movies" => $duration, "duration_shows" => 0, "duration_artists" => 0, "plays" => 1));
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

        // Sort movies by duration
        $duration = array_column($movies, 'duration');
        array_multisort($duration, SORT_DESC, $movies);

    } else {
        $movies = array("message" => "Disabled in config.", "error" => True);
    }

	if($config->get_year_stats_shows) {
        //GET EPISODES
        $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&section_id=" . $library_id_shows . "&media_type=episode&include_activity=0&order_column=date&order_dir=desc&length=" . $config->tautulli_length;

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

            if($array[$i]->date < $earliest_date_shows) {
                $earliest_date_shows = $array[$i]->date;
            }

            for ($j = 0; $j < count($users); $j++) {
                if($users[$j]["id"] == $user_id) {
                    $users[$j]["duration"] = intval($users[$j]["duration"]) + intval($duration);
                    $users[$j]["duration_shows"] = intval($users[$j]["duration_shows"]) + intval($duration);
                    $users[$j]["plays"] = intval($users[$j]["plays"]) + 1;
                    $user_found = True;
                    break;
                }
            }

            if(!$user_found) {
                array_push($users, array("user" => $user, "id" => $user_id, "duration" => $duration, "duration_movies" => 0, "duration_shows" => $duration, "duration_artists" => 0, "plays" => 1));
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
                array_push($shows, array("title" => $title, "year" => $year, "duration" => $duration, "plays" => 1));
            }
        }

        // Sort shows by duration
        $duration = array_column($shows, 'duration');
        array_multisort($duration, SORT_DESC, $shows);

    } else {
        $shows = array("message" => "Disabled in config.", "error" => True);
    }

	if($config->get_year_stats_shows) {
        //GET TRACKS
        $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history&section_id=" . $library_id_music . "&media_type=track&include_activity=0&order_column=date&order_dir=desc&length=" . $config->tautulli_length;

        if($config->ssl) {
            $response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
        } else {
            $response = json_decode(file_get_contents($url));
        }

        $array = $response->response->data->data;

        for ($i = 0; $i < count($array); $i++) {
            if($array[$i]->date > $config->wrapped_end) {
                continue;
            } else if ($array[$i]->date < $config->wrapped_start) {
                break;
            }

            if($array[$i]->title == "" || $array[$i]->grandparent_title == "" || $array[$i]->parent_title == "") {
                continue;
            }

            $user_found = False;
            $artist_found = False;


            if($array[$i]->date < $earliest_date_tracks) {
                $earliest_date_tracks = $array[$i]->date;
            }

            for ($j = 0; $j < count($users); $j++) {
                if($users[$j]["id"] == $array[$i]->user_id) {
                    $users[$j]["duration"] = intval($users[$j]["duration"]) + $array[$i]->duration;
                    $users[$j]["duration_artists"] = intval($users[$j]["duration_artists"]) + $array[$i]->duration;
                    $users[$j]["plays"] = intval($users[$j]["plays"]) + 1;
                    $user_found = True;
                    break;
                }
            }

            if(!$user_found) {
                array_push($users, array("user" => $$array[$i]->friendly_name, "id" => $array[$i]->user_id, "duration" => $array[$i]->duration, "duration_movies" => 0, "duration_shows" => 0, "duration_artists" => $array[$i]->duration, "plays" => 1));
            }

            for ($j = 0; $j < count($tracks); $j++) {
                if($array[$i]->title == $tracks[$j]["title"] && $array[$i]->parent_title == $tracks[$j]["parent_title"] && $array[$i]->grandparent_title == $tracks[$j]["grandparent_title"]) {
                    $tracks[$j]["plays"] = intval($tracks[$j]["plays"]) + 1;
                    $tracks[$j]["duration"] = intval($tracks[$j]["duration"]) + $array[$i]->duration;
                    break;
                }
            }

            if(!$artist_found) {
                array_push($tracks, array("title" => $array[$i]->title, "parent_title" => $array[$i]->parent_title, "grandparent_title" => $array[$i]->grandparent_title, "plays" => 1, "duration" => $array[$i]->duration, "year" => $array[$i]->year, "rating_key" => $array[$i]->rating_key, "parent_rating_key" => $array[$i]->parent_rating_key, "grandparent_rating_key" => $array[$i]->grandparent_rating_key));
            }

        }

        // Sort tracks by duration
        $duration = array_column($tracks, 'duration');
        array_multisort($duration, SORT_DESC, $tracks);

    } else {
        $tracks = array("message" => "Disabled in config.", "error" => True);
    }

    // Sort users by combined duration
    $duration = array_column($users, 'duration');
    array_multisort($duration, SORT_DESC, $users);

    $now = new DateTime('NOW');

    return array("origin_date" => $now->format('Y-m-d'), "top_movies" => $movies, "top_movies_earliest" => $earliest_date_movies, "users" => $users, "top_shows" => $shows, "top_show_earliest" => $earliest_date_shows, "top_artists" => $tracks, "top_artists_earliest" => $earliest_date_tracks);
}
?>