package middlewares

import (
	"encoding/base64"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/aunefyren/wrapperr/files"
	"github.com/aunefyren/wrapperr/models"
	"github.com/aunefyren/wrapperr/modules"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AuthMiddleware(admin bool) gin.HandlerFunc {
	return func(context *gin.Context) {
		authorizationHeader := context.GetHeader("Authorization")
		if authorizationHeader == "" {
			context.JSON(401, gin.H{"error": "Request does not contain an access token"})
			context.Abort()
			return
		}

		config, err := files.GetConfig()
		if err != nil {
			log.Println("Failed to load Wrapperr settings. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr settings."})
			context.Abort()
			return
		}

		adminConfig, err := files.GetAdminConfig()
		if err != nil {
			log.Println("Failed to load Wrapperr admin settings. Error: " + err.Error())
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load Wrapperr admin settings."})
			context.Abort()
			return
		}

		payload, httpStatus, err := AuthGetPayloadFromAuthorization(authorizationHeader, config, adminConfig)
		if err != nil {
			log.Println("Failed to get payload from Authorization token. Error: " + err.Error())
			context.JSON(httpStatus, gin.H{"error": err.Error()})
			context.Abort()
			return
		}

		if admin {
			adminState, err := files.GetAdminState()
			if err != nil {
				log.Println("Failed to load admin state. Error: " + err.Error())
				context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load admin state."})
				context.Abort()
				return
			}
			if !adminState {
				log.Println("Trying to verify admin session, but admin is not configured.")
				context.JSON(http.StatusBadRequest, gin.H{"error": "Trying to verify admin session, but admin is not configured."})
				context.Abort()
				return
			}
			if !payload.Admin {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "Session is not an admin session."})
				context.Abort()
				return
			}
		} else {
			if !config.PlexAuth {
				context.JSON(http.StatusBadRequest, gin.H{"error": "Plex Auth is not enabled in the Wrapperr configuration."})
				context.Abort()
				return
			}
			if payload.Admin {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "Session is an admin session."})
				context.Abort()
				return
			}
			if payload.AuthToken == "" {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "Session does not have a Plex Auth Token."})
				context.Abort()
				return
			}
		}

		context.Next()
	}
}

func AuthGetPayloadFromAuthorization(authorizationHeader string, config models.WrapperrConfig, adminConfig models.AdminConfig) (payload models.Payload, httpStatus int, err error) {
	httpStatus = 200
	err = nil
	payload = models.Payload{}

	if strings.HasPrefix(strings.ToLower(authorizationHeader), "bearer") {
		token, found := strings.CutPrefix(authorizationHeader, "Bearer ")
		if !found {
			return payload, http.StatusBadRequest, errors.New("'Bearer' part of header not found.")
		}

		payloadTwo, err := modules.ParseToken(token, config.PrivateKey)
		if err != nil {
			log.Println("Session token not accepted. Error: " + err.Error())
			return payload, http.StatusUnauthorized, errors.New("Session token not accepted. Please relog.")
		}

		payload = *payloadTwo
	} else if strings.HasPrefix(strings.ToLower(authorizationHeader), "basic") {
		token, found := strings.CutPrefix(authorizationHeader, "Basic ")
		if !found {
			return payload, http.StatusBadRequest, errors.New("'Basic' part of header not found.")
		}

		rawDecodedtoken, err := base64.StdEncoding.DecodeString(token)
		if err != nil {
			return payload, http.StatusInternalServerError, errors.New("Failed to decode Base64.")
		}

		authParts := strings.Split(string(rawDecodedtoken), ":")
		if len(authParts) < 2 {
			log.Println("Failed to parse basic auth header. Error: " + err.Error())
			return payload, http.StatusBadRequest, errors.New("Failed to parse basic auth header.")
		}

		err = modules.ValidateBasicAuth(authParts[0], authParts[1])
		if err != nil {
			log.Println("Failed to validate basic auth header. Error: " + err.Error())
			return payload, http.StatusUnauthorized, errors.New("Failed to validate basic auth header.")
		}

		_, payloadTwo, err := modules.CreateTokenTwo(config.PrivateKey, adminConfig.AdminUsername, true, "", time.Now())
		if err != nil {
			log.Println("Failed to create token. Error: " + err.Error())
			return payload, http.StatusInternalServerError, errors.New("Failed to create token.")
		}

		payload = payloadTwo
	}
	return
}

func GetUserIDFromAuthorizationHeader(authorizationHeader string) (userID uuid.UUID, err error) {
	err = nil
	userID = uuid.UUID{}

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr settings. Error: " + err.Error())
		return userID, errors.New("Failed to load Wrapperr settings.")
	}

	adminConfig, err := files.GetAdminConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr admin settings. Error: " + err.Error())
		return userID, errors.New("Failed to load Wrapperr admin settings.")
	}

	payload, _, err := AuthGetPayloadFromAuthorization(authorizationHeader, config, adminConfig)
	if err != nil {
		log.Println("Failed to get payload from Authorization token. Error: " + err.Error())
		return userID, errors.New("Failed to get payload from Authorization token.")
	}

	return payload.ID, err
}
