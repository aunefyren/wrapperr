<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/auth.php');
require(dirname(__FILE__) . '/objects/config.php');
require(dirname(__FILE__) . '/objects/log.php');
require(dirname(__FILE__) . '/objects/cache.php');

// Create variables
$config = new Config();
$auth = new Auth();
$log = new Log();
$cache = new Cache();
$data = json_decode(file_get_contents("php://input"));

// Check if configured
if(!$config->is_configured()) {

    // Log activity
    $log->log_activity('get_stats.php', 'unknown', 'Plex-Wrapped is not confgured..');

    echo json_encode(array("message" => "Plex-Wrapped is not confgured.", "error" => true));
    exit(0);
}

// Set time-zone to the one configured
date_default_timezone_set($config->timezone);

// Set maximum run-time
set_time_limit(300);

// Base-URL for connections to Tautulli API.
$connection = create_url();

// Declare given inputs. GET and POST.
if(!empty($data) && isset($data->cookie)){
	$cookie = htmlspecialchars(trim($data->cookie));
} else if(isset($_GET["cookie"])) {
	$cookie = htmlspecialchars(trim($_GET["cookie"]));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Input error.", "error" => true));
    exit(0);
}

//Check if Caching parameter was supplied through GET or POST
if(!empty($data) && isset($data->caching)) {
    $caching = filter_var(htmlspecialchars(trim($data->caching)), FILTER_VALIDATE_BOOLEAN);
} else if(isset($_GET["caching"])) {
    $caching = filter_var(htmlspecialchars(trim($_GET["caching"])), FILTER_VALIDATE_BOOLEAN);
} else {
    $caching = False;
}

// Confirm input variables
if($caching) {
	if(!empty($data) && isset($data->cache_limit)) {
		$cache_limit = htmlspecialchars(trim($data->cache_limit));
	} else if(isset($_GET["cache_limit"])) {
		$cache_limit = htmlspecialchars(trim($_GET["cache_limit"]));
	} else {
        http_response_code(400);
		echo json_encode(array("message" => "Caching enabled, but no 'cache_limit' input retrieved.", "error" => true));
		exit(0);
	}
}

// Check caching mode
if($caching) {
    
    // Log activity
    $log->log_activity('get_stats.php', 'unknown', 'Starting caching mode.');

    caching_mode($cache_limit);

}

// Test Tautulli connection
if(!tautulli_test_connection()) {

    // Log activity
    $log->log_activity('get_stats.php', 'unknown', 'Tautulli connection test was not successful.');

    echo json_encode(array("message" => "Tautulli connection test was not successful.", "error" => true));
    exit(0);

} else {

    // Log activity
    $log->log_activity('get_stats.php', 'unknown', 'Tautulli connection test was successful.');

}

// Get Plex Token
$token_object = json_decode($auth->validate_token($cookie));

// Validate Plex ID
if(empty($token_object) || !isset($token_object->data->id)) {
    
	// Log use
	$log->log_activity('get_stats.php', 'unknown', 'Plex Token from cookie not valid.');

    echo json_encode(array("error" => true, "message" => "Login not accepted. Log in again."));
    exit(0);
	
}

// Assign values from Plex Token
$id = $token_object->data->id;
if(isset($token_object->data->friendlyName)) {
    $name = $token_object->data->friendlyName;
} else if(isset($token_object->data->title)) {
    $name = $token_object->data->title;
} else if(isset($token_object->data->username)) {
    $name = $token_object->data->username;
} else if(isset($token_object->data->email)) {
    $name = $token_object->data->email;
}

// Log use
$log->log_activity('get_stats.php', $token_object->data->id, 'Plex-Wrapped login cookie accepted.');

// Get user name
$name = tautulli_get_name($id);
if(!$name) {
    http_response_code(400);
    echo json_encode(array("message" => "Could not find username.", "error" => true));
    exit(0);
}

// Log checking cache
$log->log_activity('get_stats.php', $id, 'Checking data-cache.');

// GET WRAPPED DATES CACHE
if($config->use_cache) {
    if($cache_data = $cache->check_cache()) {
        $tautulli_data = $cache_data;
    } else {
        $tautulli_data = array();
    }
} else {
    $tautulli_data = array();
}

// Log refresh cache
$log->log_activity('get_stats.php', $id, 'Refreshing data-cache of missing/incomplete days');

// Refresh the cache
$tautulli_data = tautulli_get_wrapped_dates($id, $tautulli_data, False);
$tautulli_data = $tautulli_data["data"];

// Log updating cache
$log->log_activity('get_stats.php', $id, 'Saving data-cache');

// Save the wrapped cache date
if($config->use_cache) {
    $cache->update_cache($tautulli_data);
}

// Log wrapped create
$log->log_activity('get_stats.php', $id, 'Creating wrapped data');

