package models

import "time"

type PlexGetPinReply struct {
	ID               int    `json:"id"`
	Code             string `json:"code"`
	Product          string `json:"product"`
	Trusted          bool   `json:"trusted"`
	ClientIdentifier string `json:"clientIdentifier"`
	Location         struct {
		Code                       string `json:"code"`
		EuropeanUnionMember        bool   `json:"european_union_member"`
		ContinentCode              string `json:"continent_code"`
		Country                    string `json:"country"`
		City                       string `json:"city"`
		TimeZone                   string `json:"time_zone"`
		PostalCode                 string `json:"postal_code"`
		InPrivacyRestrictedCountry bool   `json:"in_privacy_restricted_country"`
		Subdivisions               string `json:"subdivisions"`
		Coordinates                string `json:"coordinates"`
	} `json:"location"`
	ExpiresIn       int         `json:"expiresIn"`
	CreatedAt       time.Time   `json:"createdAt"`
	ExpiresAt       time.Time   `json:"expiresAt"`
	AuthToken       string      `json:"authToken"`
	NewRegistration interface{} `json:"newRegistration"`
}

type LoginPlexAuth struct {
	ID   int    `json:"id"`
	Code string `json:"code"`
}

type PlexGetUserReply struct {
	ID                int         `json:"id"`
	UUID              string      `json:"uuid"`
	Username          string      `json:"username"`
	Title             string      `json:"title"`
	Email             string      `json:"email"`
	FriendlyName      string      `json:"friendlyName"`
	Locale            interface{} `json:"locale"`
	Confirmed         bool        `json:"confirmed"`
	EmailOnlyAuth     bool        `json:"emailOnlyAuth"`
	HasPassword       bool        `json:"hasPassword"`
	Protected         bool        `json:"protected"`
	Thumb             string      `json:"thumb"`
	AuthToken         string      `json:"authToken"`
	MailingListStatus string      `json:"mailingListStatus"`
	MailingListActive bool        `json:"mailingListActive"`
	ScrobbleTypes     string      `json:"scrobbleTypes"`
	Country           string      `json:"country"`
	Pin               string      `json:"pin"`
	Subscription      struct {
		Active         bool      `json:"active"`
		SubscribedAt   time.Time `json:"subscribedAt"`
		Status         string    `json:"status"`
		PaymentService string    `json:"paymentService"`
		Plan           string    `json:"plan"`
		Features       []string  `json:"features"`
	} `json:"subscription"`
	SubscriptionDescription string      `json:"subscriptionDescription"`
	Restricted              bool        `json:"restricted"`
	Anonymous               interface{} `json:"anonymous"`
	Home                    bool        `json:"home"`
	Guest                   bool        `json:"guest"`
	HomeSize                int         `json:"homeSize"`
	HomeAdmin               bool        `json:"homeAdmin"`
	MaxHomeSize             int         `json:"maxHomeSize"`
	CertificateVersion      int         `json:"certificateVersion"`
	RememberExpiresAt       int         `json:"rememberExpiresAt"`
	Profile                 struct {
		AutoSelectAudio              bool   `json:"autoSelectAudio"`
		DefaultAudioLanguage         string `json:"defaultAudioLanguage"`
		DefaultSubtitleLanguage      string `json:"defaultSubtitleLanguage"`
		AutoSelectSubtitle           int    `json:"autoSelectSubtitle"`
		DefaultSubtitleAccessibility int    `json:"defaultSubtitleAccessibility"`
		DefaultSubtitleForced        int    `json:"defaultSubtitleForced"`
		PlexPassVisibility           string `json:"plexPassVisibility"`
		AccountAgeVisibility         string `json:"accountAgeVisibility"`
	} `json:"profile"`
	Entitlements []string `json:"entitlements"`
	Roles        []string `json:"roles"`
	Services     []struct {
		Identifier string      `json:"identifier"`
		Endpoint   string      `json:"endpoint"`
		Token      string      `json:"token"`
		Secret     interface{} `json:"secret"`
		Status     string      `json:"status"`
	} `json:"services"`
	AdsConsent           interface{} `json:"adsConsent"`
	AdsConsentSetAt      interface{} `json:"adsConsentSetAt"`
	AdsConsentReminderAt interface{} `json:"adsConsentReminderAt"`
	ExperimentalFeatures bool        `json:"experimentalFeatures"`
	TwoFactorEnabled     bool        `json:"twoFactorEnabled"`
	BackupCodesCreated   bool        `json:"backupCodesCreated"`
}
