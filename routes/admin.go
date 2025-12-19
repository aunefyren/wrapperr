package routes

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/aunefyren/wrapperr/files"
	"github.com/aunefyren/wrapperr/middlewares"
	"github.com/aunefyren/wrapperr/models"
	"github.com/aunefyren/wrapperr/modules"
	"github.com/aunefyren/wrapperr/utilities"

	"github.com/gin-gonic/gin"
)

// API route used to retrieve the Wrapperr configuration file.
func ApiGetConfig(context *gin.Context) {
	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr configuration."})
		context.Abort()
		return
	}

	adminConfig, err := files.GetAdminConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr admin configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr admin configuration."})
		context.Abort()
		return
	}

	authorizationHeader := context.GetHeader("Authorization")
	payload, httpStatus, err := middlewares.AuthGetPayloadFromAuthorization(authorizationHeader, config, adminConfig)
	if err != nil {
		log.Println("Failed to get payload from Authorization token. Error: " + err.Error())
		context.JSON(httpStatus, gin.H{"error": "Failed to get payload from Authorization token."})
		context.Abort()
		return
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Retrieved Wrapperr configuration." + ipString)

	context.JSON(http.StatusOK, gin.H{"data": config, "message": "Retrieved Wrapperr config.", "username": payload.Username})
	return
}

// API route used to update the Wrapperr configuration file.
func ApiSetConfig(context *gin.Context) {
	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr configuration."})
		context.Abort()
		return
	}

	originalRoot := config.WrapperrRoot

	// Read payload from Post input
	var config_payload models.SetWrapperrConfig
	if err := context.ShouldBindJSON(&config_payload); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	// Confirm username length
	if config_payload.DataType == "" {
		log.Println("Cannot set new config. Invalid data type received.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Data type specified is invalid."})
		context.Abort()
		return
	}

	if config_payload.DataType == "tautulli_config" {
		config.TautulliConfig = config_payload.TautulliConfig

		err = files.SaveConfig(config)
		if err != nil {
			log.Println("Failed to save new Wrapperr configuration. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new Wrapperr configuration."})
			context.Abort()
			return
		}
	} else if config_payload.DataType == "wrapperr_customize" {
		config.WrapperrCustomize = config_payload.WrapperrCustomize

		err = files.SaveConfig(config)
		if err != nil {
			log.Println("Failed to save new Wrapperr configuration. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new Wrapperr configuration."})
			context.Abort()
			return
		}
	} else if config_payload.DataType == "wrapperr_data" {
		new_time, err := time.LoadLocation(config_payload.WrapperrData.Timezone)
		if err != nil {
			log.Println("Failed to set the new time zone. Error: " + err.Error())
			context.JSON(http.StatusBadRequest, gin.H{"error": "Given time zone is invalid."})
			context.Abort()
			return
		}

		config.UseCache = config_payload.WrapperrData.UseCache
		config.UseLogs = config_payload.WrapperrData.UseLogs
		config.PlexAuth = config_payload.WrapperrData.PlexAuth
		config.BasicAuth = config_payload.WrapperrData.BasicAuth
		config.WrapperrRoot = config_payload.WrapperrData.WrapperrRoot
		config.CreateShareLinks = config_payload.WrapperrData.CreateShareLinks
		config.Timezone = config_payload.WrapperrData.Timezone
		config.ApplicationName = config_payload.WrapperrData.ApplicationName
		config.ApplicationURL = config_payload.WrapperrData.ApplicationURL
		config.WrappedEnd = config_payload.WrapperrData.WrappedEnd
		config.WrappedStart = config_payload.WrapperrData.WrappedStart
		config.WrappedDynamic = config_payload.WrapperrData.WrappedDynamic
		config.WrappedDynamicDays = config_payload.WrapperrData.WrappedDynamicDays
		config.WinterTheme = config_payload.WrapperrData.WinterTheme

		err = files.SaveConfig(config)
		if err != nil {
			log.Println("Failed to save new Wrapperr configuration. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new Wrapperr configuration."})
			context.Abort()
			return
		}

		time.Local = new_time
	} else {
		log.Println("Cannot set new config. Invalid data type received. Type: " + config_payload.DataType)
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to save new Wrapperr configuration."})
		context.Abort()
		return
	}

	if config_payload.ClearCache {
		log.Println("Clear cache setting set to true. Clearing cache.")

		err = files.ClearCache()
		if err != nil {
			log.Println("Failed to clear cache. Error: " + err.Error())
		}
	}

	log.Println("New Wrapperr configuration saved for type: " + config_payload.DataType + ".")
	context.JSON(http.StatusOK, gin.H{"message": "Saved new Wrapperr config."})

	if config.WrapperrRoot != originalRoot {
		log.Println("Root changed, attempting Wrapperr restart.")
		err = utilities.RestartSelf()
		if err != nil {
			log.Println("Failed to restart. Error: " + err.Error())
		}
	}

	return
}