// Get stats based on configured options.
if($config->get_user_movie_stats || $config->get_user_show_stats || $config->get_user_music_stats || $config->get_year_stats_movies || $config->get_year_stats_shows || $config->get_year_stats_music) {
    
    // Create the dataset
    $user_stats = data_get_user_stats_loop($id, $tautulli_data);

    // Select the retrieved dataset if movies are configured for users.
    if($config->get_user_movie_stats) {
        $user_movies = array("data" => $user_stats["movies"], "message" => "Success. User movie-stats are loaded.", "error" => False);
    } else {
        $user_movies = array("error" => True, "message" => "Disabled in config.", "data" => array());
    }

    // Select the retrieved dataset if shows are configured for users.
    if($config->get_user_show_stats) {
        $user_shows = array("data" => $user_stats["shows"], "message" => "Success. User show-stats are loaded.", "error" => False);
    } else {
        $user_shows = array("error" => True, "message" => "Disabled in config.", "data" => array());
    }

    // Select the retrieved dataset if music are configured for users.
    if($config->get_user_music_stats) {
        $user_music = array("data" => $user_stats["music"], "message" => "Success. User music-stats are loaded.", "error" => False);
    } else {
        $user_music = array("error" => True, "message" => "Disabled in config.", "data" => array());
    }

    // Select the retrieved dataset if movies are configured for the server.
    if($config->get_year_stats_movies) {
        $year_movies = array("data" => $user_stats["year_movies"], "message" => "Success. User movie-year-stats are loaded.", "error" => False);
    } else {
        $year_movies = array("error" => True, "message" => "Disabled in config.", "data" => array());
    }

    // Select the retrieved dataset if movies are configured for the server.
    if($config->get_year_stats_shows) {
        $year_shows = array("data" => $user_stats["year_shows"], "message" => "Success. User show-year-stats are loaded.", "error" => False);
    } else {
        $year_shows = array("error" => True, "message" => "Disabled in config.", "data" => array());
    }

    // Select the retrieved dataset if shows are configured for the server.
    if($config->get_year_stats_music) {
        $year_music = array("data" => $user_stats["year_music"], "message" => "Success. User music-year-stats are loaded.", "error" => False);
    } else {
        $year_music = array("error" => True, "message" => "Disabled in config.", "data" => array());
    }

    // Select the retrieved dataset if music are configured for the server.
    if(($config->get_year_stats_movies || $config->get_year_stats_shows || $config->get_year_stats_music) && $config->get_year_stats_leaderboard ) {
        $year_users = array("data" => $user_stats["year_users"], "message" => "Success. User year-stats are loaded.", "error" => False);
    } else {
        $year_users = array("error" => True, "message" => "Disabled in config.", "data" => array());
    }

} else {
    // Log creating empty datasets
    $log->log_activity('get_stats.php', $id, 'No options, creating empty dataset.');

    // No options selected, empty datasets being configured
    $user_movies = array("error" => True, "message" => "Disabled in config.", "data" => array());
    $user_shows = array("error" => True, "message" => "Disabled in config.", "data" => array());
    $user_music = array("error" => True, "message" => "Disabled in config.", "data" => array());
    $year_movies = array("error" => True, "message" => "Disabled in config.", "data" => array());
    $year_shows = array("error" => True, "message" => "Disabled in config.", "data" => array());
    $year_music = array("error" => True, "message" => "Disabled in config.", "data" => array());
    $year_users = array("error" => True, "message" => "Disabled in config.", "data" => array());
}

// Get show buddy if enabled, shows are not empty, and shows is enabled.
if($config->get_year_stats_shows && $config->get_user_show_buddy && count($user_shows["data"]["shows"]) > 0) {
    // Log show-buddy action
    $log->log_activity('get_stats.php', $id, 'Getting show-buddy.');
    
	$user_shows["data"] = $user_shows["data"] + array("show_buddy" => data_get_user_show_buddy($id, $user_shows["data"]["shows"][0]["title"], $tautulli_data));
} else {
    // Log show-buddy action
    $log->log_activity('get_stats.php', $id, 'Show-buddy disabled.');

	$user_shows["data"] = $user_shows["data"] + array("show_buddy" => array("message" => "Disabled in config.", "error" => True));
}

// Get the current date
$now = new DateTime('NOW');

// Log wrapped create
$log->log_activity('get_stats.php', $id, 'Printing wrapped data');

// Print results on page
$result = json_encode(array("error" => False,
                            "date" => $now->format('Y-m-d'),
                            "message" => "Data processed.",
                            "user" => array("name" => $name,
                                            "id" => $id,
                                            "user_movies" => $user_movies,
                                            "user_shows" => $user_shows,
											"user_music" => $user_music
                                            ),
                            "year_stats" => array(
                                            "year_movies" => $year_movies,
                                            "year_shows" => $year_shows,
                                            "year_music" => $year_music,
                                            "year_users" => $year_users,
                                            ),
                            ));


http_response_code(200);
echo $result;
exit(0);

function create_url() {
    global $config;
    // Creating URL for API calls to Tautulli

    // If root string is not empty, add it with a '/'
    if($config->tautulli_root != "") {
        $root = "/" . $config->tautulli_root;
    } else {
        $root = $config->tautulli_root;
    }

    // If port string is not empty, add it with a ':'
    if($config->tautulli_port != "") {
        $port = ":" . $config->tautulli_port;
    } else {
        $port = "";
    }

    // IP or domain added
    $ip = $config->tautulli_ip;

    // SSL means 'https', not means 'http'
    if($config->ssl) {
        $base = "https://";
    } else {
        $base = "http://";
    }

    // Return the URL
    return $base . $ip . $port . $root;
}

