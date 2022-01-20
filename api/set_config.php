<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/config.php');
require(dirname(__FILE__) . '/objects/admin.php');
require(dirname(__FILE__) . '/objects/log.php');

// Create variables
$config = new Config();
$admin = new Admin();
$log = new Log();
$data = json_decode(file_get_contents("php://input"));

// If POST data is empty
if(empty($data) || !isset($data->cookie) || !isset($data->data_type)) {

	// Log use
	$log->log_activity('set_config.php', 'unknown', 'No admin login input provided.');

    echo json_encode(array("error" => true, "message" => "Invalid input provided."));
    exit(0);
}

// Remove potential harmfull input
$cookie = htmlspecialchars($data->cookie);

// Check if confgiured
if(!$admin->is_configured()) {

	// Log use
	$log->log_activity('set_config.php', 'unknown', 'Wrapperr admin is not configured.');

    echo json_encode(array("error" => true, "message" => "Wrapperr admin is not configured."));
    exit(0);

} 

// Decrypt cookie
$cookie_object = json_decode($admin->decrypt_cookie($cookie));

// Validate admin cookie
if(!$admin->validate_cookie($cookie_object)) {
    
	// Log use
	$log->log_activity('set_config.php', 'unknown', 'Admin cookie not valid.');

    echo json_encode(array("error" => true, "message" => "Admin cookie not accepted. Log in again."));
    exit(0);
	
} else {

	// Call save function
    save_config($data->data, $data->data_type, $data->clear_cache);

}

