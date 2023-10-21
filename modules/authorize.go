package modules

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/models"
	"aunefyren/wrapperr/utilities"
	"encoding/base64"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// AuthorizeToken validates JWT tokens using the private key.
func AuthorizeToken(writer http.ResponseWriter, request *http.Request, admin bool) (payload *models.Payload, err error) {
	payload = &models.Payload{}
	err = nil

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load JWT Token settings. Error: " + err.Error())
		return payload, errors.New("Failed to load JWT Token settings.")
	}

	adminConfig, err := files.GetAdminConfig()
	if err != nil {
		log.Println("Failed to load admin settings. Error: " + err.Error())
		return payload, errors.New("Failed to load admin settings.")
	}

	// Check if Authorization header is available
	authHeader := request.Header.Get("Authorization")
	if authHeader == "" || !strings.Contains(authHeader, " ") {
		log.Println("No valid Authorization token found in header during API request.")
		return payload, errors.New("No valid Authorization token found in header.")
	}

	// Split header
	headerParts := strings.Split(authHeader, " ")
	if len(headerParts) < 2 {
		log.Println("Failed to parse header. Error: " + err.Error())
		return payload, errors.New("Failed to parse header.")
	}

	token := headerParts[1]
	authType := ""

	// Define header type
	switch strings.TrimSpace(strings.ToLower(headerParts[0])) {
	case "bearer":
		authType = "bearer"
	case "basic":
		authType = "basic"
	default:
		return payload, errors.New("Authorization header not recognized.")
	}

	// Switch auth based on header type
	switch authType {
	case "bearer":
		payload, err = ParseToken(token, config.PrivateKey)
		if err != nil {
			log.Println("Session token not accepted. Error: ")
			log.Println(err)
			return payload, errors.New("Session token not accepted. Please relog.")
		}

		if admin {
			if !payload.Admin {
				return payload, errors.New("Session is not an admin session.")
			}
		}
	case "basic":
		rawDecodedtoken, err := base64.StdEncoding.DecodeString(token)
		if err != nil {
			return payload, errors.New("Failed to decode Base64.")
		}
		authParts := strings.Split(string(rawDecodedtoken), ":")
		if len(headerParts) < 2 {
			log.Println("Failed to parse basic auth header. Error: " + err.Error())
			return payload, errors.New("Failed to parse basic auth header.")
		}
		err = validateBasicAuth(authParts[0], authParts[1])
		if err != nil {
			log.Println("Failed to validate basic auth header. Error: " + err.Error())
			return payload, errors.New("Failed to validate basic auth header.")
		}
		_, payloadTwo, err := CreateTokenTwo(config.PrivateKey, adminConfig.AdminUsername, true, "", time.Now())
		if err != nil {
			log.Println("Failed to create token. Error: " + err.Error())
			return payload, errors.New("Failed to create token.")
		}
		payload = &payloadTwo
	}

	return payload, nil
}

func ValidateToken(signedToken string, privateKey string) (err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&models.Payload{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(privateKey), nil
		},
	)
	if err != nil {
		return
	}
	claims, ok := token.Claims.(*models.Payload)
	if !ok {
		err = errors.New("Couldn't parse claims.")
		return
	} else if claims.ExpiresAt == nil || claims.NotBefore == nil {
		err = errors.New("Claims not present.")
		return
	}
	now := time.Now()
	if claims.ExpiresAt.Time.Before(now) {
		err = errors.New("Token has expired.")
		return
	}
	if claims.NotBefore.Time.After(now) {
		err = errors.New("Token has not begun.")
		return
	}

	return
}

func ParseToken(signedToken string, privateKey string) (*models.Payload, error) {

	token, err := jwt.ParseWithClaims(
		signedToken,
		&models.Payload{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(privateKey), nil
		},
	)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*models.Payload)
	if !ok {
		err = errors.New("Couldn't parse claims")
		return nil, err
	} else if claims.ExpiresAt == nil || claims.NotBefore == nil {
		err = errors.New("Claims not present.")
		return nil, err
	}
	now := time.Now()
	if claims.ExpiresAt.Time.Before(now) {
		err = errors.New("Token has expired.")
		return nil, err
	}
	if claims.NotBefore.Time.After(now) {
		err = errors.New("Token has not begun.")
		return nil, err
	}
	return claims, nil

}

// CreateToken creates a new JWT token used to validate a users session. Valid for three days by default.
func CreateToken(username string, admin bool, authtoken string) (string, error) {

	PrivateKey, err := files.GetPrivateKey()
	if err != nil {
		log.Println("Failed to load JWT Token settings. Error: ")
		log.Println(err)
		return "", errors.New("Failed to load JWT Token settings.")
	}

	duration := time.Now().Add(time.Hour * 24 * 3)

	token, _, err := CreateTokenTwo(PrivateKey, username, admin, authtoken, duration)
	if err != nil {
		log.Println("Failed to create session token. Error: ")
		log.Println(err)
		return "", errors.New("Failed to create session token.")
	}

	return token, nil
}

// CreateToken creates a new token for a specific username and duration
func CreateTokenTwo(PrivateKey string, username string, admin bool, authtoken string, duration time.Time) (token string, payload models.Payload, err error) {
	token = ""
	payload = models.Payload{}
	err = nil

	payload, err = NewPayload(username, admin, authtoken, duration)
	if err != nil {
		return token, payload, err
	}

	tokenUnsigned := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	token, err = tokenUnsigned.SignedString([]byte(PrivateKey))

	return token, payload, err
}

func validateBasicAuth(username string, password string) (err error) {
	err = nil

	adminConfig, err := files.GetAdminConfig()
	if err != nil {
		log.Println("Failed to load admin settings. Error: " + err.Error())
		return errors.New("Failed to load admin settings.")
	}

	passwordValidity := utilities.ComparePasswords(adminConfig.AdminPassword, password)

	if username != adminConfig.AdminUsername || !passwordValidity {
		return errors.New("Non-valid credentials.")
	}

	return nil

}
