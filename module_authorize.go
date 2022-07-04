package main

import (
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// AuthorizeToken validates JWT tokens using the private key.
func AuthorizeToken(writer http.ResponseWriter, request *http.Request) (*Payload, error) {

	PrivateKey, err := GetPrivateKey()
	if err != nil {
		log.Println("Failed to load JWT Token settings. Error: ")
		log.Println(err)
		return &Payload{}, errors.New("Failed to load JWT Token settings.")
	}

	// Check if Authorization header is available
	header := request.Header.Get("Authorization")
	if header == "" || !strings.Contains(header, " ") || !strings.Contains(strings.ToLower(header), "bearer") {
		log.Println("No valid Authorization token found in header during API request.")
		return &Payload{}, errors.New("No valid Authorization token found in header.")
	}

	headerParts := strings.Split(header, " ")

	if len(headerParts) < 2 {
		log.Println("Failed to parse header. Error: ")
		log.Println(err)
		return &Payload{}, errors.New("Failed to parse header.")
	}

	jwtToken := headerParts[1]

	payload, err := VerifyToken(PrivateKey, jwtToken)
	if err != nil {
		log.Println("Session token not accepted. Error: ")
		log.Println(err)
		return &Payload{}, errors.New("Session token not accepted. Please relog.")
	}

	return payload, nil
}

// VerifyToken checks if the token is valid or not
func VerifyToken(PrivateKey string, token string) (*Payload, error) {
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, ErrInvalidToken
		}
		return []byte(PrivateKey), nil
	}

	jwtToken, err := jwt.ParseWithClaims(token, &Payload{}, keyFunc)
	if err != nil {
		verr, ok := err.(*jwt.ValidationError)
		if ok && errors.Is(verr.Inner, ErrExpiredToken) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	payload, ok := jwtToken.Claims.(*Payload)
	if !ok {
		return nil, ErrInvalidToken
	}

	return payload, nil
}

// CreateToken creates a new JWT token used to validate a users session. Valid for three days by default.
func CreateToken(username string, admin bool, authtoken string) (string, error) {

	PrivateKey, err := GetPrivateKey()
	if err != nil {
		log.Println("Failed to load JWT Token settings. Error: ")
		log.Println(err)
		return "", errors.New("Failed to load JWT Token settings.")
	}

	duration := time.Minute * 60 * 24 * 3

	token, _, err := CreateTokenTwo(PrivateKey, username, admin, authtoken, duration)
	if err != nil {
		log.Println("Failed to create session token. Error: ")
		log.Println(err)
		return "", errors.New("Failed to create session token.")
	}

	return token, nil
}

// CreateToken creates a new token for a specific username and duration
func CreateTokenTwo(PrivateKey string, username string, admin bool, authtoken string, duration time.Duration) (string, *Payload, error) {
	payload, err := NewPayload(username, admin, authtoken, duration)
	if err != nil {
		return "", payload, err
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	token, err := jwtToken.SignedString([]byte(PrivateKey))
	return token, payload, err
}
