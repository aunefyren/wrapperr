package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"
)

// API route which retrieves the Wrapperr version and some minor details (application name, Plex-Auth...).
func ApiGetWrapperrVersion(w http.ResponseWriter, r *http.Request) {

	configured_bool, err := GetConfigState()

	if err != nil {

		log.Println("Failed to retrieve configuration state. Error: ")
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve configuration state."), 500)
		return

	}

	config, err := GetConfig()
	if err != nil {
		log.Println("Failed to load configuration file. Error: ")
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve configuration state."), 500)
		return
	}

	version_reply := WrapperrVersion{
		WrapperrVersion:           config.WrapperrVersion,
		ApplicationName:           config.ApplicationName,
		PlexAuth:                  config.PlexAuth,
		WrapperrFrontPageTitle:    config.WrapperrCustomize.WrapperrFrontPageTitle,
		WrapperrFrontPageSubtitle: config.WrapperrCustomize.WrapperrFrontPageSubtitle,
		ClientKey:                 config.ClientKey,
		WrapperrConfigured:        configured_bool,
		WinterTheme:               config.WinterTheme,
		Message:                   "Retrieved Wrapperr version.",
		Error:                     false,
	}

	ip_string := GetOriginIPString(w, r)

	log.Println("Retrieved Wrapperr version." + ip_string)

	respondWithJSON(w, http.StatusOK, version_reply)
	return

}

// API route which returns if whether or not a Wrapperr admin is configured.
func ApiGetAdminState(w http.ResponseWriter, r *http.Request) {

	admin, err := GetAdminState()
	if err != nil {
		log.Println(err)
		log.Println("Failed to load admin state.")
		return
	}

	boolean_reply := BooleanReply{
		Message: "Retrieved Wrapperr version.",
		Error:   false,
		Data:    admin,
	}

	ip_string := GetOriginIPString(w, r)

	log.Println("Retrieved Wrapperr admin state." + ip_string)

	respondWithJSON(w, http.StatusOK, boolean_reply)
	return

}

// API route which retrieves the Wrapperr settings needed for the front-end.
func ApiGetFunctions(w http.ResponseWriter, r *http.Request) {

	config, err := GetConfig()
	if err != nil {
		log.Println(err)
		log.Println("Failed to load configuration file.")
		fmt.Println("Failed to load configuration file.")
		return
	}

	function_reply := WrapperrFunctions{
		WrapperrVersion:   config.WrapperrVersion,
		PlexAuth:          config.PlexAuth,
		WrapperrCustomize: config.WrapperrCustomize,
		CreateShareLinks:  config.CreateShareLinks,
	}

	ip_string := GetOriginIPString(w, r)

	log.Println("Retrieved Wrapperr functions." + ip_string)

	respondWithJSON(w, http.StatusOK, function_reply)
	return

}

// API route used to create the admin account and claim the Wrapperr server
func ApiCreateAdmin(w http.ResponseWriter, r *http.Request) {

	admin, err := GetAdminState()
	if err != nil {
		log.Println(err)
		log.Println("Failed to load admin state.")
		fmt.Println("Failed to load admin state.")
		return
	}

	if admin {
		log.Println("Admin creation failed. Admin already configured.")
		respond_default_error(w, r, errors.New("Admin already configured."), 401)
		return
	} else {

		// Read payload from Post input
		reqBody, _ := ioutil.ReadAll(r.Body)
		var admin_payload AdminConfig
		json.Unmarshal(reqBody, &admin_payload)

		// Confirm username length
		if len(admin_payload.AdminUsername) < 4 {
			log.Println("Admin creation failed. Admin username requires four or more characters.")
			respond_default_error(w, r, errors.New("Admin username is too short. Four characters or more required."), 500)
			return
		}

		// Confirm password length
		if len(admin_payload.AdminPassword) < 8 {
			log.Println("Admin creation failed. Admin password requires eight or more characters.")
			respond_default_error(w, r, errors.New("Admin password is too short. Eight characters or more required."), 500)
			return
		}

		// Hash new password
		hash, err := hashAndSalt(admin_payload.AdminPassword)
		if err != nil {
			errors.New("Admin creation failed. Could not hash new password. Error: ")
			log.Println(err)
			respond_default_error(w, r, errors.New("Failed to hash your password."), 500)
			return
		}
		admin_payload.AdminPassword = hash

		// Save new admin config
		err = SaveAdminConfig(admin_payload)
		if err != nil {
			errors.New("Admin creation failed. Could not save configuration. Error: ")
			log.Println(err)
			respond_default_error(w, r, errors.New("Failed to save new admin."), 500)
			return
		}

		log.Println("New admin account created. Server is now claimed.")
		fmt.Println("New admin account created. Server is now claimed.")

		respond_default_okay(w, r, "Admin created.")
		return

	}
}

