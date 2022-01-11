<?php
class Config {

    // Object properties
    // Config path
    private $path;

    // Tautulli
    public $tautulli_apikey;
    public $tautulli_ip;
    public $tautulli_port;
    public $tautulli_length;
    public $tautulli_root;
    public $tautulli_libraries;
    public $https;

    // Wrapperr config
    public $wrapperr_version = 'v2.2.1';
    public $timezone;
    public $application_name;
    public $application_url;
    public $use_cache;
    public $use_logs;
    public $client_id;
    public $wrapperr_root;
    public $token_encrypter;
    public $create_share_links;

    // Wrapperr custom
    public $wrapped_start;
    public $wrapped_end;
    public $stats_intro;

    // Wrapperr custom movies
    public $get_user_movie_stats;
    public $get_user_movie_stats_title;
    public $get_user_movie_stats_subtitle;
    public $get_user_movie_stats_subsubtitle;
    public $get_user_movie_stats_subtitle_one;
    public $get_user_movie_stats_subsubtitle_one;
    public $get_user_movie_stats_subtitle_none;
    public $get_user_movie_stats_subsubtitle_none;
    public $get_user_movie_stats_top_movie;
    public $get_user_movie_stats_top_movie_plural;
    public $get_user_movie_stats_movie_completion_title;
    public $get_user_movie_stats_movie_completion_title_plural;
    public $get_user_movie_stats_movie_completion_subtitle;
    public $get_user_movie_stats_pause_title;
    public $get_user_movie_stats_pause_subtitle;
    public $get_user_movie_stats_pause_title_one;
    public $get_user_movie_stats_pause_subtitle_one;
    public $get_user_movie_stats_pause_title_none;
    public $get_user_movie_stats_pause_subtitle_none;
    public $get_user_movie_stats_oldest_title;
    public $get_user_movie_stats_oldest_subtitle;
    public $get_user_movie_stats_oldest_subtitle_pre_1950;
    public $get_user_movie_stats_oldest_subtitle_pre_1975;
    public $get_user_movie_stats_oldest_subtitle_pre_2000;
    public $get_user_movie_stats_spent_title;

    // Wrapperr custom shows
    public $get_user_show_stats;
    public $get_user_show_buddy;
    public $get_user_show_stats_title;
    public $get_user_show_stats_subtitle;
    public $get_user_show_stats_subsubtitle;
    public $get_user_show_stats_subtitle_one;
    public $get_user_show_stats_subsubtitle_one;
    public $get_user_show_stats_subtitle_none;
    public $get_user_show_stats_subsubtitle_none;
    public $get_user_show_stats_top_show;
    public $get_user_show_stats_top_show_plural;
    public $get_user_show_stats_spent_title;
    public $get_user_show_stats_most_played_title;
    public $get_user_show_stats_most_played_subtitle;
    public $get_user_show_stats_buddy_title;
    public $get_user_show_stats_buddy_subtitle;
    public $get_user_show_stats_buddy_title_none;
    public $get_user_show_stats_buddy_subtitle_none;

    // Wrapperr custom music
    public $get_user_music_stats;
    public $get_user_music_stats_title;
    public $get_user_music_stats_subtitle;
    public $get_user_music_stats_subsubtitle;
    public $get_user_music_stats_subtitle_one;
    public $get_user_music_stats_subsubtitle_one;
    public $get_user_music_stats_subtitle_none;
    public $get_user_music_stats_subsubtitle_none;
    public $get_user_music_stats_top_track;
    public $get_user_music_stats_top_track_plural;
    public $get_user_music_stats_top_album_plural;
    public $get_user_music_stats_top_artist_plural;
    public $get_user_music_stats_spent_title;
    public $get_user_music_stats_spent_subtitle;
    public $get_user_music_stats_oldest_album_title;
    public $get_user_music_stats_oldest_album_subtitle;

    // Wrapperr custom server-wide
    public $get_year_stats_title;
    public $get_year_stats_subtitle;
    public $get_year_stats_subsubtitle;
    public $get_year_stats_movies;
    public $get_year_stats_movies_title;
    public $get_year_stats_shows;
    public $get_year_stats_shows_title;
    public $get_year_stats_music;
    public $get_year_stats_music_title;
    public $get_year_stats_leaderboard;
    public $get_year_stats_leaderboard_title;
    public $get_year_stats_movies_duration_title;
    public $get_year_stats_shows_duration_title;
    public $get_year_stats_music_duration_title;
    public $get_year_stats_duration_sum_title;

