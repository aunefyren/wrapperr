<?php
$path = "../config/config.json";
$path2 = "../config/cache.json";

$data = json_decode(file_get_contents("php://input"));

if(!file_exists($path)) {
	fopen($path, "w");
}	
$config = json_decode(file_get_contents($path));

if(!empty($data)) {
    $config_data = $data->data;
} else {
    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
}
$password = htmlspecialchars($data->password);
$username = htmlspecialchars($data->username);

if(empty($config->password)) {
    save_config();
    exit(0);
}

if(password_verify($password, $config->password) && $username == $config->username) {
	// Log API request if enabled
	if($config->use_logs) {
		if(!log_activity()) {
			echo json_encode(array("message" => "Failed to log event.", "error" => true));
			exit(0);
		}
	}
	
    save_config();
    exit(0);
} else {
    echo json_encode(array("error" => true, "message" => "Password and username combination not accepted.", "password" => true));
    exit(0);
}

function save_config() {
    global $data;
    global $config_data;
    global $config;
    global $path;
    global $path2;

    if(!empty($config_data->password)) {
        $hash = password_hash($config_data->password, PASSWORD_DEFAULT);
        $config_data->password = $hash;
    } else {
        $config_data->password = $config->password;
    }

    if(file_put_contents($path, json_encode($config_data))) {

        if($data->clear_cache) {
            file_put_contents($path2, "");
        }

        echo json_encode(array("error" => false, "message" => "Changes saved."));
        exit(0);

    } else {
        echo json_encode(array("error" => true, "message" => "Changes were not saved."));
        exit(0);
    }
}

function log_activity() {
	$date = date('Y-m-d H:i:s');
	
	$path = "../config/wrapped.log";
	if(!file_exists($path)) {
		$temp = fopen($path, "w");
		fwrite($temp, 'Plex Wrapped');
		fclose($temp);
	}	
	
	$log_file = fopen($path, 'a');
	fwrite($log_file, PHP_EOL . $date . ' - set_config.php');   
	
	if(fclose($log_file)) {
		return True;
	}
	
	return False;
}
?>