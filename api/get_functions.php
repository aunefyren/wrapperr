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
$log->log_activity('get_functions.php', 'unknown', 'Retrieved Wrapperr functions.');

// Create JSON from functions
$functions_json = array("wrapperr_version" => $config->wrapperr_version,
						"get_user_movie_stats" => $config->get_user_movie_stats,
						"get_user_movie_stats_title" => $config->get_user_movie_stats_title,
						"get_user_movie_stats_subtitle" => $config->get_user_movie_stats_subtitle,
						"get_user_movie_stats_subsubtitle" => $config->get_user_movie_stats_subsubtitle,
						"get_user_movie_stats_subtitle_one" => $config->get_user_movie_stats_subtitle_one,
						"get_user_movie_stats_subsubtitle_one" => $config->get_user_movie_stats_subsubtitle_one,
						"get_user_movie_stats_subtitle_none" => $config->get_user_movie_stats_subtitle_none,
						"get_user_movie_stats_subsubtitle_none" => $config->get_user_movie_stats_subsubtitle_none,
						"get_user_movie_stats_top_movie" => $config->get_user_movie_stats_top_movie,
						"get_user_movie_stats_top_movie_plural" => $config->get_user_movie_stats_top_movie_plural,
						"get_user_movie_stats_movie_completion_title" => $config->get_user_movie_stats_movie_completion_title,
						"get_user_movie_stats_movie_completion_title_plural" => $config->get_user_movie_stats_movie_completion_title_plural,
						"get_user_movie_stats_movie_completion_subtitle" => $config->get_user_movie_stats_movie_completion_subtitle,
						"get_user_movie_stats_pause_title" => $config->get_user_movie_stats_pause_title,
						"get_user_movie_stats_pause_subtitle" => $config->get_user_movie_stats_pause_subtitle,
						"get_user_movie_stats_pause_title_one" => $config->get_user_movie_stats_pause_title_one,
						"get_user_movie_stats_pause_subtitle_one" => $config->get_user_movie_stats_pause_subtitle_one,
						"get_user_movie_stats_pause_title_none" => $config->get_user_movie_stats_pause_title_none,
						"get_user_movie_stats_pause_subtitle_none" => $config->get_user_movie_stats_pause_subtitle_none,
						"get_user_movie_stats_oldest_title" => $config->get_user_movie_stats_oldest_title,
						"get_user_movie_stats_oldest_subtitle" => $config->get_user_movie_stats_oldest_subtitle,
						"get_user_movie_stats_oldest_subtitle_pre_1950" => $config->get_user_movie_stats_oldest_subtitle_pre_1950,
						"get_user_movie_stats_oldest_subtitle_pre_1975" => $config->get_user_movie_stats_oldest_subtitle_pre_1975,
						"get_user_movie_stats_oldest_subtitle_pre_2000" => $config->get_user_movie_stats_oldest_subtitle_pre_2000,
						"get_user_movie_stats_spent_title" => $config->get_user_movie_stats_spent_title,
						"get_user_show_stats" => $config->get_user_show_stats,
						"get_user_show_stats_buddy" => $config->get_user_show_stats_buddy,
						"get_user_show_stats_title" => $config->get_user_show_stats_title,
						"get_user_show_stats_subtitle" => $config->get_user_show_stats_subtitle,
						"get_user_show_stats_subsubtitle" => $config->get_user_show_stats_subsubtitle,
						"get_user_show_stats_subtitle_one" => $config->get_user_show_stats_subtitle_one,
						"get_user_show_stats_subsubtitle_one" => $config->get_user_show_stats_subsubtitle_one,
						"get_user_show_stats_subtitle_none" => $config->get_user_show_stats_subtitle_none,
						"get_user_show_stats_subsubtitle_none" => $config->get_user_show_stats_subsubtitle_none,
						"get_user_show_stats_top_show" => $config->get_user_show_stats_top_show,
						"get_user_show_stats_top_show_plural" => $config->get_user_show_stats_top_show_plural,
						"get_user_show_stats_spent_title" => $config->get_user_show_stats_spent_title,
						"get_user_show_stats_most_played_title" => $config->get_user_show_stats_most_played_title,
						"get_user_show_stats_most_played_subtitle" => $config->get_user_show_stats_most_played_subtitle,
						"get_user_show_stats_buddy_title" => $config->get_user_show_stats_buddy_title,
						"get_user_show_stats_buddy_subtitle" => $config->get_user_show_stats_buddy_subtitle,
						"get_user_show_stats_buddy_title_none" => $config->get_user_show_stats_buddy_title_none,
						"get_user_show_stats_buddy_subtitle_none" => $config->get_user_show_stats_buddy_subtitle_none,
						"get_user_music_stats" => $config->get_user_music_stats,
						"get_user_music_stats_title" => $config->get_user_music_stats_title,
						"get_user_music_stats_subtitle" => $config->get_user_music_stats_subtitle,
						"get_user_music_stats_subsubtitle" => $config->get_user_music_stats_subsubtitle,
						"get_user_music_stats_subtitle_one" => $config->get_user_music_stats_subtitle_one,
						"get_user_music_stats_subsubtitle_one" => $config->get_user_music_stats_subsubtitle_one,
						"get_user_music_stats_subtitle_none" => $config->get_user_music_stats_subtitle_none,
						"get_user_music_stats_subsubtitle_none" => $config->get_user_music_stats_subsubtitle_none,
						"get_user_music_stats_top_track" => $config->get_user_music_stats_top_track,
						"get_user_music_stats_top_track_plural" => $config->get_user_music_stats_top_track_plural,
						"get_user_music_stats_top_album_plural" => $config->get_user_music_stats_top_album_plural,
						"get_user_music_stats_top_artist_plural" => $config->get_user_music_stats_top_artist_plural,
						"get_user_music_stats_spent_title" => $config->get_user_music_stats_spent_title,
						"get_user_music_stats_spent_subtitle" => $config->get_user_music_stats_spent_subtitle,
						"get_user_music_stats_oldest_album_title" => $config->get_user_music_stats_oldest_album_title,
						"get_user_music_stats_oldest_album_subtitle" => $config->get_user_music_stats_oldest_album_subtitle,
						"get_year_stats_title" => $config->get_year_stats_title,
						"get_year_stats_subtitle" => $config->get_year_stats_subtitle,
						"get_year_stats_subsubtitle" => $config->get_year_stats_subsubtitle,
						"get_year_stats_movies" => $config->get_year_stats_movies,
						"get_year_stats_movies_title" => $config->get_year_stats_movies_title,
						"get_year_stats_movies_duration_title" => $config->get_year_stats_movies_duration_title,
						"get_year_stats_shows" => $config->get_year_stats_shows,
						"get_year_stats_shows_title" => $config->get_year_stats_shows_title,
						"get_year_stats_shows_duration_title" => $config->get_year_stats_shows_duration_title,
						"get_year_stats_music" => $config->get_year_stats_music,
						"get_year_stats_music_title" => $config->get_year_stats_music_title,
						"get_year_stats_music_duration_title" => $config->get_year_stats_music_duration_title,
						"get_year_stats_leaderboard" => $config->get_year_stats_leaderboard,
						"get_year_stats_leaderboard_title" => $config->get_year_stats_leaderboard_title,
						"get_year_stats_duration_sum_title" => $config->get_year_stats_duration_sum_title,
						"stats_intro" => $config->stats_intro,
						"stats_outro" => $config->stats_outro,
						"create_share_links" => $config->create_share_links,
						"wrapperr_and" => $config->wrapperr_and,
						"wrapperr_play" => $config->wrapperr_play,
						"wrapperr_play_plural" => $config->wrapperr_play_plural,
						"wrapperr_day" => $config->wrapperr_day,
						"wrapperr_day_plural" => $config->wrapperr_day_plural,
						"wrapperr_hour" => $config->wrapperr_hour,
						"wrapperr_hour_plural" => $config->wrapperr_hour_plural,
						"wrapperr_minute" => $config->wrapperr_minute,
						"wrapperr_minute_plural" => $config->wrapperr_minute_plural,
						"wrapperr_second" => $config->wrapperr_second,
						"wrapperr_second_plural" => $config->wrapperr_second_plural,
						"wrapperr_sort_plays" => $config->wrapperr_sort_plays,
						"wrapperr_sort_duration" => $config->wrapperr_sort_duration
						);

// Encode JSON and print it
echo json_encode($functions_json);
exit(0);
?>