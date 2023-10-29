package models

import "time"

type WrapperrUser struct {
	FriendlyName string                 `json:"user_friendly_name"`
	User         string                 `json:"user_name"`
	UserID       int                    `json:"user_id"`
	Email        string                 `json:"user_email"`
	Wrappings    []WrapperrHistoryEntry `json:"wrappings"`
}

type WrapperrHistoryEntry struct {
	Date time.Time `json:"entry_date"`
	IP   string    `json:"entry_ip"`
}
