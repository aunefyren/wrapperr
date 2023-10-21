package models

import (
	"errors"
	"time"
)

// Different types of error returned by the VerifyToken function
var (
	ErrInvalidToken = errors.New("token is invalid")
	ErrExpiredToken = errors.New("token has expired")
)

// Valid checks if the token payload is valid or not
func (payload *Payload) Valid() (err error) {
	now := time.Now()
	if payload.RegisteredClaims.ExpiresAt.Time.Before(now) {
		err = errors.New("Token has expired.")
		return
	}
	if payload.RegisteredClaims.NotBefore.Time.After(now) {
		err = errors.New("Token has not begun.")
		return
	}
	return nil
}
