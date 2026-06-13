package models

type AdminConfig struct {
	AdminUsername  string `json:"admin_username"`
	AdminPassword  string `json:"admin_password"`
	AdminMFASecret string `json:"admin_mfa_secret"`
}

type AdminConfigUpdateRequest struct {
	AdminUsername         string `json:"admin_username"`
	AdminPassword         string `json:"admin_password"`
	AdminPasswordOriginal string `json:"admin_password_original"`
}

type AdminLoginRequest struct {
	AdminUsername string `json:"admin_username"`
	AdminPassword string `json:"admin_password"`
	AdminMFACode  string `json:"admin_mfa_code"`
}

type AdminIgnoreUser struct {
	Ignore bool `json:"user_ignore"`
}

// AdminMFAEnrollReply is returned when starting MFA enrollment. The secret and QR
// are shown to the admin so they can add the account to an authenticator app. The
// secret is not persisted until the admin confirms it via AdminMFAActivateRequest.
type AdminMFAEnrollReply struct {
	Secret       string `json:"secret"`
	OtpauthURL   string `json:"otpauth_url"`
	QRCodeBase64 string `json:"qr_code_base64"`
}

// AdminMFAActivateRequest confirms an enrollment: the code is validated against the
// supplied secret before the secret is saved.
type AdminMFAActivateRequest struct {
	Secret       string `json:"secret"`
	AdminMFACode string `json:"admin_mfa_code"`
}

// AdminMFADisableRequest disables MFA after re-authenticating with the admin password.
type AdminMFADisableRequest struct {
	AdminPassword string `json:"admin_password"`
}
