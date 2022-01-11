<?php
class Admin {

    // Object properties
    // Admin path
    private $path;

    // Admin user
    public $password;
    public $username;

    // Encryption variables
    const METHOD = 'aes-256-ctr';
    public $token_encrypter;

    // Constructor
    public function __construct(){

        // Declare admin path
        $this->path = dirname(__FILE__, 3) . '/config/admin.json';

        // Check if config file exists, if not, create it
        if(!file_exists($this->path)) {
            $create_admin = fopen($this->path, "w");
            if(!$create_admin) {
                echo json_encode(array("message" => "Failed to create admin.json. Is the 'config' directory writable?", "error" => true));
                exit();
            }
            fclose($create_admin);
        }

        // Parse JSON from config
        $json = json_decode(file_get_contents($this->path));

        if(!empty($json)) {
            
            // Assign values from config file
            $this->password = $json->password;
            $this->username = $json->username;
            $this->token_encrypter = $json->token_encrypter;

        }

    }

    public function get_login_admin_cookie($username, $password) {
        if(!password_verify($password, $this->password) || $username !== $this->username) {
            return false;
        }

        $nonceSize = openssl_cipher_iv_length(self::METHOD);
        $nonce = openssl_random_pseudo_bytes($nonceSize);

        // Get the current date
        $now = new DateTime('NOW');

        $object = json_encode(array("username" => $this->username, "password" => $this->password, "date" => $now->format('Y-m-d')));

        $token = openssl_encrypt(
            $object,
            self::METHOD,
            $this->token_encrypter,
            OPENSSL_RAW_DATA,
            $nonce
        );

        return base64_encode($nonce.$token);
    }

    public function is_configured() {
        if(!empty(file_get_contents($this->path)) && !empty($this->username) && !empty($this->password)) {
            return true;
        }
        return false;
    }

    public function create_admin($username, $password) {
        
        // Hash the new password if changed
        $hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Save new username if it has changed
        if($username === "") {
            echo json_encode(array("message" => "Username not valid", "error" => true));
            exit();
        }

        $this->username = $username;
        $this->password = $hash;

        if($this->save_admin()) {
            return true;
        } else {
            return false;
        }
    }

    public function save_admin() {

        $this->token_encrypter = md5(rand(0,1000));

        $save = json_encode(array("username" => $this->username, "password" => $this->password, "token_encrypter" => $this->token_encrypter));
        if(file_put_contents($this->path, $save)) {
            return true;
        }

        return false;
    }

    // Validate Plex Token
    function decrypt_cookie($cookie) {

        try {

            // Debase cookie
            $cookie_debased = base64_decode($cookie, true);
            if ($cookie_debased === false) {
                throw new Exception('Encryption failure. Cookie invalid.');
            }

            // Assign variables
            $nonceSize = openssl_cipher_iv_length(self::METHOD);
            $nonce = mb_substr($cookie_debased, 0, $nonceSize, '8bit');
            $ciphertext = mb_substr($cookie_debased, $nonceSize, null, '8bit');
            
            // Decrypt cookie
            $cookie_data = openssl_decrypt(
                $ciphertext,
                self::METHOD,
                $this->token_encrypter,
                OPENSSL_RAW_DATA,
                $nonce
            );
    
            // Decode the JSON response
            $cookie_result = json_decode($cookie_data, true);
            
            // Return Plex token
            return json_encode(array("message" => 'Login accepted.', "error" => false, "data" => $cookie_result));
    
    
        // Catch errors
        } catch (Exception $e) {
            echo json_encode(array("message" => $e->getMessage(), "error" => true, "data" => array()));
            exit(0);
        }
    }

    function validate_cookie($cookie_object) {

        // Validate admin variables
        if(!$cookie_object || empty($cookie_object) || !isset($cookie_object->data->username) || !isset($cookie_object->data->password) || !isset($cookie_object->data->date)) {
            return false;
        }

        $now = new DateTime('NOW');
        $then = date_create_from_format('Y-m-d', $cookie_object->data->date);
        $diff = (array) date_diff($now, $then);

        if($diff['days'] > 2) {
            return false;
        }
        
        return true;
    }
}
?>