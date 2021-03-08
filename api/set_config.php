<?php
$path = "../config/config.json";
$path2 = "../config/cache.json";
$data = json_decode(file_get_contents("php://input"));
$config = json_decode(file_get_contents($path));

if(!empty($data)) {
    $config_data = $data->data;
} else {
    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
}
$password = htmlspecialchars($data->password);

if(empty($config->password)) {
    save_config();
    exit(0);
}

if(password_verify($password, $config->password)) {
    save_config();
    exit(0);
} else {
    echo json_encode(array("error" => true, "message" => "Password not accepted.", "password" => true));
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
?>