package modules

import (
	"time"

	"github.com/aunefyren/wrapperr/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// NewPayload creates a new token payload with a specific username and duration
func NewPayload(username string, admin bool, authtoken string, duration time.Time) (payload models.Payload, err error) {
	payload = models.Payload{}
	err = nil

	tokenID, err := uuid.NewRandom()
	if err != nil {
		return payload, err
	}

	payload = models.Payload{
		ID:        tokenID,
		Username:  username,
		Admin:     admin,
		AuthToken: authtoken,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(duration),
			NotBefore: jwt.NewNumericDate(time.Now()),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "Wrapperr",
		},
	}

	return payload, nil
}
