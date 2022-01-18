<?php
class Auth {

    // Object properties
    private $client_id;
    private $token_encrypter;
    private $strong = true;
    private $header = 'application/json';
    private $application_url;
    private $x_plex_product = 'Wrapperr';
    const METHOD = 'aes-256-ctr';

    // Constructor
    public function __construct(){
        
        // Get variables from config file
        require_once(dirname(__FILE__) . '/config.php');
        $config_file = new Config();
        $this->client_id = $config_file->client_id;
        $this->token_encrypter = $config_file->token_encrypter;
        $this->application_url = $config_file->application_url;
    
    }

    // Get pin from Plex
    function get_pin() {
    
        // Create URL
        $url = 'https://plex.tv/api/v2/pins';
    
        // Attempt to call Plex Auth
        try {
    
            //  Initiate curl
            $ch = curl_init();
    
            // Set the options for curl
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
            // Add payload
            $payload = array(   "strong"=> $this->strong, 
                                "X-Plex-Product" => $this->x_plex_product,
                                "X-Plex-Client-Identifier" => $this->client_id,
                                "X-Plex-Version" => "2.0",
                                "X-Plex-Model" => "Plex OAuth",
                                "X-Plex-Language" => 'en'
                            );

            $headers = [
                "Accept: $this->header"
            ];
            
            if($this->application_url !== '') {
                array_push($headers, "Host: $this->application_url");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            }

            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    
            // Add headers
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
            // Execute curl
            $result = curl_exec($ch);
    
            // Check if an error occurred
            if(curl_errno($ch)) {
                throw new Exception('Plex Auth did not respond.');
            }
    
            // Closing curl
            curl_close($ch);
            
            // Decode the JSON response
            return $result;
    
    
        // Catch errors
        } catch (Exception $e) {
            
            // Log error
            require_once(dirname(__FILE__) . '/log.php');
            $log = new Log();
	        $log->log_activity('auth.php', 'unknown', 'Error: ' . $e->getMessage());

            echo json_encode(array("message" => $e->getMessage(), "error" => true, "data" => array()));
            exit(0);
        }
    }

    // Create URL for Plex login window
    function get_login_url($code, $id, $home_url) {

        $base = 'https://app.plex.tv/auth#?';
        $forwardUrl = $home_url . '?close_me=true';
        
        return $base . 'clientID=' . urlencode($this->client_id) . '&code=' . urlencode($code) . '&context%5Bdevice%5D%5Bproduct%5D=' . urlencode($this->x_plex_product) . '&forwardUrl=' . urlencode($forwardUrl);
    
    }

    // Check if pin has been accepted
    function get_cookie($id, $code) {
    
        // Create URL
        $url = 'https://plex.tv/api/v2/pins/' . $id;
    
        // Attempt to call Plex Auth
        try {
    
            //  Initiate curl
            $ch = curl_init();
    
            // Set the options for curl
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
            // Add payload
            $payload = array(
                                "code"=> $code,
                                "X-Plex-Client-Identifier" => $this->client_id,
                                "X-Plex-Version" => "2.0",
                                "X-Plex-Model" => "Plex OAuth",
                                "X-Plex-Language" => 'en'
                            );
            
            $headers = [
                "Accept: $this->header"
            ];

            if($this->application_url !== '') {
                array_push($headers, "Host: $this->application_url");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            }

            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET"); 
    
            // Add headers
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
            // Execute curl
            $result = curl_exec($ch);
    
            // Check if an error occurred
            if(curl_errno($ch)) {
                throw new Exception('Plex Auth did not respond.');
            }
    
            // Closing curl
            curl_close($ch);
    
            // Decode the JSON response
            $pin_object = json_decode($result, true);

            if(!isset($pin_object['authToken']) || $pin_object['authToken'] === '') {

                throw new Exception('Plex Auth didn\'t confirm login.');
        
            } else {

                $nonceSize = openssl_cipher_iv_length(self::METHOD);
                $nonce = openssl_random_pseudo_bytes($nonceSize);

                $token = openssl_encrypt(
                    $pin_object['authToken'],
                    self::METHOD,
                    $this->token_encrypter,
                    OPENSSL_RAW_DATA,
                    $nonce
                );
        
                return base64_encode($nonce.$token);
        
            }
    
    
        // Catch errors
        } catch (Exception $e) {

            // Log error
            require_once(dirname(__FILE__) . '/log.php');
            $log = new Log();
	        $log->log_activity('auth.php', 'unknown', 'Error: ' . $e->getMessage());

            echo json_encode(array("message" => $e->getMessage(), "error" => true, "data" => array()));
            exit(0);

        }
    }

    // Validate Plex Token
    function validate_token($token) {
        
        // Attempt to call Plex Auth
        try {

            // Create URL
            $url = 'https://plex.tv/api/v2/user';

            // Debase token-cookie
            $token_debased = base64_decode($token, true);
            if ($token_debased === false) {
                throw new Exception('Encryption failure. Failed to decrypt login cookie.');
            }

            // Assign variables
            $nonceSize = openssl_cipher_iv_length(self::METHOD);
            $nonce = mb_substr($token_debased, 0, $nonceSize, '8bit');
            $ciphertext = mb_substr($token_debased, $nonceSize, null, '8bit');
            
            // Decrypt token-cookie
            $x_plex_token = openssl_decrypt(
                $ciphertext,
                self::METHOD,
                $this->token_encrypter,
                OPENSSL_RAW_DATA,
                $nonce
            );

            //  Initiate curl
            $ch = curl_init();
    
            // Set the options for curl
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
            // Add payload
            $payload = array(   
                                "X-Plex-Token"=> $x_plex_token,
                                "X-Plex-Client-Identifier" => $this->client_id,
                                "X-Plex-Product" => $this->x_plex_product,
                                "X-Plex-Version" => "2.0",
                                "X-Plex-Model" => "Plex OAuth",
                                "X-Plex-Language" => 'en'
                            );

            $headers = [
                "Accept: " . $this->header
            ];
                            
            if($this->application_url !== '') {
                array_push($headers, "Host: " . $this->application_url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            }
            
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET"); 
    
            // Add headers
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
            // Execute curl
            $result = curl_exec($ch);
    
            // Check if an error occurred
            if(curl_errno($ch)) {
                throw new Exception('Plex Auth did not respond.');
            }
    
            // Closing curl
            curl_close($ch);
    
            // Decode the JSON response
            $token_result = json_decode($result, true);
            
            // Return Plex token
            return json_encode(array("message" => 'Login accepted.', "error" => false, "data" => $token_result));
    
    
        // Catch errors
        } catch (Exception $e) {

            // Log error
            require_once(dirname(__FILE__) . '/log.php');
            $log = new Log();
	        $log->log_activity('auth.php', 'unknown', 'Error: ' . $e->getMessage());

            echo json_encode(array("message" => $e->getMessage(), "error" => true, "data" => array()));
            exit(0);

        }
    }

}