    // Wrapperr language variables
    public $wrapperr_and;
    public $wrapperr_play;
    public $wrapperr_play_plural;
    public $wrapperr_day;
    public $wrapperr_day_plural;
    public $wrapperr_hour;
    public $wrapperr_hour_plural;
    public $wrapperr_minute;
    public $wrapperr_minute_plural;
    public $wrapperr_second;
    public $wrapperr_second_plural;
    public $wrapperr_sort_plays;
    public $wrapperr_sort_duration;
    
    // Constructor
    public function __construct(){
       
        // Declare config path
        $this->path = dirname(__FILE__, 3) . '/config/config.json';

        // Check if config file exists, if not, create it
        if(!file_exists($this->path)) {
            $create_config = fopen($this->path, "w");
            if(!$create_config) {
                echo json_encode(array("message" => "Failed to create config.json. Is the 'config' directory writable?", "error" => true));
                exit();
            }
            fclose($create_config);
        }

        // Parse JSON from config
        $json = json_decode(file_get_contents($this->path));

        // Assign values from config file
        if(isset($json->tautulli_apikey)) {
            $this->tautulli_apikey = $json->tautulli_apikey;
        } else {
            $this->tautulli_apikey = '';
        }
        
        if(isset($json->tautulli_ip)) {
            $this->tautulli_ip = $json->tautulli_ip;
        } else {
            $this->tautulli_ip = '';
        }

        if(isset($json->tautulli_port)) {
            $this->tautulli_port = $json->tautulli_port;
        } else {
            $this->tautulli_port = '';
        }
        
        if(isset($json->tautulli_length)) {
            $this->tautulli_length = $json->tautulli_length;
        } else {
            $this->tautulli_length = 5000;
        }
        
        if(isset($json->tautulli_root)) {
            $this->tautulli_root = $json->tautulli_root;
        } else {
            $this->tautulli_root = '';
        }
        
        if(isset($json->tautulli_libraries)) {
            $this->tautulli_libraries = $json->tautulli_libraries;
        } else {
            $this->tautulli_libraries = '';
        }
        
        if(isset($json->https)) {
            $this->https = $json->https;
        } else {
            $this->https = false;
        }
        
        if(isset($json->timezone)) {
            $this->timezone = $json->timezone;
        } else {
            $this->timezone = '';
        }
        
        if(isset($json->use_cache)) {
            $this->use_cache = $json->use_cache;
        } else {
            $this->use_cache = true;
        }
        
        if(isset($json->use_logs)) {
            $this->use_logs = $json->use_logs;
        } else {
            $this->use_logs = false;
        }

        if(isset($json->client_id) && $json->client_id !== '') {
            $this->client_id = $json->client_id;
        } else {
            $this->client_id = md5(rand(0,1000));
        }

        if(isset($json->token_encrypter) && $json->token_encrypter !== '') {
            $this->token_encrypter = $json->token_encrypter;
        } else {
            $this->token_encrypter = md5(rand(0,1000));
        }
        
        if(isset($json->wrapperr_root)) {
            $this->wrapperr_root = $json->wrapperr_root;
        } else {
            $this->wrapperr_root = '';
        }
        
        if(isset($json->application_name)) {
            $this->application_name = $json->application_name;
        } else {
            $this->application_name = 'Wrapperr';
        }

        if(isset($json->application_url)) {
            $this->application_url = $json->application_url;
        } else {
            $this->application_url = '';
        }
        
        if(isset($json->wrapped_start)) {
            $this->wrapped_start = $json->wrapped_start;
        } else {
            $this->wrapped_start = 1609455600;
        }
        
        if(isset($json->wrapped_end)) {
            $this->wrapped_end = $json->wrapped_end;
        } else {
            $this->wrapped_end = 1640991540;
        }
        
        if(isset($json->stats_intro)) {
            $this->stats_intro = $json->stats_intro;
        } else {
            $this->stats_intro = '<h1>Hey there, {user}!</h1><h2>New year, new page of statistics...</h2>';
        }

        if(isset($json->stats_outro)) {
            $this->stats_outro = $json->stats_outro;
        } else {
            $this->stats_outro = '<h1>Hope you are staying safe!</h1><h2>Goodbye.</h2>';
        }
        
        if(isset($json->create_share_links)) {
            $this->create_share_links = $json->create_share_links;
        } else {
            $this->create_share_links = false;
        }
        
        // Movie values
        if(isset($json->get_user_movie_stats)) {
            $this->get_user_movie_stats = $json->get_user_movie_stats;
        } else {
            $this->get_user_movie_stats = false;
        }

        // Title
        if(isset($json->get_user_movie_stats_title)) {
            $this->get_user_movie_stats_title = $json->get_user_movie_stats_title;
        } else {
            $this->get_user_movie_stats_title = 'Movies!';
        }

        // Multiple movies subtitle
        if(isset($json->get_user_movie_stats_subtitle)) {
            $this->get_user_movie_stats_subtitle = $json->get_user_movie_stats_subtitle;
        } else {
            $this->get_user_movie_stats_subtitle = 'You watched {movie_count} movies. That\'s a lot of movies!';
        }

        // Multiple movies sub-subtitle
        if(isset($json->get_user_movie_stats_subsubtitle)) {
            $this->get_user_movie_stats_subsubtitle = $json->get_user_movie_stats_subsubtitle;
        } else {
            $this->get_user_movie_stats_subsubtitle = '(or not, I am pre-programmed to say that)';
        }

        // One movie subtitle
        if(isset($json->get_user_movie_stats_subtitle_one)) {
            $this->get_user_movie_stats_subtitle_one = $json->get_user_movie_stats_subtitle_one;
        } else {
            $this->get_user_movie_stats_subtitle_one = 'You watched one movie. You know what you like!';
        }

        // One movie sub-subtitle
        if(isset($json->get_user_movie_stats_subsubtitle_one)) {
            $this->get_user_movie_stats_subsubtitle_one = $json->get_user_movie_stats_subsubtitle_one;
        } else {
            $this->get_user_movie_stats_subsubtitle_one = '(at least you tried it out)';
        }

        // No movies subtitle
        if(isset($json->get_user_movie_stats_subtitle_none)) {
            $this->get_user_movie_stats_subtitle_none = $json->get_user_movie_stats_subtitle_none;
        } else {
            $this->get_user_movie_stats_subtitle_none = 'You watched no movies. That\'s impressive in itself!';
        }

        // No movies sub-subtitle
        if(isset($json->get_user_movie_stats_subsubtitle_none)) {
            $this->get_user_movie_stats_subsubtitle_none = $json->get_user_movie_stats_subsubtitle_none;
        } else {
            $this->get_user_movie_stats_subsubtitle_none = '(might wanna try it)';
        }

        // Top movie title
        if(isset($json->get_user_movie_stats_top_movie)) {
            $this->get_user_movie_stats_top_movie = $json->get_user_movie_stats_top_movie;
        } else {
            $this->get_user_movie_stats_top_movie = 'Your movie';
        }

        // Top movies title
        if(isset($json->get_user_movie_stats_top_movie_plural)) {
            $this->get_user_movie_stats_top_movie_plural = $json->get_user_movie_stats_top_movie_plural;
        } else {
            $this->get_user_movie_stats_top_movie_plural = 'Your top movies';
        }

        // Movie completion title
        if(isset($json->get_user_movie_stats_movie_completion_title)) {
            $this->get_user_movie_stats_movie_completion_title = $json->get_user_movie_stats_movie_completion_title;
        } else {
            $this->get_user_movie_stats_movie_completion_title = 'You saw {movie_finish_percent}% of the movie!';
        }

        // Movie completion title plural
        if(isset($json->get_user_movie_stats_movie_completion_title_plural)) {
            $this->get_user_movie_stats_movie_completion_title_plural = $json->get_user_movie_stats_movie_completion_title_plural;
        } else {
            $this->get_user_movie_stats_movie_completion_title_plural = 'Your average movie finishing percentage was {movie_finish_percent}%!';
        }

        // Movie completion subtitle
        if(isset($json->get_user_movie_stats_movie_completion_subtitle)) {
            $this->get_user_movie_stats_movie_completion_subtitle = $json->get_user_movie_stats_movie_completion_subtitle;
        } else {
            $this->get_user_movie_stats_movie_completion_subtitle = 'You\'re not watching the credits like a nerd, are you?';
        }

        // Movie pause title
        if(isset($json->get_user_movie_stats_pause_title)) {
            $this->get_user_movie_stats_pause_title = $json->get_user_movie_stats_pause_title;
        } else {
            $this->get_user_movie_stats_pause_title = 'Your longest movie pause was watching {movie_title}.';
        }

        // Movie pause subtitle
        if(isset($json->get_user_movie_stats_pause_subtitle)) {
            $this->get_user_movie_stats_pause_subtitle = $json->get_user_movie_stats_pause_subtitle;
        } else {
            $this->get_user_movie_stats_pause_subtitle = 'It was paused for {pause_duration}...';
        }

        // Movie pause title (one movie)
        if(isset($json->get_user_movie_stats_pause_title_one)) {
            $this->get_user_movie_stats_pause_title_one = $json->get_user_movie_stats_pause_title_one;
        } else {
            $this->get_user_movie_stats_pause_title_one = 'One movie, but you still had to pause it.';
        }

        // Movie pause subtitle (one movie)
        if(isset($json->get_user_movie_stats_pause_subtitle_one)) {
            $this->get_user_movie_stats_pause_subtitle_one = $json->get_user_movie_stats_pause_subtitle_one;
        } else {
            $this->get_user_movie_stats_pause_subtitle_one = 'It was paused for {pause_duration}...';
        }

        // Movie pause title (no pausing)
        if(isset($json->get_user_movie_stats_pause_title_none)) {
            $this->get_user_movie_stats_pause_title_none = $json->get_user_movie_stats_pause_title_none;
        } else {
            $this->get_user_movie_stats_pause_title_none = 'Bladder of steel!';
        }

        // Movie pause subtitle (no pausing)
        if(isset($json->get_user_movie_stats_pause_subtitle_none)) {
            $this->get_user_movie_stats_pause_subtitle_none = $json->get_user_movie_stats_pause_subtitle_none;
        } else {
            $this->get_user_movie_stats_pause_subtitle_none = 'You never paused a single movie.';
        }

        // Movie oldest title
        if(isset($json->get_user_movie_stats_oldest_title)) {
            $this->get_user_movie_stats_oldest_title = $json->get_user_movie_stats_oldest_title;
        } else {
            $this->get_user_movie_stats_oldest_title = 'The oldest movie you watched was {movie_title}.';
        }

        // Movie oldest subtitle
        if(isset($json->get_user_movie_stats_oldest_subtitle)) {
            $this->get_user_movie_stats_oldest_subtitle = $json->get_user_movie_stats_oldest_subtitle;
        } else {
            $this->get_user_movie_stats_oldest_subtitle = 'Enjoying the classics, huh?';
        }

        // Movie oldest (from before 1950) subtitle
        if(isset($json->get_user_movie_stats_oldest_subtitle_pre_1950)) {
            $this->get_user_movie_stats_oldest_subtitle_pre_1950 = $json->get_user_movie_stats_oldest_subtitle_pre_1950;
        } else {
            $this->get_user_movie_stats_oldest_subtitle_pre_1950 = 'I didn\'t even know they made movies back then...';
        }

        // Movie oldest (from before 1975) subtitle
        if(isset($json->get_user_movie_stats_oldest_subtitle_pre_1975)) {
            $this->get_user_movie_stats_oldest_subtitle_pre_1975 = $json->get_user_movie_stats_oldest_subtitle_pre_1975;
        } else {
            $this->get_user_movie_stats_oldest_subtitle_pre_1975 = 'Did it even have color?';
        }

        // Movie oldest (from before 2000) subtitle
        if(isset($json->get_user_movie_stats_oldest_subtitle_pre_2000)) {
            $this->get_user_movie_stats_oldest_subtitle_pre_2000 = $json->get_user_movie_stats_oldest_subtitle_pre_2000;
        } else {
            $this->get_user_movie_stats_oldest_subtitle_pre_2000 = 'Was it a 4K, UHD, 3D, Dolby Atmos remaster?';
        }
        
        // Movie spent title
        if(isset($json->get_user_movie_stats_spent_title)) {
            $this->get_user_movie_stats_spent_title = $json->get_user_movie_stats_spent_title;
        } else {
            $this->get_user_movie_stats_spent_title = 'You spent {movie_sum_duration} watching movies.';
        }
        
        // Show values
        if(isset($json->get_user_show_stats)) {
            $this->get_user_show_stats = $json->get_user_show_stats;
        } else {
            $this->get_user_show_stats = false;
        }
        
        // Get show-buddy
        if(isset($json->get_user_show_stats_buddy)) {
            $this->get_user_show_stats_buddy = $json->get_user_show_stats_buddy;
        } else {
            $this->get_user_show_stats_buddy = false;
        }

        // Show title
        if(isset($json->get_user_show_stats_title)) {
            $this->get_user_show_stats_title = $json->get_user_show_stats_title;
        } else {
            $this->get_user_show_stats_title = 'Shows!';
        }

        // Multiple shows subtitle
        if(isset($json->get_user_show_stats_subtitle)) {
            $this->get_user_show_stats_subtitle = $json->get_user_show_stats_subtitle;
        } else {
            $this->get_user_show_stats_subtitle = 'You watched {show_count} different shows.';
        }

        // Multiple shows sub-subtitle
        if(isset($json->get_user_show_stats_subsubtitle)) {
            $this->get_user_show_stats_subsubtitle = $json->get_user_show_stats_subsubtitle;
        } else {
            $this->get_user_show_stats_subsubtitle = '(no, watching The Office twice doesn\'t count as two shows)';
        }

        // One show subtitle
        if(isset($json->get_user_show_stats_subtitle_one)) {
            $this->get_user_show_stats_subtitle_one = $json->get_user_show_stats_subtitle_one;
        } else {
            $this->get_user_show_stats_subtitle_one = 'You watched one show.';
        }

        // One show sub-subtitle
        if(isset($json->get_user_show_stats_subsubtitle_one)) {
            $this->get_user_show_stats_subsubtitle_one = $json->get_user_show_stats_subsubtitle_one;
        } else {
            $this->get_user_show_stats_subsubtitle_one = '(better not be that same one again...)';
        }

        // No shows subtitle
        if(isset($json->get_user_show_stats_subtitle_none)) {
            $this->get_user_show_stats_subtitle_none = $json->get_user_show_stats_subtitle_none;
        } else {
            $this->get_user_show_stats_subtitle_none = 'You watched 0 shows. I get it, it\'s not for everyone!';
        }

        // No shows sub-subtitle
        if(isset($json->get_user_show_stats_subsubtitle_none)) {
            $this->get_user_show_stats_subsubtitle_none = $json->get_user_show_stats_subsubtitle_none;
        } else {
            $this->get_user_show_stats_subsubtitle_none = '(might wanna try it)';
        }

        // Top show title
        if(isset($json->get_user_show_stats_top_show)) {
            $this->get_user_show_stats_top_show = $json->get_user_show_stats_top_show;
        } else {
            $this->get_user_show_stats_top_show = 'Your show';
        }

        // Top shows title
        if(isset($json->get_user_show_stats_top_show_plural)) {
            $this->get_user_show_stats_top_show_plural = $json->get_user_show_stats_top_show_plural;
        } else {
            $this->get_user_show_stats_top_show_plural = 'Your top shows';
        }

        // Time spent on shows
        if(isset($json->get_user_show_stats_spent_title)) {
            $this->get_user_show_stats_spent_title = $json->get_user_show_stats_spent_title;
        } else {
            $this->get_user_show_stats_spent_title = 'You spent {show_sum_duration} watching shows.';
        }

        // Top episode title
        if(isset($json->get_user_show_stats_most_played_title)) {
            $this->get_user_show_stats_most_played_title = $json->get_user_show_stats_most_played_title;
        } else {
            $this->get_user_show_stats_most_played_title = 'You really liked the episode {show_episode} from {show_title}.';
        }

        // Top episode subtitle
        if(isset($json->get_user_show_stats_most_played_subtitle)) {
            $this->get_user_show_stats_most_played_subtitle = $json->get_user_show_stats_most_played_subtitle;
        } else {
            $this->get_user_show_stats_most_played_subtitle = 'It recieved {episode_play_sum} and was endured for {episode_duration_sum}.';
        }

        // Show buddy title
        if(isset($json->get_user_show_stats_buddy_title)) {
            $this->get_user_show_stats_buddy_title = $json->get_user_show_stats_buddy_title;
        } else {
            $this->get_user_show_stats_buddy_title = 'Your top show was {top_show_title}. And you\'re not alone! Your {top_show_title}-buddy is {buddy_username}!';
        }

        // Show buddy subtitle
        if(isset($json->get_user_show_stats_buddy_subtitle)) {
            $this->get_user_show_stats_buddy_subtitle = $json->get_user_show_stats_buddy_subtitle;
        } else {
            $this->get_user_show_stats_buddy_subtitle = 'Your combined efforts resulted in {buddy_duration_sum} of {top_show_title}!';
        }

        // No show buddy title
        if(isset($json->get_user_show_stats_buddy_title_none)) {
            $this->get_user_show_stats_buddy_title_none = $json->get_user_show_stats_buddy_title_none;
        } else {
            $this->get_user_show_stats_buddy_title_none = 'Your top show was {top_show_title}.';
        }

        // No show buddy subtitle
        if(isset($json->get_user_show_stats_buddy_subtitle_none)) {
            $this->get_user_show_stats_buddy_subtitle_none = $json->get_user_show_stats_buddy_subtitle_none;
        } else {
            $this->get_user_show_stats_buddy_subtitle_none = 'That means you dared to explore where no one else would, as you are the only viewer of that show. Spread the word!';
        }
        
        // Music values
        if(isset($json->get_user_music_stats)) {
            $this->get_user_music_stats = $json->get_user_music_stats;
        } else {
            $this->get_user_music_stats = false;
        }

        // Title
        if(isset($json->get_user_music_stats_title)) {
            $this->get_user_music_stats_title = $json->get_user_music_stats_title;
        } else {
            $this->get_user_music_stats_title = 'Music!';
        }

        // Multiple tracks subtitle
        if(isset($json->get_user_music_stats_subtitle)) {
            $this->get_user_music_stats_subtitle = $json->get_user_music_stats_subtitle;
        } else {
            $this->get_user_music_stats_subtitle = 'You listened to {track_count} different tracks.';
        }

        // Multiple tracks sub-subtitle
        if(isset($json->get_user_music_stats_subsubtitle)) {
            $this->get_user_music_stats_subsubtitle = $json->get_user_music_stats_subsubtitle;
        } else {
            $this->get_user_music_stats_subsubtitle = '(if you can call your taste "music"...)';
        }

        // One track subtitle
        if(isset($json->get_user_music_stats_subtitle_one)) {
            $this->get_user_music_stats_subtitle_one = $json->get_user_music_stats_subtitle_one;
        } else {
            $this->get_user_music_stats_subtitle_one = 'You listened to one track.';
        }

        // One track sub-subtitle
        if(isset($json->get_user_music_stats_subsubtitle_one)) {
            $this->get_user_music_stats_subsubtitle_one = $json->get_user_music_stats_subsubtitle_one;
        } else {
            $this->get_user_music_stats_subsubtitle_one = '(whatever floats your boat...)';
        }

        // No tracks subtitle
        if(isset($json->get_user_music_stats_subtitle_none)) {
            $this->get_user_music_stats_subtitle_none = $json->get_user_music_stats_subtitle_none;
        } else {
            $this->get_user_music_stats_subtitle_none = 'You listened to 0 tracks. No speakers, huh?';
        }

        // No tracks sub-subtitle
        if(isset($json->get_user_music_stats_subsubtitle_none)) {
            $this->get_user_music_stats_subsubtitle_none = $json->get_user_music_stats_subsubtitle_none;
        } else {
            $this->get_user_music_stats_subsubtitle_none = '(might wanna try it)';
        }

        // Top track title
        if(isset($json->get_user_music_stats_top_track)) {
            $this->get_user_music_stats_top_track = $json->get_user_music_stats_top_track;
        } else {
            $this->get_user_music_stats_top_track = 'Your track';
        }

        // Top tracks title
        if(isset($json->get_user_music_stats_top_track_plural)) {
            $this->get_user_music_stats_top_track_plural = $json->get_user_music_stats_top_track_plural;
        } else {
            $this->get_user_music_stats_top_track_plural = 'Your top tracks';
        }

        // Top albums title
        if(isset($json->get_user_music_stats_top_album_plural)) {
            $this->get_user_music_stats_top_album_plural = $json->get_user_music_stats_top_album_plural;
        } else {
            $this->get_user_music_stats_top_album_plural = 'Your top albums';
        }

        // Top artists title
        if(isset($json->get_user_music_stats_top_artist_plural)) {
            $this->get_user_music_stats_top_artist_plural = $json->get_user_music_stats_top_artist_plural;
        } else {
            $this->get_user_music_stats_top_artist_plural = 'Your top artists';
        }

        // Time spent on music title
        if(isset($json->get_user_music_stats_spent_title)) {
            $this->get_user_music_stats_spent_title = $json->get_user_music_stats_spent_title;
        } else {
            $this->get_user_music_stats_spent_title = 'You spent {music_sum_duration} listening to music.';
        }

        // Time spent on music subtitle
        if(isset($json->get_user_music_stats_spent_subtitle)) {
            $this->get_user_music_stats_spent_subtitle = $json->get_user_music_stats_spent_subtitle;
        } else {
            $this->get_user_music_stats_spent_subtitle = 'That is {music_sum_minutes}!';
        }

        // Oldest album title
        if(isset($json->get_user_music_stats_oldest_album_title)) {
            $this->get_user_music_stats_oldest_album_title = $json->get_user_music_stats_oldest_album_title;
        } else {
            $this->get_user_music_stats_oldest_album_title = 'The oldest album you listened to was {album_title} by {album_artist}.';
        }

        // Oldest album subtitle
        if(isset($json->get_user_music_stats_oldest_album_subtitle)) {
            $this->get_user_music_stats_oldest_album_subtitle = $json->get_user_music_stats_oldest_album_subtitle;
        } else {
            $this->get_user_music_stats_oldest_album_subtitle = 'How about a copy on vinyl?';
        }
        
        // Year stats title
        if(isset($json->get_year_stats_title)) {
            $this->get_year_stats_title = $json->get_year_stats_title;
        } else {
            $this->get_year_stats_title = 'Server-wide statistics!';
        }

        // Year stats subtitle
        if(isset($json->get_year_stats_subtitle)) {
            $this->get_year_stats_subtitle = $json->get_year_stats_subtitle;
        } else {
            $this->get_year_stats_subtitle = 'It\'s okay to feel shame if you see yourself on the list.';
        }

        // Server-wide stats subsubtitle
        if(isset($json->get_year_stats_subsubtitle)) {
            $this->get_year_stats_subsubtitle = $json->get_year_stats_subsubtitle;
        } else {
            $this->get_year_stats_subsubtitle = '(or if you don\'t...)';
        }

        // Get movie stats for server
        if(isset($json->get_year_stats_movies)) {
            $this->get_year_stats_movies = $json->get_year_stats_movies;
        } else {
            $this->get_year_stats_movies = false;
        }

        // Top movie stats for server title
        if(isset($json->get_year_stats_movies_title)) {
            $this->get_year_stats_movies_title = $json->get_year_stats_movies_title;
        } else {
            $this->get_year_stats_movies_title = 'Top movies';
        }

        // Movie stats duration sum for server title
        if(isset($json->get_year_stats_movies_duration_title)) {
            $this->get_year_stats_movies_duration_title = $json->get_year_stats_movies_duration_title;
        } else {
            $this->get_year_stats_movies_duration_title = 'All users combined spent {movie_duration_sum} watching movies.';
        }
        
        if(isset($json->get_year_stats_shows)) {
            $this->get_year_stats_shows = $json->get_year_stats_shows;
        } else {
            $this->get_year_stats_shows = false;
        }

        // Top shows stats for server title
        if(isset($json->get_year_stats_shows_title)) {
            $this->get_year_stats_shows_title = $json->get_year_stats_shows_title;
        } else {
            $this->get_year_stats_shows_title = 'Top shows';
        }

        // Shows stats duration sum for server title
        if(isset($json->get_year_stats_shows_duration_title)) {
            $this->get_year_stats_shows_duration_title = $json->get_year_stats_shows_duration_title;
        } else {
            $this->get_year_stats_shows_duration_title = 'All users combined spent {show_duration_sum} watching shows.';
        }
        
        if(isset($json->get_year_stats_music)) {
            $this->get_year_stats_music = $json->get_year_stats_music;
        } else {
            $this->get_year_stats_music = false;
        }

        // Top shows stats for server title
        if(isset($json->get_year_stats_music_title)) {
            $this->get_year_stats_music_title = $json->get_year_stats_music_title;
        } else {
            $this->get_year_stats_music_title = 'Top artists';
        }

        // Shows stats duration sum for server title
        if(isset($json->get_year_stats_music_duration_title)) {
            $this->get_year_stats_music_duration_title = $json->get_year_stats_music_duration_title;
        } else {
            $this->get_year_stats_music_duration_title = 'All users combined spent {music_duration_sum} listening to music.';
        }
        
        if(isset($json->get_year_stats_leaderboard)) {
            $this->get_year_stats_leaderboard = $json->get_year_stats_leaderboard;
        } else {
            $this->get_year_stats_leaderboard = false;
        }

        // Top users for server title
        if(isset($json->get_year_stats_leaderboard_title)) {
            $this->get_year_stats_leaderboard_title = $json->get_year_stats_leaderboard_title;
        } else {
            $this->get_year_stats_leaderboard_title = 'Top users';
        }

        // Sum of duration for server title
        if(isset($json->get_year_stats_duration_sum_title)) {
            $this->get_year_stats_duration_sum_title = $json->get_year_stats_duration_sum_title;
        } else {
            $this->get_year_stats_duration_sum_title = 'That is {all_duration_sum} of content!';
        }

        // Language settings
        if(isset($json->wrapperr_and)) {
            $this->wrapperr_and = $json->wrapperr_and;
        } else {
            $this->wrapperr_and = 'and';
        }

        if(isset($json->wrapperr_play)) {
            $this->wrapperr_play = $json->wrapperr_play;
        } else {
            $this->wrapperr_play = 'play';
        }

        if(isset($json->wrapperr_play_plural)) {
            $this->wrapperr_play_plural = $json->wrapperr_play_plural;
        } else {
            $this->wrapperr_play_plural = 'plays';
        }

        if(isset($json->wrapperr_day)) {
            $this->wrapperr_day = $json->wrapperr_day;
        } else {
            $this->wrapperr_day = 'day';
        }

        if(isset($json->wrapperr_day_plural)) {
            $this->wrapperr_day_plural = $json->wrapperr_day_plural;
        } else {
            $this->wrapperr_day_plural = 'days';
        }

        if(isset($json->wrapperr_hour)) {
            $this->wrapperr_hour = $json->wrapperr_hour;
        } else {
            $this->wrapperr_hour = 'hour';
        }

        if(isset($json->wrapperr_hour_plural)) {
            $this->wrapperr_hour_plural = $json->wrapperr_hour_plural;
        } else {
            $this->wrapperr_hour_plural = 'hours';
        }

        if(isset($json->wrapperr_minute)) {
            $this->wrapperr_minute = $json->wrapperr_minute;
        } else {
            $this->wrapperr_minute = 'minute';
        }

        if(isset($json->wrapperr_minute_plural)) {
            $this->wrapperr_minute_plural = $json->wrapperr_minute_plural;
        } else {
            $this->wrapperr_minute_plural = 'minutes';
        }

        if(isset($json->wrapperr_second)) {
            $this->wrapperr_second = $json->wrapperr_second;
        } else {
            $this->wrapperr_second = 'second';
        }

        if(isset($json->wrapperr_second_plural)) {
            $this->wrapperr_second_plural = $json->wrapperr_second_plural;
        } else {
            $this->wrapperr_second_plural = 'seconds';
        }

        if(isset($json->wrapperr_sort_plays)) {
            $this->wrapperr_sort_plays = $json->wrapperr_sort_plays;
        } else {
            $this->wrapperr_sort_plays = 'Sort by plays';
        }

        if(isset($json->wrapperr_sort_duration)) {
            $this->wrapperr_sort_duration = $json->wrapperr_sort_duration;
        } else {
            $this->wrapperr_sort_duration = 'Sort by duration';
        }

    }

