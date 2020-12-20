<?php
$data = json_decode(file_get_contents("php://input"));
$config = json_decode(file_get_contents("../config.json"));

$url_base = '' !== $config->url_base ? $config->url_base : '/';

$p_email = $data->p_email;
$p_email = htmlspecialchars($p_email);
$id = "fail";

$url = "http://" . $config->ip . ":" . $config->plexpy_port . $url_base . "/api/v2?apikey=" . $config->plexpy_apikey . "&cmd=get_users";
$response = json_decode(file_get_contents($url));

for ($i = 0; $i < count($response->response->data); $i++) {
    if ($response->response->data[$i]->email == $p_email) {
        $id = $response->response->data[$i]->user_id;
        break;
    }
}

if ($id == "fail") {
    echo json_encode(array("message" => "No user found with that email", "error" => "true"));
    exit(0);
}

// Name
$url = "http://" . $config->ip . ":" . $config->plexpy_port . $url_base . "/api/v2?apikey=" . $config->plexpy_apikey . "&cmd=get_user_ips&user_id=" . $id;
$response = json_decode(file_get_contents($url));
$name = $response->response->data->data[0]->friendly_name;

//LOG NAME
$date = date('m/d/Y h:i:s a', time());
$logg = "\n" . $date . " - " . $name . " (" . $p_email . ")";
file_put_contents("log.txt", $logg, FILE_APPEND);

//MOVIES
$url = "http://" . $config->ip . ":" . $config->plexpy_port . $url_base . "/api/v2?apikey=" . $config->plexpy_apikey . "&cmd=get_history&user_id=" . $id . "&section_id=" . $config->library_id_movies . "&order_column=full_title&order_dir=asc&length=10000";
$response = json_decode(file_get_contents($url));
$array = $response->response->data->data;
$movies = array();
$movies_percent_complete = array();

for ($i = 0; $i < count($array); $i++) {
    $title = $array[$i]->full_title;
    $duration = $array[$i]->duration;
    $percent_complete = $array[$i]->percent_complete;
    $paused_counter = $array[$i]->paused_counter;

    if(!($array[$i]->date > 1577836800 && $array[$i]->date < 1609459200)) {
        continue;
    }

    if($duration > 300) {
        array_push($movies_percent_complete, $array[$i]->percent_complete);
    }

    $found = False;

    for ($j = 0; $j < count($movies); $j++) {
        if($movies[$j]["title"] == $title) {
            $movies[$j]["plays"] = intval($movies[$j]["plays"]) + 1;
            $movies[$j]["duration"] = intval($movies[$j]["duration"]) + intval($duration);
            $found = True;

            break;
        }
    }

    if(!$found) {
        array_push($movies, array("title" => $title, "plays" => 1, "duration" => $duration, "paused_counter" => $paused_counter));
    }
}

//MOST PAUSED
$paused_counter = array_column($movies, 'paused_counter');
array_multisort($paused_counter, SORT_DESC, $movies);
if(count($movies) > 0) {
$movie_most_paused = array("title" => $movies[0]["title"], "paused_counter" => $movies[0]["paused_counter"]);
} else {
$movie_most_paused = array("title" => "No movies", "paused_counter" => 0);
}

//SORT MOVIES BY DURATION
$duration = array_column($movies, 'duration');
array_multisort($duration, SORT_DESC, $movies);

//AVERAGE MOVIE PERCENT COMPLETE
$sum = 0;
for($i = 0; $i < count($movies_percent_complete); $i++) {
    $sum = $sum + $movies_percent_complete[$i];
}
if(count($movies_percent_complete) > 0) {
$movie_percent_average = $sum / count($movies_percent_complete);
} else {
$movie_percent_average = 0;
}

//SHOWS
$url = "http://" . $config->ip . ":" . $config->plexpy_port . $url_base . "/api/v2?apikey=" . $config->plexpy_apikey . "&cmd=get_history&user_id=" . $id . "&section_id=" . $config->library_id_shows . "&order_column=full_title&order_dir=asc&length=10000";
$response = json_decode(file_get_contents($url));
$array = $response->response->data->data;
$shows = array();

