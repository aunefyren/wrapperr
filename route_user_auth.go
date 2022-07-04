package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
)

func ApiGetLoginURL(w http.ResponseWriter, r *http.Request) {

	config_bool, err := GetConfigState()

	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve confguration state."), 500)
		return

	} else if !config_bool {

		log.Println("Wrapperr is not configured.")
		respond_default_error(w, r, errors.New("Wrapperr is not configured."), 400)
		return

	}

	config, err := GetConfig()
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to load Wrapperr confguration."), 500)
		return
	}

	if !config.PlexAuth {
		log.Println("Plex Auth is not enabled in the Wrapperr configuration.")
		respond_default_error(w, r, errors.New("Plex Auth is not enabled in the Wrapperr configuration."), 400)
		return
	}

	// Read payload from Post input
	reqBody, _ := ioutil.ReadAll(r.Body)
	var homeurl_payload GetLoginURL
	json.Unmarshal(reqBody, &homeurl_payload)

	// Confirm username length
	if homeurl_payload.HomeURL == "" {
		log.Println("Cannot retrieve Plex Auth login URL. Invalid HomeURL recieved.")
		respond_default_error(w, r, errors.New("HomeURL specified is invalid."), 400)
		return
	}

	plex_pin, err := GetPin(config.ClientKey, config.WrapperrVersion)
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve Plex Auth pin."), 500)
		return
	}

	if plex_pin.ID == 0 || plex_pin.Code == "" {
		log.Println("Plex Auth response invalid. No ID and/or Code.")
		respond_default_error(w, r, errors.New("Plex Auth response invalid."), 500)
		return
	}

	login_url := GetLoginURLString(config.ClientKey, plex_pin.Code, homeurl_payload.HomeURL)

	url_reply := GetLoginURLReply{
		Message: "Plex Auth login URL retrieved.",
		Error:   false,
		URL:     login_url,
		Code:    plex_pin.Code,
		ID:      plex_pin.ID,
	}

	ip_string := GetOriginIPString(w, r)

	log.Println("Created and retrieved Plex Auth login URL." + ip_string)
	fmt.Println("Created and retrieved Plex Auth login URL." + ip_string)

	respondWithJSON(w, http.StatusOK, url_reply)
	return

}

func ApiLoginPlexAuth(w http.ResponseWriter, r *http.Request) {

	config_bool, err := GetConfigState()

	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve configuration state."), 500)
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

	// Read payload from Post input
	reqBody, _ := ioutil.ReadAll(r.Body)
	var payload LoginPlexAuth
	json.Unmarshal(reqBody, &payload)

	// Confirm username length
	if payload.ID == 0 || payload.Code == "" {
		log.Println("Cannot retrieve Plex Auth login state. Invalid ID or Code recieved.")
		respond_default_error(w, r, errors.New("Login ID and/or Code is invalid."), 400)
		return
	}

	plex_auth, err := GetPlexAuthLogin(payload.ID, payload.Code, config.WrapperrVersion, config.ClientKey)
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve Plex Auth pin."), 500)
		return
	}

	if plex_auth.AuthToken == "" {
		log.Println("Plex Auth response invalid. No Authtoken recieved.")
		respond_default_error(w, r, errors.New("Plex Auth response invalid."), 400)
		return
	}

	token, err := CreateToken("Plex Auth", false, plex_auth.AuthToken)
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Faield to create JWT token."), 500)
		return
	}

	string_reply := StringReply{
		Message: "Login cookie created",
		Error:   false,
		Data:    token,
	}

	ip_string := GetOriginIPString(w, r)

	log.Println("Created and retrieved Plex Auth login JWT Token." + ip_string)

	fmt.Println("Created and retrieved Plex Auth login JWT Token." + ip_string)

	respondWithJSON(w, http.StatusOK, string_reply)
	return

}

// API route which validates an admin JWT token
func ApiValidatePlexAuth(w http.ResponseWriter, r *http.Request) {

	payload, err := AuthorizeToken(w, r)

	if err != nil {
		log.Println("Failed to parse login token. Error: ")
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to parse login token."), 500)
		return
	} else if payload.Admin {
		log.Println("Recieved JWT token is for admin use.")
		respond_default_error(w, r, errors.New("Recieved JWT token is for admin use."), 401)
		return
	}

	config, err := GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: ")
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to load Wrapperr configuration."), 500)
		return
	}

	if !config.PlexAuth {
		log.Println("Plex Auth is not enabled in the Wrapperr configuration.")
		respond_default_error(w, r, errors.New("Plex Auth is not enabled in the Wrapperr configuration."), 400)
		return
	}

	_, err = PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
	if err != nil {
		log.Println("Could not validate Plex Auth login. Error: ")
		log.Println(err)
		respond_default_error(w, r, errors.New("Could not validate Plex Auth login."), 500)
		return
	}

	log.Println("Plex Auth JWT Token validated using Plex API.")

	respond_default_okay(w, r, "Plex Auth validated.")
	return

}

