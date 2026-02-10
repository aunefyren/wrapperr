package routes

import (
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/aunefyren/wrapperr/files"
	"github.com/aunefyren/wrapperr/models"
	"github.com/aunefyren/wrapperr/modules"
	"github.com/aunefyren/wrapperr/utilities"

	"github.com/gin-gonic/gin"
)

// API route which retrieves the Wrapperr version and some minor details (application name, Plex-Auth...).
func ApiGetWrapperrVersion(context *gin.Context) {
	configBool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	}

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr configuration."})
		context.Abort()
		return
	}

	versionReply := models.WrapperrVersion{
		WrapperrVersion:              config.WrapperrVersion,
		ApplicationName:              config.ApplicationName,
		PlexAuth:                     config.PlexAuth,
		WrapperrFrontPageTitle:       config.WrapperrCustomize.WrapperrFrontPageTitle,
		WrapperrFrontPageSubtitle:    config.WrapperrCustomize.WrapperrFrontPageSubtitle,
		WrapperrFrontPageSearchTitle: config.WrapperrCustomize.WrapperrFrontPageSearchTitle,
		ClientKey:                    config.ClientKey,
		WrapperrConfigured:           configBool,
		WinterTheme:                  config.WinterTheme,
		Message:                      "Retrieved Wrapperr version.",
		Error:                        false,
		WrapperrRoot:                 config.WrapperrRoot,
		BasicAuth:                    config.BasicAuth,
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Retrieved Wrapperr version." + ipString)

	context.JSON(http.StatusOK, versionReply)
	return
}

// API route which returns if whether or not a Wrapperr admin is configured.
func ApiGetAdminState(context *gin.Context) {
	admin, err := files.GetAdminState()
	if err != nil {
		log.Println("Failed to load admin state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load admin state."})
		context.Abort()
		return
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Retrieved Wrapperr admin state." + ipString)

	context.JSON(http.StatusOK, gin.H{"message": "Retrieved Wrapperr version.", "error": false, "data": admin})
	return
}

// API route which retrieves the Wrapperr settings needed for the front-end.
func ApiGetFunctions(context *gin.Context) {
	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr configuration."})
		context.Abort()
		return
	}

	functionReply := models.WrapperrFunctions{
		WrapperrVersion:   config.WrapperrVersion,
		PlexAuth:          config.PlexAuth,
		WrapperrCustomize: config.WrapperrCustomize,
		CreateShareLinks:  config.CreateShareLinks,
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Retrieved Wrapperr functions." + ipString)

	context.JSON(http.StatusOK, gin.H{"message": "Functions retrieved.", "data": functionReply})
	return
}

// API route used to create the admin account and claim the Wrapperr server
func ApiCreateAdmin(context *gin.Context) {
	admin, err := files.GetAdminState()
	if err != nil {
		log.Println("Failed to load admin state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load admin state."})
		context.Abort()
		return
	}

	if admin {
		log.Println("Admin creation failed. Admin already configured.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Admin already configured."})
		context.Abort()
		return
	} else {
		// Read payload from Post input
		var admin_payload models.AdminConfig
		if err := context.ShouldBindJSON(&admin_payload); err != nil {
			log.Println("Failed to parse request. Error: " + err.Error())
			context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
			context.Abort()
			return
		}

		// Confirm username length
		if len(admin_payload.AdminUsername) < 4 {
			context.JSON(http.StatusBadRequest, gin.H{"error": "Admin username is too short. Four characters or more required."})
			context.Abort()
			return
		}

		// Confirm password length
		if len(admin_payload.AdminPassword) < 8 {
			context.JSON(http.StatusBadRequest, gin.H{"error": "Admin password is too short. Eight characters or more required."})
			context.Abort()
			return
		}

		// Hash new password
		hash, err := utilities.HashAndSalt(admin_payload.AdminPassword)
		if err != nil {
			errors.New("Admin creation failed. Could not hash new password. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash your password."})
			context.Abort()
			return
		}
		admin_payload.AdminPassword = hash

		// Save new admin config
		err = files.SaveAdminConfig(admin_payload)
		if err != nil {
			errors.New("Admin creation failed. Could not save configuration. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new admin."})
			context.Abort()
			return
		}

		log.Println("New admin account created. Server is now claimed.")

		context.JSON(http.StatusCreated, gin.H{"message": "Admin created."})
		return
	}
}

// API route which returns if whether or not Wrapperr is configured.
func ApiWrapperrConfigured(context *gin.Context) {
	configBool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else {
		ipString := utilities.GetOriginIPString(context)
		log.Println("Retrieved Wrapperr configuration state." + ipString)

		context.JSON(http.StatusOK, gin.H{"message": "Retrieved Wrapperr configuration state.", "error": false, "data": configBool})
		return
	}
}