for ($i = 0; $i < count($array); $i++) {
    $title = $array[$i]->grandparent_title;
    $duration = $array[$i]->duration;

    if(!($array[$i]->date > 1577836800 && $array[$i]->date < 1609459200)) {
        continue;
    }

    $found = False;

    for ($j = 0; $j < count($shows); $j++) {
        if($shows[$j]["title"] == $title) {
            $shows[$j]["duration"] = intval($shows[$j]["duration"]) + intval($duration);
            $found = True;

            break;
        }
    }

    if(!$found) {
        array_push($shows, array("title" => $title, "duration" => $duration));
    }
}

//SORT SHOWS BY DURATION
$duration = array_column($shows, 'duration');
array_multisort($duration, SORT_DESC, $shows);

//SHOW BUDDIES
if(count($shows) > 0){
$url = "http://" . $config->ip . ":" . $config->plexpy_port . $url_base . "/api/v2?apikey=" . $config->plexpy_apikey . "&cmd=get_history&section_id=" . $library_id_shows . "&order_column=full_title&order_dir=asc&length=10000&search=" . urlencode($shows[0]["title"]);
$response = json_decode(file_get_contents($url));
$array = $response->response->data->data;
$top_show_users = array();

for ($i = 0; $i < count($array); $i++) {
    $user = $array[$i]->friendly_name;
    $duration = $array[$i]->duration;
	
    if(!((intval($array[$i]->date) > 1577836800 && intval($array[$i]->date) < 1609459200) && ($array[$i]->grandparent_title == $shows[0]["title"]))) {
		continue;
		
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

//SORT SHOW BUDDIES BY DURATION
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
        $buddy = array("user" => $top_show_users[$index+1]["user"], "duration" => $top_show_users[$index+1]["duration"], "error" => False, "watched_relative_to_you" => "less");
    } else {
        $buddy = array("user" => $top_show_users[$index-1]["user"], "duration" => $top_show_users[$index-1]["duration"], "error" => False, "watched_relative_to_you" => "more");
    }

} else {
    $buddy = array("user" => "none", "duration" => 0, "error" => True, "watched_relative_to_you" => "none");
}
} else {
	$buddy = array("user" => "none", "duration" => 0, "error" => True, "watched_relative_to_you" => "none");
}

//GET USERS LAST 365
$url = "http://" . $config->ip . ":" . $config->plexpy_port . $url_base . "/api/v2?apikey=" . $config->plexpy_apikey . "&cmd=get_plays_by_top_10_users&time_range=365&y_axis=duration";
$response = json_decode(file_get_contents($url));
$top_users = $response->response->data->categories;

//GET TOP MOVIES AND SHOWS
$url = "http://" . $config->ip . ":" . $config->plexpy_port . $url_base . "/api/v2?apikey=" . $config->plexpy_apikey . "&cmd=get_home_stats&time_range=365&stats_type=duration&grouping=1&stats_count=10";
$response = json_decode(file_get_contents($url));
$top_10_movies = array();
$top_10_shows = array();

for($i = 0; $i < 10; $i++) {
	array_push($top_10_movies, array("title" => $response->response->data[0]->rows[$i]->title, "duration" => $response->response->data[0]->rows[$i]->total_duration, "plays" => $response->response->data[0]->rows[$i]->total_plays));
	array_push($top_10_shows, array("title" => $response->response->data[2]->rows[$i]->title, "duration" => $response->response->data[2]->rows[$i]->total_duration, "plays" => $response->response->data[2]->rows[$i]->total_plays));
}

//SORT SHOW AND MOVIES BY DURATION
$duration = array_column($top_10_movies, 'duration');
array_multisort($duration, SORT_DESC, $top_10_movies);

$duration = array_column($top_10_shows, 'duration');
array_multisort($duration, SORT_DESC, $top_10_shows);


//PRINT VALUES
echo json_encode(array( "name" => $name,
                        "error" => False,
                        "message" => "Data processed.",
                        "movie_most_paused" => $movie_most_paused,
                        "movie_percent_average" => $movie_percent_average,
                        "top_movies" => $movies,
                        "top_shows" => $shows,
                        "show_buddy" => $buddy,
                        "top_users" => $top_users,
						"top_10_movies" => $top_10_movies,
						"top_10_shows" => $top_10_shows
                        ));