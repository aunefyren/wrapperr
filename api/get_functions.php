<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/config.php');
require(dirname(__FILE__) . '/objects/log.php');

// Create variables
$config = new Config();
$log = new Log();
$data = json_decode(file_get_contents("php://input"));

// Log use
$log->log_activity('get_functions.php', 'unknown', 'Retrieved Plex-Wrapped functions.');

// Create JSON from functions
$functions_json = array("plex_wrapped_version" => $config->plex_wrapped_version,
						"get_user_movie_stats" => $config->get_user_movie_stats,
						"get_user_show_stats" => $config->get_user_show_stats,
						"get_user_show_buddy" => $config->get_user_show_buddy,
						"get_user_music_stats" => $config->get_user_music_stats,
						"get_year_stats_movies" => $config->get_year_stats_movies,
						"get_year_stats_shows" => $config->get_year_stats_shows,
						"get_year_stats_music" => $config->get_year_stats_music,
						"get_year_stats_leaderboard" => $config->get_year_stats_leaderboard,
						"stats_intro" => $config->stats_intro,
						"create_share_links" => $config->create_share_links
						);

// Encode JSON and print it
echo json_encode($functions_json);
exit(0);
?>