// API route which trades admin login credentials for an admin JWT session token. Valid for three days.
func ApiLogInAdmin(context *gin.Context) {
	admin, err := files.GetAdminState()
	if err != nil {
		log.Println("Failed to load admin state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load admin state."})
		context.Abort()
		return
	}

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr configuration."})
		context.Abort()
		return
	}
	if !admin {
		log.Println("Admin login failed. Admin is not configured.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Admin login failed. Admin is not configured."})
		context.Abort()
		return
	} else {
		adminConfig, err := files.GetAdminConfig()
		if err != nil {
			log.Println("Failed to load Wrapperr admin configuration. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr admin configuration."})
			context.Abort()
			return
		}

		var username string
		var password string

		if !config.BasicAuth {
			// Read payload from Post input
			var admin_payload models.AdminConfig
			if err := context.ShouldBindJSON(&admin_payload); err != nil {
				log.Println("Failed to parse request. Error: " + err.Error())
				context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
				context.Abort()
				return
			}

			username = admin_payload.AdminUsername
			password = admin_payload.AdminPassword

			// Hash new password
			passwordValidity := utilities.ComparePasswords(adminConfig.AdminPassword, password)

			// Validate admin username and password
			if !passwordValidity || adminConfig.AdminUsername != username {
				ipString := utilities.GetOriginIPString(context)
				log.Println("Admin login failed. Incorrect admin username or password." + ipString)
				context.JSON(http.StatusUnauthorized, gin.H{"error": "Login failed. Username or password is incorrect."})
				context.Abort()
				return
			}
		} else {
			err = utilities.ValidateBasicAuth(context, adminConfig)
			if err != nil {
				log.Println("Validate Basic auth. Error: " + err.Error())
				context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to validate HTTP Basic. You might need to restart your browser."})
				context.Abort()
				return
			}
		}

		token, err := modules.CreateToken(adminConfig.AdminUsername, true, "")
		if err != nil {
			log.Println("Failed to create JWT token. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create JWT token."})
			context.Abort()
			return
		}

		ipString := utilities.GetOriginIPString(context)
		log.Println("Created and retrieved admin login JWT Token." + ipString)

		context.JSON(http.StatusOK, gin.H{"message": "Login cookie created.", "error": false, "data": token})
		return
	}
}

// APi route which trades admin login credentials for an admin JWT session token. Valid for three days.
func ApiGetTautulliConncection(context *gin.Context) {
	// Read payload from Post input
	var tautulli_connection models.TautulliConfig
	if err := context.ShouldBindJSON(&tautulli_connection); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	if tautulli_connection.TautulliApiKey == "" || tautulli_connection.TautulliIP == "" || tautulli_connection.TautulliPort == 0 {
		log.Println("Cannot test Tautulli connection. Invalid Tautulli connection details received.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Tautulli connection details specified are invalid."})
		context.Abort()
		return
	}

	tautulli_state, err := modules.TautulliTestConnection(tautulli_connection.TautulliPort, tautulli_connection.TautulliIP, tautulli_connection.TautulliHttps, tautulli_connection.TautulliRoot, tautulli_connection.TautulliApiKey)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}

	booleanReply := models.BooleanReply{
		Message: "Tested Tautulli connection.",
		Error:   false,
		Data:    tautulli_state,
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Tested Tautulli connection." + ipString)

	context.JSON(http.StatusOK, booleanReply)
	return
}

// Get shareable link
func ApiGetShareLink(context *gin.Context) {
	config_bool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else if !config_bool {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Wrapperr is not configured."})
		context.Abort()
		return
	}

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr configuration."})
		context.Abort()
		return
	}

	if !config.CreateShareLinks {
		log.Println("Shareable links are not enabled in the Wrapperr configuration.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Shareable links are not enabled in the Wrapperr configuration."})
		context.Abort()
		return
	}

	// Read payload from Post input
	var link_payload models.WrapperrShareLinkGetRequest
	if err := context.ShouldBindJSON(&link_payload); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	var fileName string
	var hash string

	hash_array := strings.Split(link_payload.Hash, "-")

	if len(hash_array) < 2 {
		log.Println("Failed to split hash string while looking for user ID.")
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid shared link."})
		context.Abort()
		return
	}

	if config.PlexAuth {
		for j := 1; j < len(hash_array); j++ {
			if j != 1 {
				hash = hash + "-"
			}
			hash = hash + hash_array[j]
		}

		fileName = hash_array[0]
	} else {
		for j := 1; j < len(hash_array); j++ {
			if j != 1 {
				hash = hash + "-"
			}
			hash = hash + hash_array[j]
		}

		fileName = hash
	}

	share_link_object, err := files.GetLink(fileName)
	if err != nil {
		log.Println("Failed to get link file. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid shared link."})
		context.Abort()
		return
	}

	currentTime := time.Now()
	linkTime, err := time.Parse("2006-01-02", share_link_object.Date)
	if err != nil {
		log.Println("Failed to parse link date. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid shared link."})
		context.Abort()
		return
	}

	linkTime = linkTime.Add(7 * 24 * time.Hour)

	if !linkTime.Before(currentTime) && share_link_object.Hash == hash && !share_link_object.Expired {
		share_link_object.Message = "Shared link retrieved."
		share_link_object.Error = false

		ipString := utilities.GetOriginIPString(context)
		log.Println("Retrieved Wrapperr share link made by User ID/with hash: " + fileName + "." + ipString)

		context.JSON(http.StatusCreated, share_link_object)
		return
	} else {
		returnError := errors.New("Invalid shared link.")

		if linkTime.Before(currentTime) {

			share_link_object.Expired = true
			err = files.SaveLink(share_link_object, config.PlexAuth)
			if err != nil {
				log.Println("Failed to save share link. Error: " + err.Error())
			}
			returnError = errors.New("This shared link has expired.")
		}

		log.Println("Failed to retrieve Wrapperr share link with hash: " + link_payload.Hash + ".")

		context.JSON(http.StatusBadRequest, returnError)
		return
	}
}

