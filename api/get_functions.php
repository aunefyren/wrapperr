<?php
$data = json_decode(file_get_contents("php://input"));

$path = "../config/config.json";
if(!file_exists($path)) {
	fopen($path, "w");
}	
$config = json_decode(file_get_contents("../config/config.json"));

if (empty($config)) {
    echo json_encode(array("message" => "Plex Wrapped is not configured.", "error" => true));
    exit(0);
}

$functions = array("get_user_movie_stats" => $config->get_user_movie_stats,
                    "get_user_show_stats" => $config->get_user_show_stats,
                    "get_user_show_buddy" => $config->get_user_show_buddy,
					"get_user_music_stats" => $config->get_user_music_stats,
                    "get_year_stats_movies" => $config->get_year_stats_movies,
                    "get_year_stats_shows" => $config->get_year_stats_shows,
                    "get_year_stats_music" => $config->get_year_stats_music,
                    "get_year_stats_leaderboard" => $config->get_year_stats_leaderboard
                    );

// Log API request if enabled
if($config->use_logs) {
	if(!log_activity()) {
		echo json_encode(array("message" => "Failed to log event.", "error" => true));
		exit(0);
	}
}

echo json_encode($functions);
exit(0);

function log_activity() {
	$date = date('Y-m-d H:i:s');
	
	$path = "../config/wrapped.log";
	if(!file_exists($path)) {
		$temp = fopen($path, "w");
		fwrite($temp, 'Plex Wrapped');
		fclose($temp);
	}	
	
	$log_file = fopen($path, 'a');
	fwrite($log_file, PHP_EOL . $date . ' - get_functions.php');   
	
	if(fclose($log_file)) {
		return True;
	}
	
	return False;
}
?>