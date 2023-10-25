package routes

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/middlewares"
	"aunefyren/wrapperr/models"
	"aunefyren/wrapperr/modules"
	"aunefyren/wrapperr/utilities"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Create shareable link using Plex Auth
func ApiCreateShareLink(context *gin.Context) {
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
		log.Panicln("Shareable links are not enabled in the Wrapperr configuration.")
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

	// Try to authorize bearer token from header
	if config.PlexAuth {
		authorizationHeader := context.GetHeader("Authorization")
		payload, httpStatus, err := middlewares.AuthGetPayloadFromAuthorization(authorizationHeader, config, adminConfig)
		if err != nil {
			log.Println("Failed to get payload from Authorization token. Error: " + err.Error())
			context.JSON(httpStatus, gin.H{"error": err.Error()})
			context.Abort()
			return
		}

		if err != nil || payload.Admin {
			log.Println("Either error or admin sessions.")
			context.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to authorize request."})
			context.Abort()
			return
		} else {
			plex_object, err := modules.PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
			if err != nil {
				log.Println("Could not validate Plex Auth login. Error: " + err.Error())
				context.JSON(http.StatusUnauthorized, gin.H{"error": "Could not validate Plex Auth login."})
				context.Abort()
				return
			}

			user_name = plex_object.Username
			user_id = plex_object.ID
		}
	}

	// Read payload from Post input
	var link_payload models.WrapperrShareLinkCreateRequest
	if err := context.ShouldBindJSON(&link_payload); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	currentTime := time.Now()
	hash_value := uuid.New().String()

	if !config.PlexAuth {
		user_name = link_payload.Data.User.Name
		user_id = 0
	}

	link_object := models.WrapperrShareLink{
		Content:         link_payload,
		UserID:          user_id,
		Hash:            hash_value,
		Date:            currentTime.Format("2006-01-02"),
		WrapperrVersion: config.WrapperrVersion,
		Expired:         false,
	}

	err = files.SaveLink(&link_object, config.PlexAuth)
	if err != nil {
		log.Println("Failed to save new link. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new link."})
		context.Abort()
		return
	}

	stringReply := models.StringReply{
		Message: "Saved Wrapperr link.",
		Error:   false,
		Data:    strconv.Itoa(user_id) + "-" + hash_value,
	}

	ipString := utilities.GetOriginIPString(context)
	log.Println("Saved new Wrapperr share link for " + user_name + " (" + strconv.Itoa(user_id) + ")." + ipString)

	context.JSON(http.StatusCreated, stringReply)
	return
}
