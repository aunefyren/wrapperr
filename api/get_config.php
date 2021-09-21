<?php
$data = json_decode(file_get_contents("php://input"));

$path = "../config/config.json";
if(!file_exists($path)) {
	fopen($path, "w");
}	
$config = json_decode(file_get_contents($path));

if(empty($data)) {
    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
}

if(empty($config->password)) {
    echo json_encode(array("error" => false, "message" => "No password set.", "password" => false, "data" => array()));
    exit(0);
}

$password = htmlspecialchars($data->password);

if(password_verify($password, $config->password)) {
	
	// Log API request if enabled
	if($config->use_logs) {
		if(!log_activity()) {
			echo json_encode(array("message" => "Failed to log event.", "error" => true));
			exit(0);
		}
	}
	
    echo json_encode(array("error" => false, "message" => "Login successful.", "password" => true, "data" => $config));
    exit(0);
} else {
    echo json_encode(array("error" => true, "message" => "Password not accepted.", "password" => true, "data" => array()));
    exit(0);
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
	fwrite($log_file, PHP_EOL . $date . ' - get_config.php');   
	
	if(fclose($log_file)) {
		return True;
	}
	
	return False;
}
?>