// API route which returns if whether or not Wrapperr is configured.
func ApiWrapperrConfigured(w http.ResponseWriter, r *http.Request) {

	bool, err := GetConfigState()

	if err != nil {

		log.Panicln(err)
		respond_default_error(w, r, errors.New("Failed to retrieve confguration state."), 500)
		return

	} else {

		boolean_reply := BooleanReply{
			Message: "Retrieved Wrapperr configuration state.",
			Error:   false,
			Data:    bool,
		}

		ip_string := GetOriginIPString(w, r)

		log.Println("Retrieved Wrapperr configuration state." + ip_string)

		respondWithJSON(w, http.StatusOK, boolean_reply)
		return

	}

}

// API route which trades admin login credentials for an admin JWT session token. Valid for three days.
func ApiLogInAdmin(w http.ResponseWriter, r *http.Request) {

	admin, err := GetAdminState()
	if err != nil {
		log.Println(err)
		log.Println("Failed to load admin state.")
		fmt.Println("Failed to load admin state.")
		return
	}

	if !admin {
		log.Println("Admin login failed. Admin is not configured.")
		respond_default_error(w, r, errors.New("No admin configured."), 400)
		return
	} else {

		admin_config, err := GetAdminConfig()
		if err != nil {
			log.Println(err)
			log.Println("Failed to load admin config.")
			fmt.Println("Failed to load admin config.")
			return
		}

		// Read payload from Post input
		reqBody, _ := ioutil.ReadAll(r.Body)
		var admin_payload AdminConfig
		json.Unmarshal(reqBody, &admin_payload)

		// Confirm username length
		if len(admin_payload.AdminUsername) < 4 {
			log.Println("Admin creation failed. Admin username requires four or more characters.")
			respond_default_error(w, r, errors.New("Admin username is too short. Four characters or more required."), 500)
			return
		}

		// Confirm password length
		if len(admin_payload.AdminPassword) < 8 {
			log.Println("Admin creation failed. Admin password requires eight or more characters.")
			respond_default_error(w, r, errors.New("Admin password is too short. Eight characters or more required."), 500)
			return
		}

		// Hash new password
		password_validity := comparePasswords(admin_config.AdminPassword, admin_payload.AdminPassword)

		// Validate admin username and password
		if !password_validity || admin_config.AdminUsername != admin_payload.AdminUsername {
			ip_string := GetOriginIPString(w, r)
			log.Println("Admin login failed. Incorrect admin username or password." + ip_string)
			fmt.Println("Admin login failed. Incorrect admin username or password." + ip_string)
			respond_default_error(w, r, errors.New("Login failed. Username or password is incorrect."), 401)
			return
		}

		token, err := CreateToken(admin_config.AdminUsername, true, "")
		if err != nil {
			log.Println(err)
			respond_default_error(w, r, errors.New("Failed to create JWT token."), 500)
			return
		}

		string_reply := StringReply{
			Message: "Login cookie created",
			Error:   false,
			Data:    token,
		}

		ip_string := GetOriginIPString(w, r)

		log.Println("Created and retrieved admin login JWT Token." + ip_string)

		fmt.Println("Created and retrieved admin login JWT Token." + ip_string)

		respondWithJSON(w, http.StatusOK, string_reply)
		return

	}

}

