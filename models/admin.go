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