func ApiLoginPlexAuth(context *gin.Context) {
	config_bool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else if !config_bool {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Wrapperr is not configured."})
		context.Abort()
		return
	}

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr configuration."})
		context.Abort()
		return
	}

	// Read payload from Post input
	var payload models.LoginPlexAuth
	if err := context.ShouldBindJSON(&payload); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	// Confirm username length
	if payload.ID == 0 || payload.Code == "" {
		log.Println("Cannot retrieve Plex Auth login state. Invalid ID or Code received.")
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Login ID and/or Code is invalid."})
		context.Abort()
		return
	}

	plex_auth, err := modules.GetPlexAuthLogin(payload.ID, payload.Code, config.WrapperrVersion, config.ClientKey)
	if err != nil {
		log.Println("Failed to retrieve Plex Auth pin. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve Plex Auth pin."})
		context.Abort()
		return
	}

	if plex_auth.AuthToken == "" {
		log.Println("Plex Auth response invalid. No Authtoken received.")
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Plex Auth response invalid."})
		context.Abort()
		return
	}

	token, err := modules.CreateToken("Plex Auth", false, plex_auth.AuthToken)
	if err != nil {
		log.Println("Failed to create JWT token. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create JWT token."})
		context.Abort()
		return
	}

	string_reply := models.StringReply{
		Message: "Login cookie created",
		Error:   false,
		Data:    token,
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Created and retrieved Plex Auth login JWT Token." + ipString)

	context.JSON(http.StatusCreated, string_reply)
	return
}

// ApiGetPoster serves cached poster images
func ApiGetPoster(context *gin.Context) {
	serverHash := context.Param("serverHash")
	filename := context.Param("filename")

	// Validate inputs
	if serverHash == "" || filename == "" {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid poster request"})
		return
	}

	// Get poster path with security validation
	posterPath, err := files.GetPosterPath(serverHash, filename)
	if err != nil {
		ipString := utilities.GetOriginIPString(context)
		log.Printf("[Posters] Blocked invalid path request: %s %s", err.Error(), ipString)
		context.JSON(http.StatusForbidden, gin.H{"error": "Invalid path"})
		return
	}

	// Check if file exists
	if _, err := os.Stat(posterPath); os.IsNotExist(err) {
		context.JSON(http.StatusNotFound, gin.H{"error": "Poster not found"})
		return
	}

	// Serve the file
	context.File(posterPath)
}

// ApiDownloadPoster handles on-demand poster downloads (lazy loading)
func ApiDownloadPoster(context *gin.Context) {
	type PosterRequest struct {
		ServerHash string `json:"server_hash"`
		RatingKey  int    `json:"rating_key"`
		ThumbPath  string `json:"thumb_path"`
	}

	var request PosterRequest
	if err := context.BindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Load config
	config, err := files.GetConfig()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load config"})
		return
	}

	// Check if posters are enabled
	if !config.WrapperrCustomize.EnablePosters {
		context.JSON(http.StatusForbidden, gin.H{"error": "Posters are disabled"})
		return
	}

	// Find matching Tautulli config
	var matchedConfig *models.TautulliConfig
	for _, tautulliConfig := range config.TautulliConfig {
		if files.GetTautulliServerHash(tautulliConfig) == request.ServerHash {
			matchedConfig = &tautulliConfig
			break
		}
	}

	if matchedConfig == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "Server not found"})
		return
	}

	// Download the poster asynchronously
	go func() {
		_, err := files.DownloadPoster(*matchedConfig, request.ThumbPath, request.RatingKey)
		if err != nil {
			log.Printf("[Posters] Lazy download failed for rating_key %d: %v", request.RatingKey, err)
		}
	}()

	// Return success immediately (download happens in background)
	context.JSON(http.StatusAccepted, gin.H{"message": "Poster download queued"})
}