    public function delete_config() {

        // Check if config exists
        if (!file_exists($this->path)) {
            return false;
        }
        
        if (!unlink($this->path)) { 
            return false;
        } 
        else { 
            return true;
        }

        return false;
    }

    public function is_configured() {
        // Make sure an admin is created
        require_once(dirname(__FILE__) . '/admin.php');
        $admin = new Admin();
        if(!$admin->is_configured()) {
            return false;
        }
        
        if($this->tautulli_ip !== '' && $this->tautulli_apikey !== '' && $this->tautulli_length !== '' && $this->timezone !== '' && $this->wrapped_start !== '' && $this->wrapped_end !== '')
            return true;
        else {
            return false;
        }
    }

    public function save_config($clear_cache) {

        // If clear cache is enabled, clear the cache
        if($clear_cache) {
            include_once dirname(__FILE__, 3) . '/api/objects/cache.php';
            $cache = new Cache();

            if(!$cache->clear_cache()) {
                echo json_encode(array("message" => "Failed to clear the cache. Is the 'config' directory writable?", "error" => true));
                exit();
            }
        }

        // Generate new random client ID if empty
        if($this->client_id === '') {
            $this->client_id = md5(rand(0,1000));
        }

        // If token encrypter is not set, generate one
        if($this->token_encrypter === '') {
            $this->token_encrypter = md5(rand(0,1000));
        }

        // Save new variables to file
        if(file_put_contents($this->path, json_encode($this))) {
            return true;
        } else {
            return false;
        }
        
    }


}
?>