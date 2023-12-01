package models

type AdminConfig struct {
	AdminUsername string `json:"admin_username"`
	AdminPassword string `json:"admin_password"`
}

type AdminConfigUpdateRequest struct {
	AdminUsername         string `json:"admin_username"`
	AdminPassword         string `json:"admin_password"`
	AdminPasswordOriginal string `json:"admin_password_original"`
}

type AdminIgnoreUser struct {
	Ignore bool `json:"user_ignore"`
}
