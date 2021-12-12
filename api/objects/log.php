<?php
class Log {

    // Object properties
    // Log path
    private $path;

    // Log enabled
    public $use_logs;

    // Constructor
    public function __construct(){

        // Delcare log path
        $this->path = dirname(__FILE__, 3) . '/config/wrapped.log';

        // Check if log file exists, if not, create it
        if(!file_exists($this->path)) {
            @$create_log = fopen($this->path, "w");
            if(!$create_log) {
                echo json_encode(array("message" => "Failed to create wrapped.log. Is the 'config' directory writable?", "error" => true));
                exit();
            }
            fwrite($create_log, 'Plex Wrapped');
            fclose($create_log);
        }

        // Assign use_logs configuration from config
        include_once(dirname(__FILE__, 3) . '/api/objects/config.php');
        $config = new Config();
        $this->use_logs = $config->use_logs;
    }

    public function log_activity($function, $id, $message) {
        
        if($this->use_logs) {
            try {
                $date = date('Y-m-d H:i:s');

                $log_file = @fopen($this->path, 'a');
                fwrite($log_file, PHP_EOL . $date . ' - ' . $function . ' - ID: ' . $id . ' - ' . $message);
                fclose($log_file);

            } catch(Error $e) {
                http_response_code(500);
                echo json_encode(array("error" => True, "message" => "Failed to log event."));
                exit();
            }
        
        }
    
        return True;
    }
}
?>