// API route used to update admin accounts details (username, password).
func ApiUpdateAdmin(context *gin.Context) {
	adminConfig, err := files.GetAdminConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr admin configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr admin configuration."})
		context.Abort()
		return
	}

	// Read payload from Post input
	var admin_payload models.AdminConfigUpdateRequest
	if err := context.ShouldBindJSON(&admin_payload); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	// Test old password
	passwordValidity := utilities.ComparePasswords(adminConfig.AdminPassword, admin_payload.AdminPasswordOriginal)
	if !passwordValidity {
		ipString := utilities.GetOriginIPString(context)
		log.Println("Admin login update failed. Incorrect password." + ipString)
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials."})
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
		log.Println("Failed to hash your password. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash your password."})
		context.Abort()
		return
	}

	adminConfig.AdminPassword = hash

	// Save new admin config
	err = files.SaveAdminConfig(adminConfig)
	if err != nil {
		log.Println("Failed to update admin. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update admin."})
		context.Abort()
		return
	}

	// Update the private key to delete old logins
	_, err = files.UpdatePrivateKey()
	if err != nil {
		log.Println("Failed to update private key. Error: " + err.Error())
		log.Println("Admin account updated, but failed to rotate private key. Old logins still function.")
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Admin account updated, but failed to rotate private key. Old logins still function."})
		context.Abort()
		return
	}

	log.Println("New admin account created. Server is now claimed.")

	context.JSON(http.StatusOK, gin.H{"message": "Admin created."})
	return
}

// API route which validates an admin JWT token
func ApiValidateAdmin(context *gin.Context) {
	log.Println("Admin login session JWT validated.")
	context.JSON(http.StatusOK, gin.H{"message": "Admin session is valid."})
}

// API route which retrieves lines from the log file
func ApiGetLog(context *gin.Context) {
	logLines, err := files.GetLogLines()
	if err != nil {
		log.Println("Error trying to retrieve log lines. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error trying to retrieve log lines."})
		context.Abort()
		return
	}

	log.Println("Log lines retrieved for admin.")
	context.JSON(http.StatusOK, gin.H{"message": "Log lines retrieved", "data": logLines, "limit": files.GetMaxLogLinesReturned()})
	return
}

// API route to get all timezones
func ApiGetTimezones(context *gin.Context) {
	timezones, err := files.GetTimezones()
	if err != nil {
		log.Println("Error trying to get timezones. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get timezones."})
		context.Abort()
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Timezones received.", "error": false, "data": timezones.Timezones})
	return
}

func ApiWrapperCacheStatistics(context *gin.Context) {
	log.Println("New caching request.")

	configBool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else if !configBool {
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

	adminConfig, err := files.GetAdminConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr admin configuration. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr admin configuration."})
		context.Abort()
		return
	}

	if !config.UseCache {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Caching is not enabled, so a cache request is useless."})
		context.Abort()
		return
	}

	// Check connection to every Tautulli server
	for i := 0; i < len(config.TautulliConfig); i++ {
		log.Println("Checking Tautulli server '" + config.TautulliConfig[i].TautulliName + "'.")
		tautulli_state, err := modules.TautulliTestConnection(config.TautulliConfig[i].TautulliPort, config.TautulliConfig[i].TautulliIP, config.TautulliConfig[i].TautulliHttps, config.TautulliConfig[i].TautulliRoot, config.TautulliConfig[i].TautulliApiKey)
		if err != nil {
			log.Println("Failed to reach Tautulli server '" + config.TautulliConfig[i].TautulliName + "'. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach Tautulli server '" + config.TautulliConfig[i].TautulliName + "'."})
			context.Abort()
			return
		} else if !tautulli_state {
			log.Println("Failed to ping Tautulli server '" + config.TautulliConfig[i].TautulliName + "' before retrieving statistics.")
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach Tautulli server '" + config.TautulliConfig[i].TautulliName + "'."})
			context.Abort()
			return
		}
	}

	var userName string = "Caching mode"
	var userId int = 0
	var userEmail string = "N/A"
	var userFriendlyName = "Caching mode"

	// Read payload from Post input
	var cachingRequest models.CacheWrapperrRequest
	if err := context.ShouldBindJSON(&cachingRequest); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	if cachingRequest.CacheLimit < 1 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Chache limit too low."})
		context.Abort()
		return
	}

	_, cachingComplete, err := modules.GetWrapperStatistics(userName, userFriendlyName, userId, userEmail, config, adminConfig, true, cachingRequest.CacheLimit)
	if err != nil {
		log.Println("Failed to get statistics. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get statistics."})
		context.Abort()
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Completed caching request.", "error": false, "data": *cachingComplete})
	return
}