function tautulli_test_connection() {
    global $connection;
    global $config;
    $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=status";

    try {

        // Call Tautulli status API
        //  Initiate curl
        $ch = curl_init();
    
        // Set the options for curl
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
        // Execute curl
        $result = curl_exec($ch);
    
        // Check if an error occurred
        if(curl_errno($ch)) {
            return false;
        }
    
        // Closing curl
        curl_close($ch);
    
        // Decode the JSON response
        $decoded = json_decode($result, true);
    
        // Check reponse for success
        if($decoded["response"]["result"] == "success") {
            return true;
        }
        
        return false;
    
    // Catch errors
    } catch (Exception $e) {
        return false;
    }
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
    } catch (Error $e) {
        http_response_code(500);
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

function caching_mode($cache_limit) {
    global $config;
    global $cache;
    global $log;
    global $cache_data;
    $id = "Caching mode";

    // Log caching mode
	$log->log_activity('get_stats.php', $id, 'Tautulli connection test was successful.');
	
	if(!$config->use_cache) {
        http_response_code(400);
		echo json_encode(array("message" => "Caching is disabled.", "error" => true));
		exit(0);
	}
	
	// Log checking cache
	$log->log_activity('get_stats.php', $id, 'Starting cache loop.');
	

	// Log checking cache
	$log->log_activity('get_stats.php', $id, 'Checking data-cache.');

	// GET WRAPPED DATES CACHE
	if($config->use_cache) {
		if($cache_data = $cache->check_cache()) {
			$tautulli_data = $cache_data;
		} else {
			$tautulli_data = array();
		}
	} else {
		$tautulli_data = array();
	}

	// Log refresh cache
	$log->log_activity('get_stats.php', $id, 'Refreshing data-cache of missing/incomplete days, maximum ' . $cache_limit . ' days');

	// Refresh the cache
	$tautulli_data = tautulli_get_wrapped_dates($id, $tautulli_data, $cache_limit);
	$complete_date_loop = $tautulli_data["complete"];
	$tautulli_data = $tautulli_data["data"];
	
	// Log saving cache
	$log->log_activity('get_stats.php', $id, 'Saving data-cache.');

	// Save the wrapped cache
	if($config->use_cache) {
        $cache->update_cache($tautulli_data);
	}

    http_response_code(200);
	echo json_encode(array("message" => "Caching complete.", "caching_complete" => $complete_date_loop, "error" => False));
	exit(0);

}

function call_tautulli_url($url) {
    global $connection;
    global $config;
    global $id;
    global $log;

    try {

        //  Initiate curl
        $ch = curl_init();
    
        // Set the options for curl
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
        // Execute curl
        $result = curl_exec($ch);
    
        // Check if an error occurred
        if(curl_errno($ch)) {
            throw new Exception('Tautulli API call was not successful.');
        }
    
        // Closing curl
        curl_close($ch);
    
        // Decode the JSON response
        $result = json_decode($result, true);

        if($result) {
            return $result;
        } else {
            throw new Exception('Tautulli API call was not successful.');
        }

    // Catch errors
    } catch (Exception $e) {
        // Log activity
        $log->log_activity('get_stats.php', $id, $e->getMessage());

        echo json_encode(array("message" => $e->getMessage(), "error" => true));
        exit(0);
    }
}

function tautulli_get_wrapped_dates($id, $array, $loop_interval) {

    $time_start = microtime(true);

    global $connection;
    global $config;
    global $log;
    global $arrContextOptions;

    $end_loop_date = $config->wrapped_end;
	
	if($loop_interval == 0) {
		$loop_interval = False;
	}
	
	$complete_date_loop = True;

    $libraries = explode(',',$config->tautulli_libraries);
    
    if($libraries < 1) {
        $libraries[0] = null;
    }

    
    for ($loop_time = $config->wrapped_start; $loop_time <= $end_loop_date; $loop_time += 86400) {

        $current_loop_date = date('Y-m-d', $loop_time);
        $now = new DateTime('NOW');
        $then = new DateTime($current_loop_date);

        // Stop
        if($then > $now) {
            break;
        }

        $found_date = False;
        for($j = 0; $j < count($array); $j++) {
            if($array[$j]["date"] == $current_loop_date) {
                $found_date_index = $j;
                $found_date = True;
                break;
            }
        }
        if($found_date && $array[$j]["complete"]) {
            continue;
        }

        // Log that we are downoading a new day
        $log->log_activity('get_stats.php', $id, 'Downloading day: ' . $current_loop_date);

        // Clean array to populate with results
        $temp_clean = array();

        // Loop through selected libraries
        for ($library_loop = 0; $library_loop < count($libraries); $library_loop++) {
            
            // If no libraries are selected do not specify one in API call to Tautulli
            if($libraries[$library_loop] === null) {
                $library_str = '';
            } else {
                $library_str = '&section_id=' . trim($libraries[$library_loop]);
            }
            
            // Create URL for API call
            $url = $connection . "/api/v2?apikey=" . $config->tautulli_apikey . "&cmd=get_history" . $library_str . "&order_column=date&order_dir=desc&include_activity=0&length=" . $config->tautulli_length . "&start_date=" . $current_loop_date;
            
            // Call URL for data
            $response = call_tautulli_url($url);
            
            // Filter data by content type. Movie, episode or track.
            $temp = $response["response"]["data"]["data"];
            for($j = 0; $j < count($temp); $j++) {
                if($temp[$j]["media_type"] == "movie" || $temp[$j]["media_type"] == "episode" || $temp[$j]["media_type"] == "track") {
                    $temp2 = array("date" => $temp[$j]["date"], "duration" => $temp[$j]["duration"], "friendly_name" => $temp[$j]["friendly_name"], "full_title" => $temp[$j]["full_title"], "grandparent_rating_key" => $temp[$j]["grandparent_rating_key"], "grandparent_title" => $temp[$j]["grandparent_title"], "original_title" => $temp[$j]["original_title"], "media_type" => $temp[$j]["media_type"], "parent_rating_key" => $temp[$j]["parent_rating_key"], "parent_title" => $temp[$j]["parent_title"], "paused_counter" => $temp[$j]["paused_counter"], "percent_complete" => $temp[$j]["percent_complete"], "rating_key" => $temp[$j]["rating_key"], "title" => $temp[$j]["title"], "user" => $temp[$j]["user"], "user_id" => $temp[$j]["user_id"], "year" => $temp[$j]["year"]);
                    array_push($temp_clean, $temp2);
                }
            }
        
        }

        // If the date is today, then the data might not be complete. 
        if($now->format('Y-m-d') == $then->format('Y-m-d')) {
            $complete = False;
        } else {
            $complete = True;
        }

        if($found_date) {
            $array[$found_date_index] = array("date" => $current_loop_date, "data" => $temp_clean, "complete" => $complete);
        } else {
            array_push($array, array("date" => $current_loop_date, "data" => $temp_clean, "complete" => $complete));
        }
        
        if($loop_interval > 0) {
            $loop_interval -= 1;
        } else if($loop_interval === 0) {
            $complete_date_loop = False;
            break;
        }

    }
	
    // Sort data by date
    $date = array_column($array, 'date');
    array_multisort($date, SORT_ASC, $array);

    // End time and calcualte total duration.
    $time_end = microtime(true);
    $execution_time = ($time_end - $time_start);
    $log->log_activity('get_stats.php', $id, 'Refresh execution: '.$execution_time.' Seconds');
	
    return array("data" => $array, "complete" => $complete_date_loop);
}

function data_get_user_stats_loop($id, $array) {
    
    // Start execution timer
    $time_start = microtime(true);

    // Define global values needed
    global $connection;
    global $config;
    global $log;
    global $arrContextOptions;

    // Pre-define variables as empty
    $movies = array();
    $movies_percent_complete = array();
    $shows = array();
	$episodes = array();
    $tracks = array();

    $year_movies = array();
    $year_shows = array();
    $year_music = array();
    $year_users = array();

    for ($i = 0; $i < count($array); $i++) {

        for($d = 0; $d < count($array[$i]["data"]); $d++) {

            // Check if entry is movie and related to user
            if($config->get_user_movie_stats && $array[$i]["data"][$d]["media_type"] == "movie" && $array[$i]["data"][$d]["user_id"] == $id) {

                if($array[$i]["data"][$d]["date"] > $config->wrapped_end) {
                    continue;
                } else if ($array[$i]["data"][$d]["date"] < $config->wrapped_start) {
                    break;
                }

                $duration = $array[$i]["data"][$d]["duration"];
                $percent_complete = $array[$i]["data"][$d]["percent_complete"];
                $title = $array[$i]["data"][$d]["full_title"];
                $year = $array[$i]["data"][$d]["year"];
                $percent_complete = $array[$i]["data"][$d]["percent_complete"];
                $paused_counter = $array[$i]["data"][$d]["paused_counter"];
				
                // Skip movie if year is empty/missing
				if($year == "") {
					continue;
				}
				
                // If movie play duration is more than 300 seconds, use in array to calcualte average movie completion
				if($duration > 300) {
                    array_push($movies_percent_complete, $percent_complete);
                }

                $found = False;

                for ($j = 0; $j < count($movies); $j++) {
                    if(strtolower($movies[$j]["title"]) == strtolower($title) && $movies[$j]["year"] == $year ) {
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

            // Check if entry is show and related to user
            if($config->get_user_show_stats && $array[$i]["data"][$d]["media_type"] == "episode" && $array[$i]["data"][$d]["user_id"] == $id) {
                if($array[$i]["data"][$d]["date"] > $config->wrapped_end) {
                    continue;
                } else if ($array[$i]["data"][$d]["date"] < $config->wrapped_start) {
                    break;
                }

                $title = $array[$i]["data"][$d]["grandparent_title"];
				$episode_title = $array[$i]["data"][$d]["title"];
				$season_title = $array[$i]["data"][$d]["parent_title"];
                $duration = $array[$i]["data"][$d]["duration"];
                $show_found = False;
				$episode_found = False;

                for ($j = 0; $j < count($shows); $j++) {
                    if(strtolower($shows[$j]["title"]) == strtolower($title)) {
                        $shows[$j]["duration"] = intval($shows[$j]["duration"]) + intval($duration);
                        $shows[$j]["plays"] = intval($shows[$j]["plays"]) + 1;
                        $show_found = True;

                        break;
                    }
                }
				
				for ($j = 0; $j < count($episodes); $j++) {
                    if(strtolower($episodes[$j]["grandparent_title"]) == strtolower($title) && strtolower($episodes[$j]["parent_title"]) == strtolower($season_title) && strtolower($episodes[$j]["title"]) == strtolower($episode_title)) {
                        $episodes[$j]["duration"] = intval($episodes[$j]["duration"]) + intval($duration);
                        $episodes[$j]["plays"] = intval($episodes[$j]["plays"]) + 1;
                        $episode_found = True;

                        break;
                    }
                }

                if(!$show_found) {
                    array_push($shows, array("title" => $title, "duration" => $duration, "plays" => 1));
                }
				
				if(!$episode_found) {
                    array_push($episodes, array("title" => $episode_title, "parent_title" => $season_title, "grandparent_title" => $title, "duration" => $duration, "plays" => 1));
                }
            }

            // Check if entry is music and related to user
            if($config->get_user_music_stats && $array[$i]["data"][$d]["media_type"] == "track" && $array[$i]["data"][$d]["user_id"] == $id) {
                if($array[$i]["data"][$d]["date"] > $config->wrapped_end) {
                    continue;
                } else if ($array[$i]["data"][$d]["date"] < $config->wrapped_start) {
                    break;
                }

                $title = $array[$i]["data"][$d]["title"];
                $parent_title = $array[$i]["data"][$d]["parent_title"];
                $grandparent_title = $array[$i]["data"][$d]["grandparent_title"];
                $duration = $array[$i]["data"][$d]["duration"];
                $year = $array[$i]["data"][$d]["year"];
                
                // Skip entry if title, album or artist is empty/missing
                if($title == "" || $grandparent_title == "" || $parent_title == "") {
                    continue;
                }

                $found = False;

                for ($j = 0; $j < count($tracks); $j++) {
                    if(strtolower($title) == strtolower($tracks[$j]["title"]) && strtolower($parent_title == $tracks[$j]["parent_title"]) && strtolower($grandparent_title) == strtolower($tracks[$j]["grandparent_title"])) {
                        $tracks[$j]["plays"] = intval($tracks[$j]["plays"]) + 1;
                        $tracks[$j]["duration"] = intval($tracks[$j]["duration"]) + intval($duration);
                        $found = True;
		    	        break;
                    }
                }

                if(!$found) {
                    array_push($tracks, array("title" => $title, "parent_title" => $parent_title, "grandparent_title" => $grandparent_title, "plays" => 1, "duration" => $duration, "year" => $year));
                }
            }

            // Check if entry is movie for year stats
            if($config->get_year_stats_movies && $array[$i]["data"][$d]["media_type"] == "movie") {
                if(intval($array[$i]["data"][$d]["date"]) > $config->wrapped_end) {
                    continue;
                } else if(intval($array[$i]["data"][$d]["date"]) < $config->wrapped_start) {
                    break;
                }

                $title = $array[$i]["data"][$d]["full_title"];
                $duration = $array[$i]["data"][$d]["duration"];
                $user = $array[$i]["data"][$d]["friendly_name"];
                $user_id = $array[$i]["data"][$d]["user_id"];
                $year = $array[$i]["data"][$d]["year"];

                $user_found = False;
                $movie_found = False;

                for ($j = 0; $j < count($year_users); $j++) {
                    if($year_users[$j]["id"] == $user_id) {
                        $year_users[$j]["duration"] = intval($year_users[$j]["duration"]) + intval($duration);
                        $year_users[$j]["duration_movies"] = intval($year_users[$j]["duration_movies"]) + intval($duration);
                        $year_users[$j]["plays"] = intval($year_users[$j]["plays"]) + 1;
                        $user_found = True;
                        break;
                    }
                }

                if(!$user_found) {
                    array_push($year_users, array("user" => $user, "id" => $user_id, "duration" => $duration, "duration_movies" => $duration, "duration_shows" => 0, "duration_artists" => 0, "plays" => 1));
                }

                for ($j = 0; $j < count($year_movies); $j++) {
                    if(strtolower($year_movies[$j]["title"]) == strtolower($title) && $year_movies[$j]["year"] == $year) {
                        $year_movies[$j]["duration"] = intval($year_movies[$j]["duration"]) + intval($duration);
                        $year_movies[$j]["plays"] = intval($year_movies[$j]["plays"]) + 1;
                        $movie_found = True;
                        break;
                    }
                }

                if(!$movie_found) {
                    array_push($year_movies, array("title" => $title, "year" => $year, "duration" => $duration, "plays" => 1));
                }
            }

            // Check if entry is show for year stats
            if($config->get_year_stats_shows && $array[$i]["data"][$d]["media_type"] == "episode") {
                if(intval($array[$i]["data"][$d]["date"]) > $config->wrapped_end) {
                    continue;
                } else if(intval($array[$i]["data"][$d]["date"]) < $config->wrapped_start) {
                    break;
                }

                $title = $array[$i]["data"][$d]["grandparent_title"];
                $duration = $array[$i]["data"][$d]["duration"];
                $user = $array[$i]["data"][$d]["friendly_name"];
                $user_id = $array[$i]["data"][$d]["user_id"];
                $year = $array[$i]["data"][$d]["year"];

                $user_found = False;
                $show_found = False;

                for ($j = 0; $j < count($year_users); $j++) {
                    if($year_users[$j]["id"] == $user_id) {
                        $year_users[$j]["duration"] = intval($year_users[$j]["duration"]) + intval($duration);
                        $year_users[$j]["duration_shows"] = intval($year_users[$j]["duration_shows"]) + intval($duration);
                        $year_users[$j]["plays"] = intval($year_users[$j]["plays"]) + 1;
                        $user_found = True;
                        break;
                    }
                }

                if(!$user_found) {
                    array_push($year_users, array("user" => $user, "id" => $user_id, "duration" => $duration, "duration_movies" => 0, "duration_shows" => $duration, "duration_artists" => 0, "plays" => 1));
                }

                for ($j = 0; $j < count($year_shows); $j++) {
                    if(strtolower($year_shows[$j]["title"]) == strtolower($title)) {
                        $year_shows[$j]["duration"] = intval($year_shows[$j]["duration"]) + intval($duration);
                        $year_shows[$j]["plays"] = intval($year_shows[$j]["plays"]) + 1;
                        $show_found = True;
                        break;
                    }
                }

                if(!$show_found) {
                    array_push($year_shows, array("title" => $title, "year" => $year, "duration" => $duration, "plays" => 1));
                }

            }

            // Check if entry is music for year stats
            if($config->get_year_stats_music && $array[$i]["data"][$d]["media_type"] == "track") {
                if($array[$i]["data"][$d]["date"] > $config->wrapped_end) {
                    continue;
                } else if ($array[$i]["data"][$d]["date"] < $config->wrapped_start) {
                    break;
                }

                $duration = $array[$i]["data"][$d]["duration"];
                $title = $array[$i]["data"][$d]["title"];
                $parent_title = $array[$i]["data"][$d]["parent_title"];
                $grandparent_title = $array[$i]["data"][$d]["grandparent_title"];
                $user_id = $array[$i]["data"][$d]["user_id"];
                $friendly_name = $array[$i]["data"][$d]["friendly_name"];
                $year = $array[$i]["data"][$d]["year"];

                // Skip entry if title, album or artist is empty/missing
                if($title == "" || $grandparent_title == "" || $parent_title == "") {
                    continue;
                }

                $user_found = False;
                $artist_found = False;

                for ($j = 0; $j < count($year_users); $j++) {
                    if($year_users[$j]["id"] == $user_id) {
                        $year_users[$j]["duration"] = intval($year_users[$j]["duration"]) + $duration;
                        $year_users[$j]["duration_artists"] = intval($year_users[$j]["duration_artists"]) + $duration;
                        $year_users[$j]["plays"] = intval($year_users[$j]["plays"]) + 1;
                        $user_found = True;
                        break;
                    }
                }

                if(!$user_found) {
                    array_push($year_users, array("user" => $friendly_name, "id" => $user_id, "duration" => $duration, "duration_movies" => 0, "duration_shows" => 0, "duration_artists" => $duration, "plays" => 1));
                }

                for ($j = 0; $j < count($year_music); $j++) {
                    if(strtolower($grandparent_title) == strtolower($year_music[$j]["grandparent_title"])) {
                        $year_music[$j]["plays"] = intval($year_music[$j]["plays"]) + 1;
                        $year_music[$j]["duration"] = intval($year_music[$j]["duration"]) + $duration;
		    	        $artist_found = True;
                        break;
                    }
                }

                if(!$artist_found) {
                    array_push($year_music, array("grandparent_title" => $grandparent_title, "plays" => 1, "duration" => $duration));
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

    // Sort $movies for oldest movie and choose the oldest, verifiable movie
    $year = array_column($movies, 'year');
    array_multisort($year, SORT_ASC, $movies);
    if(count($movies) > 0) {
        $oldest_found = false;
        for($i = 0; $i < count($movies); $i++) {
            if($movies[$i]["year"] !== "" && $movies[$i]["year"] > 1000) {
                $movie_oldest = array("title" => $movies[$i]["title"], "year" => $movies[$i]["year"], "plays" => $movies[$i]["plays"], "duration" => $movies[$i]["duration"], "paused_counter" => $movies[$i]["paused_counter"], "error" => false);
                $oldest_found = true;
                break;
            }
        }
        if(!$oldest_found) {
            $movie_oldest = array("title" => "No movies watched", "year" => 0, "plays" => 0, "duration" => 0, "paused_counter" => 0, "error" => true);
        }
    } else {
        $movie_oldest = array("title" => "No movies watched", "year" => 0, "plays" => 0, "duration" => 0, "paused_counter" => 0, "error" => true);
    }

    // Sort $movies by longest duration
    $duration = array_column($movies, 'duration');
    array_multisort($duration, SORT_DESC, $movies);

    //Sort $shows by longest duration
    $duration = array_column($shows, 'duration');
    array_multisort($duration, SORT_DESC, $shows);
	
	//Sort episodes by duration and find longest episode duration
    $duration = array_column($episodes, 'duration');
    array_multisort($duration, SORT_DESC, $episodes);
	if(count($episodes) > 0) {
        $episode_duration_longest = $episodes[0];
        $episode_duration_longest["error"] = false;
    } else {
        $episode_duration_longest = array("title" => "None", "parent_title" => "None", "grandparent_title" => "None", "duration" => 0, "plays" => 0, "error" => true);
    }

    // Declare artist and album variables
    $artists = array();
    $albums = array();

    // Look for artists in track-list
    for($i = 0; $i < count($tracks); $i++) {
        $artist_found = false;

        for($j = 0; $j < count($artists); $j++) {
            if(strtolower($tracks[$i]["grandparent_title"]) == strtolower($artists[$j]["grandparent_title"])) {
                $artists[$j]["plays"] += $tracks[$i]["plays"];
                $artists[$j]["duration"] += $tracks[$i]["duration"];
                $artist_found = true;
                break;
            }
        }

        if(!$artist_found) {
            array_push($artists, array("grandparent_title" => $tracks[$i]["grandparent_title"], "duration" => $tracks[$i]["duration"], "plays" => $tracks[$i]["plays"]));
        }
    }

    // Look for albums in track-list
    for($i = 0; $i < count($tracks); $i++) {
        $album_found = false;

        for($j = 0; $j < count($albums); $j++) {
            if(strtolower($tracks[$i]["grandparent_title"]) == strtolower($albums[$j]["grandparent_title"]) && strtolower($tracks[$i]["parent_title"]) == strtolower($albums[$j]["parent_title"])) {
                $albums[$j]["plays"] += $tracks[$i]["plays"];
                $albums[$j]["duration"] += $tracks[$i]["duration"];
                $album_found = true;
                break;
            }
        }

        if(!$album_found) {
            array_push($albums, array("parent_title" => $tracks[$i]["parent_title"], "grandparent_title" => $tracks[$i]["grandparent_title"], "duration" => $tracks[$i]["duration"], "plays" => 1, "year" => $tracks[$i]["year"]));
        }
    }

    // Sort $albums for oldest album and choose the oldest, verifiable album
    $year = array_column($albums, 'year');
    array_multisort($year, SORT_ASC, $albums);
    if(count($albums) > 0) {
        $oldest_found = false;
        for($i = 0; $i < count($albums); $i++) {
            if($albums[$i]["year"] !== "" && $albums[$i]["year"] > 1000) {
                $album_oldest = array("parent_title" => $albums[$i]["parent_title"], "grandparent_title" => $albums[$i]["grandparent_title"], "year" => $albums[$i]["year"], "plays" => $albums[$i]["plays"], "duration" => $albums[$i]["duration"], "error" => false);
                $oldest_found = true;
                break;
            }
        }
        if(!$oldest_found) {
            $album_oldest = array("parent_title" => "No albums played", "grandparent_title" => "No albums played", "year" => 0, "plays" => 0, "duration" => 0, "error" => true);
        }
    } else {
        $album_oldest = array("parent_title" => "No albums played", "grandparent_title" => "No albums played", "year" => 0, "plays" => 0, "duration" => 0, "error" => true);
    }

    // Sort $tracks by longest duration
    $duration = array_column($tracks, 'duration');
    array_multisort($duration, SORT_DESC, $tracks);

    // Sort $albums by longest duration
    $duration = array_column($albums, 'duration');
    array_multisort($duration, SORT_DESC, $albums);

    // Sort $artists by longest duration
    $duration = array_column($artists, 'duration');
    array_multisort($duration, SORT_DESC, $artists);

    // Sort $year_movies by duration
    $duration = array_column($year_movies, 'duration');
    array_multisort($duration, SORT_DESC, $year_movies);

    // Sort $year_shows by duration
    $duration = array_column($year_shows, 'duration');
    array_multisort($duration, SORT_DESC, $year_shows);

    // Sort $year_music by duration
    $duration = array_column($year_music, 'duration');
    array_multisort($duration, SORT_DESC, $year_music);

    // Sort users by combined duration
    $duration = array_column($year_users, 'duration');
    array_multisort($duration, SORT_DESC, $year_users);

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

    // Choose return value based on if function is enabled
    if($config->get_user_movie_stats) {
        $return_movies = array("movies" => array_slice($movies, 0, 10), "user_movie_most_paused" => $movie_most_paused, "user_movie_finishing_percent" => $movie_percent_average, "user_movie_oldest" => $movie_oldest);
        $duration = 0;
        for($i = 0; $i < count($movies); $i++) {
            $duration += $movies[$i]["duration"];
        }
        $return_movies["movie_duration"] = $duration;
        $return_movies["movie_plays"] = count($movies);
    } else {
        $return_movies = array();
    }

    // Choose return value based on if function is enabled
    if($config->get_user_show_stats) {
        $return_shows = array("shows" => array_slice($shows, 0, 10), "episode_duration_longest" => $episode_duration_longest);
        $duration = 0;
        for($i = 0; $i < count($shows); $i++) {
            $duration += $shows[$i]["duration"];
        }
        $return_shows["show_duration"] = $duration;
        $return_shows["show_plays"] = count($shows);
    } else {
        $return_shows = array();
    }

    // Choose return value based on if function is enabled
    if($config->get_user_music_stats) {
        $return_music = array("tracks" => array_slice($tracks, 0, 10), "albums" => array_slice($albums, 0, 10), "user_album_oldest" => $album_oldest, "artists" => array_slice($artists, 0, 10));
        $duration = 0;
        for($i = 0; $i < count($tracks); $i++) {
            $duration += $tracks[$i]["duration"];
        }
        $return_music["track_duration"] = $duration;
        $return_music["track_plays"] = count($tracks);
    }else {
        $return_music = array();
    }

    // Choose return value based on if function is enabled
    if($config->get_year_stats_movies) {
        $return_year_movies["movies"] = array_slice($year_movies, 0, 10);
        $duration = 0;
        for($i = 0; $i < count($year_movies); $i++) {
            $duration += $year_movies[$i]["duration"];
        }
        $return_year_movies["movie_duration"] = $duration;
        $return_year_movies["movie_plays"] = count($year_movies);
    }else {
        $return_year_movies = array();
    }

    // Choose return value based on if function is enabled
    if($config->get_year_stats_shows) {
        $return_year_shows["shows"] = array_slice($year_shows, 0, 10);
        $duration = 0;
        for($i = 0; $i < count($year_shows); $i++) {
            $duration += $year_shows[$i]["duration"];
        }
        $return_year_shows["show_duration"] = $duration;
        $return_year_shows["show_plays"] = count($year_shows);
    }else {
        $return_year_shows = array();
    }

    // Choose return value based on if function is enabled
    if($config->get_year_stats_music) {
        $return_year_music["artists"] = array_slice($year_music, 0, 10);
        $duration = 0;
        for($i = 0; $i < count($year_music); $i++) {
            $duration += $year_music[$i]["duration"];
        }
        $return_year_music["music_duration"] = $duration;
        $return_year_music["music_plays"] = count($year_music);
    }else {
        $return_year_music = array();
    }

    // Choose return value based on if function is enabled
    if(($config->get_year_stats_movies || $config->get_year_stats_shows || $config->get_year_stats_music) && $config->get_year_stats_leaderboard) {
        $return_year_users = array_slice($year_users, 0, 10);
    } else {
        $return_year_users = array();
    }

    // Calculate and log execution time
    $time_end = microtime(true);
    $execution_time = ($time_end - $time_start);
    $log->log_activity('get_stats.php', $id, 'Wrapping execution: '.$execution_time.' seconds');

    return array("movies" => $return_movies, "shows" => $return_shows, "music" => $return_music, "year_movies" => $return_year_movies, "year_shows" => $return_year_shows, "year_music" => $return_year_music, "year_users" => $return_year_users);
}

function data_get_user_show_buddy($id, $show, $array) {
	
	$time_start = microtime(true);
	
    global $connection;
    global $config;
    global $log;
    global $name;
    global $arrContextOptions;

    $top_show_users = array();

    for ($i = 0; $i < count($array); $i++) {
		for($j = 0; $j < count($array[$i]["data"]); $j++) {
			$user_id = $array[$i]["data"][$j]["user_id"];
			$friendly_name = $array[$i]["data"][$j]["friendly_name"];
			$duration = $array[$i]["data"][$j]["duration"];
			$grandparent_title = $array[$i]["data"][$j]["grandparent_title"];

			if($array[$i]["data"][$j]["date"] > $config->wrapped_end || $grandparent_title != $show) {
				continue;
			} else if($array[$i]["data"][$j]["date"] < $config->wrapped_start) {
				break;
			}

			$found = False;

			for ($u = 0; $u < count($top_show_users); $u++) {
				if($top_show_users[$u]["user_id"] == $user_id) {
					$top_show_users[$u]["duration"] = intval($top_show_users[$u]["duration"]) + intval($duration);
					$found = True;

					break;
				}
			}

			if(!$found) {
				array_push($top_show_users, array("user_id" => $user_id, "duration" => $duration, "friendly_name" => $friendly_name));
			}
		}
    }

    // Sort show-buddies by duration
    $duration = array_column($top_show_users, 'duration');
    array_multisort($duration, SORT_DESC, $top_show_users);

    $index = 0;
    if(count($top_show_users) > 1) {
        for($i = 0; $i < count($top_show_users); $i++) {
            if($top_show_users[$i]["user_id"] == $id) {
                $index = $i;
            }
        }

        if((($index == 0) || ($index % 2 == 0)) AND ($index < count($top_show_users)-1)) {
            $buddy = array("friendly_name" => $top_show_users[$index+1]["friendly_name"], "user_id" => $top_show_users[$index+1]["user_id"], "duration" => $top_show_users[$index+1]["duration"], "found" => True, "watched_relative_to_you" => "less");
        } else {
            $buddy = array("friendly_name" => $top_show_users[$index-1]["friendly_name"], "user_id" => $top_show_users[$index-1]["user_id"], "duration" => $top_show_users[$index-1]["duration"], "found" => True, "watched_relative_to_you" => "more");
        }

    } else {
        $buddy = array("friendly_name" => False, "user_id" => False, "duration" => 0, "found" => False, "watched_relative_to_you" => False);
    }
	
	$time_end = microtime(true);
    $execution_time = ($time_end - $time_start);
    $log->log_activity('get_stats.php', $id, 'Buddy execution: '.$execution_time.' seconds');

    return $buddy;
}
?>
