<?php
class Cache {

    // Object properties
    // Cache path
    private $path;

    // Constructor
    public function __construct(){

        // Delcare cache path
        $this->path = dirname(__FILE__, 3) . '/config/cache.json';

        // Check if cache file exists, if not, create it
        if(!file_exists($this->path)) {
            @$create_cache = fopen($this->path, "w");
            if(!$create_cache) {
                echo json_encode(array("message" => "Failed to create cache.json. Is the 'config' directory writable?", "error" => true));
                exit();
            }
            fclose($create_cache);
        }

    }

    public function clear_cache() {
        
        // Try to open cache
        @$cache = fopen($this->path, "w");

        if(!$cache) {
            return false;
        } else {
            fwrite($cache, "");
            fclose($cache);
            return true;
        }
    }

    public function check_cache() {
    
        $cache = json_decode(file_get_contents($this->path), True);
    
        if(!empty($cache)) {
            return $cache;
        }
    
        return false;
    }
    
    public function update_cache($result) {
        
        $save = json_encode($result);
        if(file_put_contents($this->path, $save)) {
            return true;
        }

        return false;
    }

}