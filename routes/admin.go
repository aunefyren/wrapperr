package routes

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/middlewares"
	"aunefyren/wrapperr/models"
	"aunefyren/wrapperr/utilities"
	"log"
	"net/http"
	"time"

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
		context.JSON(httpStatus, gin.H{"error": err.Error()})
		context.Abort()
		return
	}

	configReply := models.ConfigReply{
		Data:     config,
		Message:  "Retrieved Wrapperr config.",
		Error:    false,
		Username: payload.Username,
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Retrieved Wrapperr configuration." + ipString)

	context.JSON(http.StatusOK, configReply)
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

	logLinesReturn := models.WrapperrLogLineReply{
		Message: "Log lines retrieved",
		Error:   false,
		Data:    logLines,
		Limit:   files.GetMaxLogLinesReturned(),
	}

	log.Println("Log lines retrieved for admin.")
	context.JSON(http.StatusOK, logLinesReturn)
	return
}
