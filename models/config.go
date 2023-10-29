package models

type WrapperrConfig struct {
	TautulliConfig    []TautulliConfig  `json:"tautulli_config"`
	WrapperrCustomize WrapperrCustomize `json:"wrapperr_customize"`
	WrapperrVersion   string            `json:"wrapperr_version"`
	Timezone          string            `json:"timezone"`
	ApplicationName   string            `json:"application_name"`
	ApplicationURL    string            `json:"application_url"`
	UseCache          bool              `json:"use_cache"`
	UseLogs           bool              `json:"use_logs"`
	ClientKey         string            `json:"client_key"`
	WrapperrRoot      string            `json:"wrapperr_root"`
	PrivateKey        string            `json:"private_key"`
	CreateShareLinks  bool              `json:"create_share_links"`
	WrappedStart      int               `json:"wrapped_start"`
	WrappedEnd        int               `json:"wrapped_end"`
	WrapperrPort      int               `json:"wrapperr_port"`
	PlexAuth          bool              `json:"plex_auth"`
	BasicAuth         bool              `json:"basic_auth"`
	WinterTheme       bool              `json:"winter_theme"`
}

type WrapperrConfigLegacy struct {
	TautulliConfig    TautulliConfigLegacy `json:"tautulli_config"`
	WrapperrCustomize WrapperrCustomize    `json:"wrapperr_customize"`
	WrapperrVersion   string               `json:"wrapperr_version"`
	Timezone          string               `json:"timezone"`
	ApplicationName   string               `json:"application_name"`
	ApplicationURL    string               `json:"application_url"`
	UseCache          bool                 `json:"use_cache"`
	UseLogs           bool                 `json:"use_logs"`
	ClientKey         string               `json:"client_key"`
	WrapperrRoot      string               `json:"wrapperr_root"`
	PrivateKey        string               `json:"private_key"`
	CreateShareLinks  bool                 `json:"create_share_links"`
	WrappedStart      int                  `json:"wrapped_start"`
	WrappedEnd        int                  `json:"wrapped_end"`
	WrapperrPort      int                  `json:"wrapperr_port"`
	PlexAuth          bool                 `json:"plex_auth"`
	WinterTheme       bool                 `json:"winter_theme"`
}

type SetWrapperrConfig struct {
	ClearCache        bool              `json:"clear_cache"`
	DataType          string            `json:"data_type"`
	TautulliConfig    []TautulliConfig  `json:"tautulli_config"`
	WrapperrCustomize WrapperrCustomize `json:"wrapperr_customize"`
	WrapperrData      struct {
		UseCache         bool   `json:"use_cache"`
		UseLogs          bool   `json:"use_logs"`
		PlexAuth         bool   `json:"plex_auth"`
		BasicAuth        bool   `json:"basic_auth"`
		WrapperrRoot     string `json:"wrapperr_root"`
		CreateShareLinks bool   `json:"create_share_links"`
		Timezone         string `json:"timezone"`
		ApplicationName  string `json:"application_name"`
		ApplicationURL   string `json:"application_url"`
		WrappedStart     int    `json:"wrapped_start"`
		WrappedEnd       int    `json:"wrapped_end"`
		WinterTheme      bool   `json:"winter_theme"`
	} `json:"wrapperr_data"`
}
