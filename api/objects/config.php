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
    public $ssl;

    // Admin user
    public $password;
    public $username;

    // Plex-Wrapped config
    public $plex_wrapped_version = 'v2.1.0';
    public $timezone;
    public $use_cache;
    public $use_logs;
    public $client_id;
    public $plex_wrapped_root;
    public $token_encrypter;

    // Plex Wrapped custom
    public $wrapped_start;
    public $wrapped_end;
    public $stats_intro;
    public $create_share_links;
    public $get_user_movie_stats;
    public $get_user_show_stats;
    public $get_user_show_buddy;
    public $get_user_music_stats;
    public $get_year_stats_movies;
    public $get_year_stats_shows;
    public $get_year_stats_music;
    public $get_year_stats_leaderboard;
    
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

        if(!empty($json)) {
            
            // Assign values from config file
            $this->tautulli_apikey = $json->tautulli_apikey;
            $this->tautulli_ip = $json->tautulli_ip;
            $this->tautulli_port = $json->tautulli_port;
            $this->tautulli_length = $json->tautulli_length;
            $this->tautulli_root = $json->tautulli_root;
            $this->tautulli_libraries = $json->tautulli_libraries;
            $this->ssl = $json->ssl;
            $this->password = $json->password;
            $this->username = $json->username;
            $this->timezone = $json->timezone;
            $this->use_cache = $json->use_cache;
            $this->use_logs = $json->use_logs;
            $this->client_id = $json->client_id;
            $this->token_encrypter = $json->token_encrypter;
            $this->plex_wrapped_root = $json->plex_wrapped_root;
            $this->wrapped_start = $json->wrapped_start;
            $this->wrapped_end = $json->wrapped_end;
            $this->stats_intro = $json->stats_intro;
            $this->create_share_links = $json->create_share_links;
            $this->get_user_movie_stats = $json->get_user_movie_stats;
            $this->get_user_show_stats = $json->get_user_show_stats;
            $this->get_user_show_buddy = $json->get_user_show_buddy;
            $this->get_user_music_stats = $json->get_user_music_stats;
            $this->get_year_stats_movies = $json->get_year_stats_movies;
            $this->get_year_stats_shows = $json->get_year_stats_shows;
            $this->get_year_stats_music = $json->get_year_stats_music;
            $this->get_year_stats_leaderboard = $json->get_year_stats_leaderboard;
            
            if($this->plex_wrapped_version !== $json->plex_wrapped_version) {
                if(!$this->delete_config()) {
                    echo json_encode(array(
                                            "message" => "Plex Wrapped configuration is made with version: " . $json->plex_wrapped_version . ", but you are using: " . $this->plex_wrapped_version . ". Delete config.json and re-configure Plex Wrapped again.",
                                            "error" => true));
                    exit();
                }
            }
        }

        // If token encrypter is not set, generate one
        if($this->token_encrypter == '') {
            $this->token_encrypter = md5(rand(0,1000));
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

    public function verify_wrapped_admin($username, $password) {
        return password_verify($password, $this->password) && $username == $this->username;
    }

    public function is_configured() {
        return !empty(file_get_contents($this->path));
    }

    public function save_config($data, $clear_cache) {

        // If clear cache is enabled, clear the cache
        if($clear_cache) {
            include_once dirname(__FILE__, 3) . '/api/objects/cache.php';
            $cache = new Cache();

            if(!$cache->clear_cache()) {
                echo json_encode(array("message" => "Failed to clear the cache. Is the 'config' directory writable?", "error" => true));
                exit();
            }
        }
        
        // Hash the new password if changed
        if($data->password !== "") {
            $hash = password_hash($data->password, PASSWORD_DEFAULT);
            $this->password = $hash;
        } 

        // Save new username if it has changed
        if($data->username !== "") {
            $this->username = $data->username;
        } 
        
        // Assign new variables from recieved config
        $this->tautulli_apikey = $data->tautulli_apikey;
        $this->tautulli_ip = $data->tautulli_ip;
        $this->tautulli_port = $data->tautulli_port;
        $this->tautulli_length = $data->tautulli_length;
        $this->tautulli_root = $data->tautulli_root;
        $this->tautulli_libraries = $data->tautulli_libraries;
        $this->ssl = $data->ssl;
        $this->timezone = $data->timezone;
        $this->use_cache = $data->use_cache;
        $this->use_logs = $data->use_logs;
        $this->client_id = $data->client_id;
        $this->plex_wrapped_root = $data->plex_wrapped_root;
        $this->wrapped_start = $data->wrapped_start;
        $this->wrapped_end = $data->wrapped_end;
        $this->stats_intro = $data->stats_intro;
        $this->create_share_links = $data->create_share_links;
        $this->get_user_movie_stats = $data->get_user_movie_stats;
        $this->get_user_show_stats = $data->get_user_show_stats;
        $this->get_user_show_buddy = $data->get_user_show_buddy;
        $this->get_user_music_stats = $data->get_user_music_stats;
        $this->get_year_stats_movies = $data->get_year_stats_movies;
        $this->get_year_stats_shows = $data->get_year_stats_shows;
        $this->get_year_stats_music = $data->get_year_stats_music;
        $this->get_year_stats_leaderboard = $data->get_year_stats_leaderboard;

        // Generate new random client ID if empty
        if($this->client_id === "") {
            $this->client_id = md5(rand(0,1000));
        }

        // If token encrypter is not set, generate one
        if($this->token_encrypter == '') {
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