// Retrieve data and save it
function save_config($data, $data_type, $clear_cache) {

    global $config;
    global $log;

    if($data_type === 'tautulli_settings') {

        $fail = false;
        try {
            $config->tautulli_apikey = $data->tautulli_apikey;
            $config->tautulli_ip = $data->tautulli_ip;
            $config->tautulli_port = $data->tautulli_port;
            $config->tautulli_length = $data->tautulli_length;
            $config->tautulli_root = $data->tautulli_root;
            $config->tautulli_libraries = $data->tautulli_libraries;
            $config->tautulli_grouping = $data->tautulli_grouping;
            $config->https = $data->https;
        } catch (Exception $e) {
            $fail = true;
        }

        if($fail) {
            // Log use
            $log->log_activity('set_config.php', 'admin', 'Failed to assign variables from data. Data type: ' . $data_type . '.');

            echo json_encode(array("error" => true, "message" => "Failed to assign variables from data."));
            exit(0);
        }

    } else if($data_type === 'wrapperr_settings') {

        $fail = false;
        try {
            $config->use_plex_auth = $data->use_plex_auth;
            $config->use_cache = $data->use_cache;
            $config->use_logs = $data->use_logs;
            $config->wrapperr_root = $data->wrapperr_root;
            $config->application_name = $data->application_name;
            $config->application_url = $data->application_url;
            $config->create_share_links = $data->create_share_links;
            $config->timezone = $data->timezone;
        } catch (Exception $e) {
            $fail = true;
        }

        if($fail) {
            // Log use
            $log->log_activity('set_config.php', 'admin', 'Failed to assign variables from data. Data type: ' . $data_type . '.');

            echo json_encode(array("error" => true, "message" => "Failed to assign variables from data."));
            exit(0);
        }

    } else if($data_type === 'wrapperr_customization') {
    
        $fail = false;
        try {
            $config->wrapped_start = $data->wrapped_start;
            $config->wrapped_end = $data->wrapped_end;
            $config->stats_intro_title = $data->stats_intro_title;
            $config->stats_intro_subtitle = $data->stats_intro_subtitle;
            $config->stats_outro_title = $data->stats_outro_title;
            $config->stats_outro_subtitle = $data->stats_outro_subtitle;
            $config->stats_order_by_plays = $data->stats_order_by_plays;
            $config->stats_order_by_duration = $data->stats_order_by_duration;
            $config->get_user_movie_stats = $data->get_user_movie_stats;
            $config->get_user_movie_stats_title = $data->get_user_movie_stats_title;
            $config->get_user_movie_stats_subtitle = $data->get_user_movie_stats_subtitle;
            $config->get_user_movie_stats_subsubtitle = $data->get_user_movie_stats_subsubtitle;
            $config->get_user_movie_stats_subtitle_one = $data->get_user_movie_stats_subtitle_one;
            $config->get_user_movie_stats_subsubtitle_one = $data->get_user_movie_stats_subsubtitle_one;
            $config->get_user_movie_stats_subtitle_none = $data->get_user_movie_stats_subtitle_none;
            $config->get_user_movie_stats_subsubtitle_none = $data->get_user_movie_stats_subsubtitle_none;
            $config->get_user_movie_stats_top_movie = $data->get_user_movie_stats_top_movie;
            $config->get_user_movie_stats_top_movie_plural = $data->get_user_movie_stats_top_movie_plural;
            $config->get_user_movie_stats_movie_completion_title = $data->get_user_movie_stats_movie_completion_title;
            $config->get_user_movie_stats_movie_completion_title_plural = $data->get_user_movie_stats_movie_completion_title_plural;
            $config->get_user_movie_stats_movie_completion_subtitle = $data->get_user_movie_stats_movie_completion_subtitle;
            $config->get_user_movie_stats_pause_title = $data->get_user_movie_stats_pause_title;
            $config->get_user_movie_stats_pause_subtitle = $data->get_user_movie_stats_pause_subtitle;
            $config->get_user_movie_stats_pause_title_one = $data->get_user_movie_stats_pause_title_one;
            $config->get_user_movie_stats_pause_subtitle_one = $data->get_user_movie_stats_pause_subtitle_one;
            $config->get_user_movie_stats_pause_title_none = $data->get_user_movie_stats_pause_title_none;
            $config->get_user_movie_stats_pause_subtitle_none = $data->get_user_movie_stats_pause_subtitle_none;
            $config->get_user_movie_stats_oldest_title = $data->get_user_movie_stats_oldest_title;
            $config->get_user_movie_stats_oldest_subtitle = $data->get_user_movie_stats_oldest_subtitle;
            $config->get_user_movie_stats_oldest_subtitle_pre_1950 = $data->get_user_movie_stats_oldest_subtitle_pre_1950;
            $config->get_user_movie_stats_oldest_subtitle_pre_1975 = $data->get_user_movie_stats_oldest_subtitle_pre_1975;
            $config->get_user_movie_stats_oldest_subtitle_pre_2000 = $data->get_user_movie_stats_oldest_subtitle_pre_2000;
            $config->get_user_movie_stats_spent_title = $data->get_user_movie_stats_spent_title;
            $config->get_user_show_stats = $data->get_user_show_stats;
            $config->get_user_show_stats_buddy = $data->get_user_show_stats_buddy;
            $config->get_user_show_stats_title = $data->get_user_show_stats_title;
            $config->get_user_show_stats_subtitle = $data->get_user_show_stats_subtitle;
            $config->get_user_show_stats_subsubtitle = $data->get_user_show_stats_subsubtitle;
            $config->get_user_show_stats_subtitle_one = $data->get_user_show_stats_subtitle_one;
            $config->get_user_show_stats_subsubtitle_one = $data->get_user_show_stats_subsubtitle_one;
            $config->get_user_show_stats_subtitle_none = $data->get_user_show_stats_subtitle_none;
            $config->get_user_show_stats_subsubtitle_none = $data->get_user_show_stats_subsubtitle_none;
            $config->get_user_show_stats_top_show = $data->get_user_show_stats_top_show;
            $config->get_user_show_stats_top_show_plural = $data->get_user_show_stats_top_show_plural;
            $config->get_user_show_stats_spent_title = $data->get_user_show_stats_spent_title;
			$config->get_user_show_stats_most_played_title = $data->get_user_show_stats_most_played_title;
			$config->get_user_show_stats_most_played_subtitle = $data->get_user_show_stats_most_played_subtitle;
			$config->get_user_show_stats_buddy_title = $data->get_user_show_stats_buddy_title;
			$config->get_user_show_stats_buddy_subtitle = $data->get_user_show_stats_buddy_subtitle;
			$config->get_user_show_stats_buddy_title_none = $data->get_user_show_stats_buddy_title_none;
			$config->get_user_show_stats_buddy_subtitle_none = $data->get_user_show_stats_buddy_subtitle_none;
            $config->get_user_music_stats = $data->get_user_music_stats;
            $config->get_user_music_stats_title = $data->get_user_music_stats_title;
            $config->get_user_music_stats_subtitle = $data->get_user_music_stats_subtitle;
            $config->get_user_music_stats_subsubtitle = $data->get_user_music_stats_subsubtitle;
            $config->get_user_music_stats_subtitle_one = $data->get_user_music_stats_subtitle_one;
            $config->get_user_music_stats_subsubtitle_one = $data->get_user_music_stats_subsubtitle_one;
            $config->get_user_music_stats_subtitle_none = $data->get_user_music_stats_subtitle_none;
            $config->get_user_music_stats_subsubtitle_none = $data->get_user_music_stats_subsubtitle_none;
            $config->get_user_music_stats_top_track = $data->get_user_music_stats_top_track;
            $config->get_user_music_stats_top_track_plural = $data->get_user_music_stats_top_track_plural;
            $config->get_user_music_stats_top_album_plural = $data->get_user_music_stats_top_album_plural;
            $config->get_user_music_stats_top_artist_plural = $data->get_user_music_stats_top_artist_plural;
            $config->get_user_music_stats_spent_title = $data->get_user_music_stats_spent_title;
            $config->get_user_music_stats_spent_subtitle = $data->get_user_music_stats_spent_subtitle;
            $config->get_user_music_stats_oldest_album_title = $data->get_user_music_stats_oldest_album_title;
            $config->get_user_music_stats_oldest_album_subtitle = $data->get_user_music_stats_oldest_album_subtitle;
            $config->get_year_stats_title = $data->get_year_stats_title;
            $config->get_year_stats_subtitle = $data->get_year_stats_subtitle;
            $config->get_year_stats_subsubtitle = $data->get_year_stats_subsubtitle;
            $config->get_year_stats_movies = $data->get_year_stats_movies;
            $config->get_year_stats_movies_title = $data->get_year_stats_movies_title;
            $config->get_year_stats_movies_duration_title = $data->get_year_stats_movies_duration_title;
            $config->get_year_stats_shows = $data->get_year_stats_shows;
            $config->get_year_stats_shows_title = $data->get_year_stats_shows_title;
            $config->get_year_stats_shows_duration_title = $data->get_year_stats_shows_duration_title;
            $config->get_year_stats_music = $data->get_year_stats_music;
            $config->get_year_stats_music_title = $data->get_year_stats_music_title;
            $config->get_year_stats_music_duration_title = $data->get_year_stats_music_duration_title;
            $config->get_year_stats_leaderboard = $data->get_year_stats_leaderboard;
            $config->get_year_stats_leaderboard_title = $data->get_year_stats_leaderboard_title;
            $config->get_year_stats_duration_sum_title = $data->get_year_stats_duration_sum_title;
            $config->wrapperr_and = $data->wrapperr_and;
            $config->wrapperr_play = $data->wrapperr_play;
            $config->wrapperr_play_plural = $data->wrapperr_play_plural;
            $config->wrapperr_day = $data->wrapperr_day;
            $config->wrapperr_day_plural = $data->wrapperr_day_plural;
            $config->wrapperr_hour = $data->wrapperr_hour;
            $config->wrapperr_hour_plural = $data->wrapperr_hour_plural;
            $config->wrapperr_minute = $data->wrapperr_minute;
            $config->wrapperr_minute_plural = $data->wrapperr_minute_plural;
            $config->wrapperr_second = $data->wrapperr_second;
            $config->wrapperr_second_plural = $data->wrapperr_second_plural;
            $config->wrapperr_sort_plays = $data->wrapperr_sort_plays;
            $config->wrapperr_sort_duration = $data->wrapperr_sort_duration;
        } catch (Exception $e) {
            $fail = true;
        }

        if($fail) {
            // Log use
            $log->log_activity('set_config.php', 'admin', 'Failed to assign variables from data. Data type: ' . $data_type . '.');

            echo json_encode(array("error" => true, "message" => "Failed to assign variables from data."));
            exit(0);
        }

    } else {

        // Log use
	    $log->log_activity('set_config.php', 'admin', 'Invalid data type for saving config. Data type: ' . $data_type . '.');

        echo json_encode(array("error" => true, "message" => "Invalid data type for saving config."));
        exit(0);

    }

    // Call function to save data
    if($config->save_config($clear_cache)) {

        // Log use
	    $log->log_activity('set_config.php', 'admin', 'New config was saved. Data type: ' . $data_type . '.');

        echo json_encode(array("error" => false, "message" => "Changes saved."));
        exit(0);

    } else {

        // Log use
	    $log->log_activity('set_config.php', 'admin', 'Changes were not saved.');

        echo json_encode(array("error" => true, "message" => "Changes were not saved. Is the directory 'config' writable?"));
        exit(0);
    }
}
?>