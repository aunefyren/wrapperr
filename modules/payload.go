package modules

import (
	"aunefyren/wrapperr/models"
	"time"

	"github.com/google/uuid"
)

// NewPayload creates a new token payload with a specific username and duration
func NewPayload(username string, admin bool, authtoken string, duration time.Duration) (*models.Payload, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	payload := &models.Payload{
		ID:        tokenID,
		Username:  username,
		Admin:     admin,
		AuthToken: authtoken,
		IssuedAt:  time.Now(),
		ExpiredAt: time.Now().Add(duration),
	}
	return payload, nil
}