// APi route which trades admin login credentials for an admin JWT session token. Valid for three days.
func ApiGetTautulliConncection(w http.ResponseWriter, r *http.Request) {

	// Read payload from Post input
	reqBody, _ := ioutil.ReadAll(r.Body)
	var tautulli_connection TautulliConfig
	json.Unmarshal(reqBody, &tautulli_connection)

	if tautulli_connection.TautulliApiKey == "" || tautulli_connection.TautulliIP == "" || tautulli_connection.TautulliPort == 0 {
		log.Println("Cannot test Tautulli connection. Invalid Tautulli connection details recieved.")
		respond_default_error(w, r, errors.New("Tautulli connection details specified are invalid."), 400)
		return
	}

	tautulli_state, err := TautulliTestConnection(tautulli_connection.TautulliPort, tautulli_connection.TautulliIP, tautulli_connection.TautulliHttps, tautulli_connection.TautulliRoot, tautulli_connection.TautulliApiKey)
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to reach Tautulli server."), 500)
		return
	}

	boolean_reply := BooleanReply{
		Message: "Tested Tautulli connection.",
		Error:   false,
		Data:    tautulli_state,
	}

	ip_string := GetOriginIPString(w, r)

	log.Println("Tested Tautulli connection." + ip_string)

	respondWithJSON(w, http.StatusOK, boolean_reply)
	return

}

// Get shareable link
func ApiGetShareLink(w http.ResponseWriter, r *http.Request) {

	config_bool, err := GetConfigState()

	if err != nil {

		log.Println("Failed to retrieve configuration state. Error: ")
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve configuration state"), 500)
		return

	} else if !config_bool {

		log.Println("Wrapperr is not configured.")
		respond_default_error(w, r, errors.New("Wrapperr is not configured."), 400)
		return

	}

	config, err := GetConfig()
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to load Wrapperr configuration."), 500)
		return
	}

	if !config.PlexAuth {
		log.Println("Plex Auth is not enabled in the Wrapperr configuration.")
		respond_default_error(w, r, errors.New("Plex Auth is not enabled in the Wrapperr configuration."), 400)
		return
	}

	if !config.CreateShareLinks {
		log.Println("Shareable links are not enabled in the Wrapperr configuration.")
		respond_default_error(w, r, errors.New("Shareable links are not enabled in the Wrapperr configuration."), 400)
		return
	}

	// Read payload from Post input
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to parse payload for request."), 500)
		return

	}
	var link_payload WrapperrShareLinkGetRequest
	json.Unmarshal(reqBody, &link_payload)

	hash_array := strings.Split(link_payload.Hash, "-")

	if len(hash_array) < 2 {

		log.Println("Failed to split hash string while looking for user ID.")
		respond_default_error(w, r, errors.New("Failed to parse payload hash for Wrapperr link."), 500)
		return

	}

	user_id := hash_array[0]
	hash := ""

	for j := 1; j < len(hash_array); j++ {
		if j != 1 {
			hash = hash + "-"
		}
		hash = hash + hash_array[j]
	}

	share_link_object, err := GetLink(user_id)
	if err != nil {

		log.Println(err)
		respond_default_error(w, r, err, 500)
		return

	}

	currentTime := time.Now()
	linkTime, err := time.Parse("2006-01-02", share_link_object.Date)
	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve saved Wrapperr link."), 500)
		return

	}

	linkTime = linkTime.Add(7 * 24 * time.Hour)

	if !linkTime.Before(currentTime) && share_link_object.Hash == hash {

		share_link_object.Message = "Shared link retrieved."
		share_link_object.Error = false

		ip_string := GetOriginIPString(w, r)

		log.Println("Retrieved Wrapperr share link made by User ID: " + user_id + "." + ip_string)

		respondWithJSON(w, http.StatusOK, share_link_object)
		return

	} else {

		return_error := errors.New("Invalid share link.")

		if linkTime.Before(currentTime) {

			share_link_object.Expired = true
			err = SaveLink(share_link_object)
			if err != nil {
				log.Println(err)
			}
			return_error = errors.New("This Wrapped link has expired.")

		}

		log.Println("Failed to retrieve Wrapperr share link with hash: " + link_payload.Hash + ".")
		respond_default_error(w, r, return_error, 401)
		return

	}

}