// Create shareable link using Plex Auth
func ApiCreateShareLink(w http.ResponseWriter, r *http.Request) {

	config_bool, err := GetConfigState()

	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve configuration state."), 500)
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
		log.Panicln("Shareable links are not enabled in the Wrapperr configuration.")
		respond_default_error(w, r, errors.New("Shareable links are not enabled in the Wrapperr configuration."), 400)
		return
	}

	// Try to authorize bearer token from header
	payload, err := AuthorizeToken(w, r)

	var user_name string
	var user_id int

	if err != nil || payload.Admin {
		log.Println(err)
		log.Println(payload.Admin)
		respond_default_error(w, r, errors.New("Failed to authorize request."), 401)
		return
	} else {
		plex_object, err := PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
		if err != nil {
			log.Println(err)
			respond_default_error(w, r, errors.New("Could not validate Plex Auth login."), 500)
			return
		}

		user_name = plex_object.Username
		user_id = plex_object.ID
	}

	// Read payload from Post input
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to parse link payload."), 500)
		return
	}
	var link_payload WrapperrShareLinkCreateRequest
	json.Unmarshal(reqBody, &link_payload)

	currentTime := time.Now()
	hash_value := uuid.New().String()

	link_object := WrapperrShareLink{
		Content:         link_payload,
		UserID:          user_id,
		Hash:            hash_value,
		Date:            currentTime.Format("2006-01-02"),
		WrapperrVersion: config.WrapperrVersion,
		Expired:         false,
	}

	err = SaveLink(&link_object)
	if err != nil {
		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to save new link."), 500)
		return
	}

	string_reply := StringReply{
		Message: "Saved Wrapperr link.",
		Error:   false,
		Data:    strconv.Itoa(user_id) + "-" + hash_value,
	}

	ip_string := GetOriginIPString(w, r)

	log.Println("Saved new Wrapperr share link for " + user_name + " (" + strconv.Itoa(user_id) + ")." + ip_string)

	respondWithJSON(w, http.StatusOK, string_reply)
	return

}

// Get users shareable link
func ApiGetUserShareLink(w http.ResponseWriter, r *http.Request) {

	config_bool, err := GetConfigState()

	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve configuration state."), 500)
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

	// Try to authorize bearer token from header
	payload, err := AuthorizeToken(w, r)

	var user_name string
	var user_id int

	if err != nil {
		log.Println(err)
		log.Println(payload.Admin)
		respond_default_error(w, r, errors.New("Failed to authorize request."), 500)
		return
	} else if payload.Admin {
		log.Println("Admin tried to retrieve share links.")
		respond_default_error(w, r, errors.New("Admin cannot retrieve share links."), 401)
		return
	} else {
		plex_object, err := PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
		if err != nil {
			log.Println(err)
			respond_default_error(w, r, errors.New("Could not validate Plex Auth login."), 500)
			return
		}

		user_name = plex_object.Username
		user_id = plex_object.ID
	}

	share_link_object, err := GetLink(strconv.Itoa(user_id))
	if err != nil {

		string_reply := StringReply{
			Message: "No Wrapperr links found for user.",
			Error:   true,
			Data:    "",
		}

		ip_string := GetOriginIPString(w, r)

		log.Println("No Wrapperr links found for " + user_name + " (" + strconv.Itoa(user_id) + ")." + ip_string)

		respondWithJSON(w, http.StatusOK, string_reply)
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

	if !linkTime.Before(currentTime) {

		string_reply := StringReply{
			Message: "Retrieved Wrapperr link created by user.",
			Error:   false,
			Data:    strconv.Itoa(user_id) + "-" + share_link_object.Hash,
		}

		ip_string := GetOriginIPString(w, r)

		log.Println("Retrieved Wrapperr link created by " + user_name + " (" + strconv.Itoa(user_id) + ")." + ip_string)

		respondWithJSON(w, http.StatusOK, string_reply)
		return

	} else {

		string_reply := StringReply{
			Message: "No Wrapperr links found for user.",
			Error:   true,
			Data:    "",
		}

		ip_string := GetOriginIPString(w, r)

		log.Println("No Wrapperr links found for " + user_name + " (" + strconv.Itoa(user_id) + ")." + ip_string)

		respondWithJSON(w, http.StatusOK, string_reply)
		return
	}

}

// Delete users shareable link
func ApiDeleteUserShareLink(w http.ResponseWriter, r *http.Request) {

	config_bool, err := GetConfigState()

	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve configuration state."), 500)
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

	// Try to authorize bearer token from header
	payload, err := AuthorizeToken(w, r)

	var user_name string
	var user_id int

	if err != nil || payload.Admin {
		log.Println(err)
		log.Println(payload.Admin)
		respond_default_error(w, r, errors.New("Failed to authorize request."), 401)
		return
	} else {
		plex_object, err := PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
		if err != nil {
			log.Println(err)
			respond_default_error(w, r, errors.New("Could not validate Plex Auth login."), 500)
			return
		}

		user_name = plex_object.Username
		user_id = plex_object.ID
	}

	share_link_object, err := GetLink(strconv.Itoa(user_id))
	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to retrieve any saved Wrapperr link."), 500)
		return

	}

	share_link_object.Date = "1970-01-01"

	err = SaveLink(share_link_object)
	if err != nil {

		log.Println(err)
		respond_default_error(w, r, errors.New("Failed to overwrite saved Wrapperr link."), 500)
		return

	}

	log.Println("Deleted Wrapperr link for user " + user_name + " (" + strconv.Itoa(user_id) + ").")

	respond_default_okay(w, r, "Deleted Wrapperr link.")
	return

}
