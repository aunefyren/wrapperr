package routes

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aunefyren/wrapperr/files"
	"github.com/aunefyren/wrapperr/middlewares"
	"github.com/aunefyren/wrapperr/models"
	"github.com/aunefyren/wrapperr/modules"
	"github.com/aunefyren/wrapperr/utilities"

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

	ipString := utilities.GetOriginIPString(context)
	log.Println("Saved new Wrapperr share link for " + user_name + " (" + strconv.Itoa(user_id) + ")." + ipString)

	context.JSON(http.StatusCreated, gin.H{"message": "Saved Wrapperr link.", "error": false, "data": strconv.Itoa(user_id) + "-" + hash_value})
	return
}

func ApiWrapperGetStatistics(context *gin.Context) {
	log.Println("New wrap request.")

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

	// Check connection to every Tautulli server
	err = modules.TautulliTestEveryServer()
	if err != nil {
		log.Println("Failed to test Tautulli server. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to test Tautulli server."})
		context.Abort()
		return
	}

	// Sync users from Tautulli to Wrapperr
	err = modules.TautulliSyncUsersToWrapperr()
	if err != nil {
		log.Println("Failed to sync users from Tautulli. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync users from Tautulli."})
		context.Abort()
		return
	}

	var userName string = ""
	var userId int = 0
	var userEmail string = ""
	var userFriendlyName = ""
	var userActive = false

	// Try to authorize bearer token from header
	authorizationHeader := context.GetHeader("Authorization")
	payload, _, err := middlewares.AuthGetPayloadFromAuthorization(authorizationHeader, config, adminConfig)

	// If it failed and PlexAuth is enabled, respond with and error
	// If it didn't fail, and PlexAuth is enabled, declare auth as passed
	if err != nil && config.PlexAuth {
		log.Println("Failed to authorize authorization header. Error: " + err.Error())
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to authorize request."})
		context.Abort()
		return
	} else if payload.Admin && config.PlexAuth {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Admin login cannot retrieve statistics."})
		context.Abort()
		return
	}

	// If the user is not an admin, and PlexAuth is enabled, validate and retrieve details from Plex Token in payload
	if config.PlexAuth {
		plex_object, err := modules.PlexAuthValidateToken(payload.AuthToken, config.ClientKey, config.WrapperrVersion)
		if err != nil {
			log.Println("Could not validate Plex Auth login. Error: " + err.Error())
			context.JSON(http.StatusUnauthorized, gin.H{"error": "Could not validate Plex Auth login."})
			context.Abort()
			return
		}

		// Set user details from Plex login
		userName = plex_object.Username
		userId = plex_object.ID
		userEmail = plex_object.Email

		// Check for friendly name using Tautulli
		wrapperrUser, err := modules.UsersGetUser(userId)
		if err != nil {
			log.Println("Failed to find Wrapperr user. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find Wrapperr user."})
			context.Abort()
			return
		}

		userName = wrapperrUser.User
		userFriendlyName = wrapperrUser.FriendlyName
		userActive = wrapperrUser.Active
	}

	// Read payload from Post input
	var wrapperr_request models.SearchWrapperrRequest
	if err := context.ShouldBindJSON(&wrapperr_request); err != nil {
		log.Println("Failed to parse request. Error: " + err.Error())
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse request."})
		context.Abort()
		return
	}

	// If auth is not passed, caching mode is false, and no PlexIdentity was received, mark it as a bad request
	if wrapperr_request.PlexIdentity == "" && !config.PlexAuth {
		log.Println("Cannot retrieve statistics because search parameter is invalid.")
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid search parameter."})
		context.Abort()
		return
	}

	// If no auth has been passed, caching mode is false, and user is not admin, search for the Plex details using Tautulli and PlexIdentity
	if !config.PlexAuth {
		UserNameFound := false

		for i := 0; i < len(config.TautulliConfig); i++ {
			new_id, _, _, _, _, err := modules.TautulliGetUserId(config.TautulliConfig[i].TautulliPort, config.TautulliConfig[i].TautulliIP, config.TautulliConfig[i].TautulliHttps, config.TautulliConfig[i].TautulliRoot, config.TautulliConfig[i].TautulliApiKey, strings.TrimSpace(wrapperr_request.PlexIdentity))

			if err == nil {
				UserNameFound = true
				userId = new_id
				break
			}
		}

		if !UserNameFound {
			log.Println("Failed to find user in Tautulli.")
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Could not find a matching user."})
			context.Abort()
			return
		}

		// Check for friendly name using Tautulli
		wrapperrUser, err := modules.UsersGetUser(userId)
		if err != nil {
			log.Println("Failed to find Wrapperr user. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find Wrapperr user."})
			context.Abort()
			return
		}

		userName = wrapperrUser.User
		userEmail = wrapperrUser.Email
		userFriendlyName = wrapperrUser.FriendlyName
		userActive = wrapperrUser.Active
	}

	// If no username, email and no user_id has been declared at this point, and Plex Auth is active, something is wrong. Return error.
	if (userName == "" || userEmail == "" || userId == 0) && config.PlexAuth {
		log.Println("At this point the user should have been verified, but username, email or ID is empty.")
		context.JSON(http.StatusInternalServerError, gin.H{"error": "User validation error."})
		context.Abort()
		return
	} else if userName == "" || userId == 0 {
		log.Println("At this point the user should have been verified, but username or ID is empty.")
		context.JSON(http.StatusInternalServerError, gin.H{"error": "User validation error."})
		context.Abort()
		return
	}

	if !userActive {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "User is not active."})
		context.Abort()
		return
	}

	wrapperrReply, _, err := modules.GetWrapperStatistics(userName, userFriendlyName, userId, userEmail, config, adminConfig, false, 0)
	if err != nil {
		log.Println("Failed to get statistics. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get statistics."})
		context.Abort()
		return
	}

	// Preload user-specific posters before returning statistics
	if config.WrapperrCustomize.EnablePosters {
		func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[Posters] Panic during preload for user %s: %v", userName, r)
				}
			}()

			log.Printf("[Posters] Starting preload for user %s (ID: %d)", userName, userId)
			posterRefs := files.ExtractUserPosterReferences(wrapperrReply)

			if len(posterRefs) > 0 {
				successCount, skippedCount, errorCount := files.PreloadUserPosters(
					posterRefs,
					config.TautulliConfig,
					config.WrapperrCustomize.PosterCacheMaxAgeDays,
					3, // maxConcurrency
				)

				log.Printf("[Posters] Preload complete for user %s: %d new, %d cached, %d failed (out of %d total)",
					userName, successCount, skippedCount, errorCount, len(posterRefs))
			} else {
				log.Printf("[Posters] No posters to preload for user %s", userName)
			}
		}()
	}

	userhistoryEntry := models.WrapperrHistoryEntry{
		Date: time.Now(),
		IP:   context.ClientIP(),
	}
	historyEntries := []models.WrapperrHistoryEntry{}
	historyEntries = append(historyEntries, userhistoryEntry)

	userEntry := models.WrapperrUser{
		User:         userName,
		UserID:       userId,
		FriendlyName: userFriendlyName,
		Email:        userEmail,
		Wrappings:    historyEntries,
	}

	err = modules.UsersSaveUserEntry(userEntry)
	if err != nil {
		log.Println("Failed to save user history entry. Error: " + err.Error())
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user history entry."})
		context.Abort()
		return
	}

	context.JSON(http.StatusOK, wrapperrReply)
	return
}
