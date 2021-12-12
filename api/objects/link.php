<?php
class Link {

    // Object properties
    // Cache path
    private $path;

    // Constructor
    public function __construct(){
        
        // Delcare cache path
        $this->path = dirname(__FILE__, 3) . '/config/links/';

        // Create link folder
        if (!file_exists($this->path)) {
            mkdir($this->path, 0777, true);
        }

    }

    public function save_link($content, $id) {
        
        $save = json_encode($content);
        if(file_put_contents($this->path . $id . '.json', $save)) {
            return true;
        }

        return false;
    }

    public function open_link($id) {

        // Check if link exists
        if (!file_exists($this->path . $id . '.json')) {
            return false;
        }
        
        // Try to read link
        if($content = file_get_contents($this->path . $id . '.json')) {
            return $content;
        }

        return false;
    }

    public function delete_link($id) {

        // Check if link exists
        if (!file_exists($this->path . $id . '.json')) {
            return false;
        }
        
        if (!unlink($this->path . $id . '.json')) { 
            return false;
        } 
        else { 
            return true;
        }

        return false;
    }

}