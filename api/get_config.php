<?php
$data = json_decode(file_get_contents("php://input"));
$config = json_decode(file_get_contents("../config/config.json"));

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
    echo json_encode(array("error" => false, "message" => "Login successful.", "password" => true, "data" => $config));
    exit(0);
} else {
    echo json_encode(array("error" => true, "message" => "Password not accepted.", "password" => true, "data" => array()));
    exit(0);
}
?>