func ApiGetUsers(context *gin.Context) {
	configBool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else if !configBool {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Wrapperr is not configured."})
		context.Abort()
		return
	}

	users, err := files.GetUsers()
	if err != nil {
		log.Println("Failed to get users. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users."})
		context.Abort()
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Users recieved.", "data": users})
	return
}

func ApiGetUser(context *gin.Context) {
	configBool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else if !configBool {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Wrapperr is not configured."})
		context.Abort()
		return
	}

	var userId = context.Param("userId")

	userIDInt, err := strconv.Atoi(userId)
	if err != nil {
		log.Println("Failed to parse user ID. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse user ID."})
		context.Abort()
		return
	}

	user, err := modules.UsersGetUser(userIDInt)
	if err != nil {
		log.Println("Failed to get user. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user."})
		context.Abort()
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Users recieved.", "data": user})
	return
}

func ApiSyncTautulliUsers(context *gin.Context) {
	configBool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else if !configBool {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Wrapperr is not configured."})
		context.Abort()
		return
	}

	err = modules.TautulliTestEveryServer()
	if err != nil {
		log.Println("Failed to test Tautulli server. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to test Tautulli server."})
		context.Abort()
		return
	}

	err = modules.TautulliSyncUsersToWrapperr()
	if err != nil {
		log.Println("Failed to sync users from Tautulli. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync users from Tautulli."})
		context.Abort()
		return
	}

	newusers, err := files.GetUsers()
	if err != nil {
		log.Println("Failed to new users. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to new users."})
		context.Abort()
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Users synced.", "data": newusers})
	return
}

func ApiIgnoreUser(context *gin.Context) {
	configBool, err := files.GetConfigState()
	if err != nil {
		log.Println("Failed to retrieve configuration state. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve configuration state."})
		context.Abort()
		return
	} else if !configBool {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Wrapperr is not configured."})
		context.Abort()
		return
	}

	var userId = context.Param("userId")

	userIDInt, err := strconv.Atoi(userId)
	if err != nil {
		log.Println("Failed to parse user ID. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse user ID."})
		context.Abort()
		return
	}

	// Read payload from Post input
	var ignorePayload models.AdminIgnoreUser
	if err := context.ShouldBindJSON(&ignorePayload); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	user, err := modules.UsersGetUser(userIDInt)
	if err != nil {
		log.Println("Failed to get user. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user."})
		context.Abort()
		return
	}

	user.Ignore = ignorePayload.Ignore

	err = modules.UsersUpdateUser(user.UserID, user.FriendlyName, user.User, user.Email, user.Active, user.TautulliServers, user.Ignore)
	if err != nil {
		log.Println("Failed to update user. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user."})
		context.Abort()
		return
	}

	err = files.ClearCache()
	if err != nil {
		log.Println("Failed to clear cache. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cache."})
		context.Abort()
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "User toggeled."})
	return
}

// ApiCleanPosterCache manually cleans expired posters
func ApiCleanPosterCache(context *gin.Context) {
	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load config. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load config"})
		return
	}

	maxAge := config.WrapperrCustomize.PosterCacheMaxAgeDays
	err = files.CleanExpiredPosters(maxAge)
	if err != nil {
		log.Println("Failed to clean poster cache. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clean poster cache"})
		return
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Poster cache cleaned." + ipString)
	context.JSON(http.StatusOK, gin.H{"message": "Poster cache cleaned successfully"})
}
