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

func ApiGetLoginURL(context *gin.Context) {
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

	// Read payload from Post input
	var homeurl_payload models.GetLoginURL
	if err := context.ShouldBindJSON(&homeurl_payload); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	// Confirm username length
	if homeurl_payload.HomeURL == "" {
		log.Println("Cannot retrieve Plex Auth login URL. Invalid HomeURL received.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "HomeURL specified is invalid."})
		context.Abort()
		return
	}

	plex_pin, err := modules.GetPin(config.ClientKey, config.WrapperrVersion)
	if err != nil {
		log.Println("Failed to retrieve Plex Auth pin. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve Plex Auth pin."})
		context.Abort()
		return
	}

	if plex_pin.ID == 0 || plex_pin.Code == "" {
		log.Println("Plex Auth response invalid. No ID and/or Code.")
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Plex Auth response invalid."})
		context.Abort()
		return
	}

	login_url := modules.GetLoginURLString(config.ClientKey, plex_pin.Code, homeurl_payload.HomeURL)

	url_reply := models.GetLoginURLReply{
		Message: "Plex Auth login URL retrieved.",
		Error:   false,
		URL:     login_url,
		Code:    plex_pin.Code,
		ID:      plex_pin.ID,
	}

	ip_string := utilities.GetOriginIPString(context)
	log.Println("Created and retrieved Plex Auth login URL." + ip_string)

	context.JSON(http.StatusCreated, url_reply)
}

// API route which validates an admin JWT token
func ApiValidatePlexAuth(context *gin.Context) {
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

	authorizationHeader := context.GetHeader("Authorization")
	payload, httpStatus, err := middlewares.AuthGetPayloadFromAuthorization(authorizationHeader, config, adminConfig)
	if err != nil {
		log.Println("Failed to get payload from Authorization token. Error: " + err.Error())
		context.JSON(httpStatus, gin.H{"error": err.Error()})
		context.Abort()
		return
	}

	_, err = modules.PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
	if err != nil {
		log.Println("Could not validate Plex Auth login. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Could not validate Plex Auth login."})
		context.Abort()
		return
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Plex Auth JWT Token validated using Plex API." + ipString)

	context.JSON(http.StatusOK, gin.H{"message": "Plex Auth validated."})
	return
}

// Get users shareable link
func ApiGetUserShareLink(context *gin.Context) {
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

	if !config.CreateShareLinks {
		log.Println("Shareable links are not enabled in the Wrapperr configuration.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Shareable links are not enabled in the Wrapperr configuration."})
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

	var user_name string
	var user_id int

	plex_object, err := modules.PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
	if err != nil {
		log.Println("Could not validate Plex Auth login. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Could not validate Plex Auth login."})
		context.Abort()
		return
	}

	user_name = plex_object.Username
	user_id = plex_object.ID

	share_link_object, err := files.GetLink(strconv.Itoa(user_id))
	if err != nil {

		stringReply := models.StringReply{
			Message: "No Wrapperr links found for user.",
			Error:   true,
			Data:    "",
		}

		ipString := utilities.GetOriginIPString(context)
		log.Println("No Wrapperr links found for " + user_name + " (" + strconv.Itoa(user_id) + ")." + ipString)

		context.JSON(http.StatusOK, stringReply)
		return
	}

	currentTime := time.Now()
	linkTime, err := time.Parse("2006-01-02", share_link_object.Date)
	if err != nil {
		log.Println("Failed to retrieve saved Wrapperr link. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve saved Wrapperr link."})
		context.Abort()
		return
	}

	linkTime = linkTime.Add(7 * 24 * time.Hour)

	if !linkTime.Before(currentTime) {

		stringReply := models.StringReply{
			Message: "Retrieved Wrapperr link created by user.",
			Error:   false,
			Data:    strconv.Itoa(user_id) + "-" + share_link_object.Hash,
		}

		ipString := utilities.GetOriginIPString(context)
		log.Println("Retrieved Wrapperr link created by " + user_name + " (" + strconv.Itoa(user_id) + ")." + ipString)

		context.JSON(http.StatusOK, stringReply)
		return
	} else {

		stringReply := models.StringReply{
			Message: "No Wrapperr links found for user.",
			Error:   true,
			Data:    "",
		}

		ipString := utilities.GetOriginIPString(context)
		log.Println("No Wrapperr links found for " + user_name + " (" + strconv.Itoa(user_id) + ")." + ipString)

		context.JSON(http.StatusOK, stringReply)
		return
	}
}

// Delete users shareable link
func ApiDeleteUserShareLink(context *gin.Context) {
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

	if !config.CreateShareLinks {
		log.Println("Shareable links are not enabled in the Wrapperr configuration.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Shareable links are not enabled in the Wrapperr configuration."})
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

	var user_name string
	var user_id int

	authorizationHeader := context.GetHeader("Authorization")
	payload, httpStatus, err := middlewares.AuthGetPayloadFromAuthorization(authorizationHeader, config, adminConfig)
	if err != nil {
		log.Println("Failed to get payload from Authorization token. Error: " + err.Error())
		context.JSON(httpStatus, gin.H{"error": err.Error()})
		context.Abort()
		return
	}

	plex_object, err := modules.PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
	if err != nil {
		log.Println("Could not validate Plex Auth login. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Could not validate Plex Auth login."})
		context.Abort()
		return
	}

	user_name = plex_object.Username
	user_id = plex_object.ID

	_, err = files.GetLink(strconv.Itoa(user_id))
	if err != nil {
		log.Println("Failed to find any saved Wrapperr link. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find any saved Wrapperr link."})
		context.Abort()
		return
	}

	err = files.DeleteLink(strconv.Itoa(user_id))
	if err != nil {
		log.Println("Failed to delete Wrapperr link. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Wrapperr link."})
		context.Abort()
		return
	}

	log.Println("Deleted Wrapperr link for user " + user_name + " (" + strconv.Itoa(user_id) + ").")

	context.JSON(http.StatusOK, gin.H{"message": "Deleted Wrapperr link."})
	return
}
