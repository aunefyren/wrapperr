package models

type TautulliGetHistoryReply struct {
	Response struct {
		Result  string      `json:"result"`
		Message interface{} `json:"message"`
		Data    struct {
			RecordsFiltered int                   `json:"recordsFiltered"`
			RecordsTotal    int                   `json:"recordsTotal"`
			Data            []TautulliHistoryItem `json:"data"`
			Draw            int                   `json:"draw"`
			FilterDuration  string                `json:"filter_duration"`
			TotalDuration   string                `json:"total_duration"`
		} `json:"data"`
	} `json:"response"`
}

type TautulliHistoryItem struct {
	ReferenceID           int         `json:"reference_id"`
	RowID                 int         `json:"row_id"`
	ID                    int         `json:"id"`
	Date                  int         `json:"date"`
	Started               int         `json:"started"`
	Stopped               int         `json:"stopped"`
	Duration              int         `json:"duration"`
	PausedCounter         int         `json:"paused_counter"`
	UserID                int         `json:"user_id"`
	User                  string      `json:"user"`
	FriendlyName          string      `json:"friendly_name"`
	Platform              string      `json:"platform"`
	Product               string      `json:"product"`
	Player                string      `json:"player"`
	IPAddress             string      `json:"ip_address"`
	Live                  int         `json:"live"`
	MachineID             string      `json:"machine_id"`
	Location              string      `json:"location"`
	Secure                interface{} `json:"secure"`
	Relayed               interface{} `json:"relayed"`
	MediaType             string      `json:"media_type"`
	RatingKey             int         `json:"rating_key"`
	ParentRatingKey       int         `json:"parent_rating_key"`
	GrandparentRatingKey  int         `json:"grandparent_rating_key"`
	FullTitle             string      `json:"full_title"`
	Title                 string      `json:"title"`
	ParentTitle           string      `json:"parent_title"`
	GrandparentTitle      string      `json:"grandparent_title"`
	OriginalTitle         string      `json:"original_title"`
	Year                  int         `json:"year"`
	MediaIndex            string      `json:"media_index"`
	ParentMediaIndex      string      `json:"parent_media_index"`
	Thumb                 string      `json:"thumb"`
	OriginallyAvailableAt string      `json:"originally_available_at"`
	GUID                  string      `json:"guid"`
	TranscodeDecision     string      `json:"transcode_decision"`
	PercentComplete       int         `json:"percent_complete"`
	WatchedStatus         int         `json:"watched_status"`
	GroupCount            int         `json:"group_count"`
	GroupIds              string      `json:"group_ids"`
	State                 interface{} `json:"state"`
	SessionKey            interface{} `json:"session_key"`
}

type TautulliEntry struct {
	Date                  int    `json:"date"`
	Duration              int    `json:"duration"`
	RowID                 int    `json:"row_id"`
	FriendlyName          string `json:"friendly_name"`
	FullTitle             string `json:"full_title"`
	GrandparentRatingKey  int    `json:"grandparent_rating_key"`
	GrandparentTitle      string `json:"grandparent_title"`
	OriginalTitle         string `json:"original_title"`
	MediaType             string `json:"media_type"`
	ParentRatingKey       int    `json:"parent_rating_key"`
	ParentTitle           string `json:"parent_title"`
	PausedCounter         int    `json:"paused_counter"`
	PercentComplete       int    `json:"percent_complete"`
	RatingKey             int    `json:"rating_key"`
	Title                 string `json:"title"`
	User                  string `json:"user"`
	UserID                int    `json:"user_id"`
	Year                  int    `json:"year"`
	OriginallyAvailableAt string `json:"originally_available_at"`
	Plays                 int    `json:"plays"`
}

type TautulliGetUsersReply struct {
	Response struct {
		Result  string         `json:"result"`
		Message interface{}    `json:"message"`
		Data    []TautulliUser `json:"data"`
	} `json:"response"`
}

type TautulliUser struct {
	RowID           int         `json:"row_id"`
	UserID          int         `json:"user_id"`
	Username        string      `json:"username"`
	FriendlyName    string      `json:"friendly_name"`
	Thumb           interface{} `json:"thumb"`
	Email           string      `json:"email"`
	IsActive        int         `json:"is_active"`
	IsAdmin         int         `json:"is_admin"`
	IsHomeUser      interface{} `json:"is_home_user"`
	IsAllowSync     interface{} `json:"is_allow_sync"`
	IsRestricted    interface{} `json:"is_restricted"`
	DoNotify        int         `json:"do_notify"`
	KeepHistory     int         `json:"keep_history"`
	AllowGuest      int         `json:"allow_guest"`
	ServerToken     interface{} `json:"server_token"`
	SharedLibraries interface{} `json:"shared_libraries"`
	FilterAll       interface{} `json:"filter_all"`
	FilterMovies    interface{} `json:"filter_movies"`
	FilterTv        interface{} `json:"filter_tv"`
	FilterMusic     interface{} `json:"filter_music"`
	FilterPhotos    interface{} `json:"filter_photos"`
}

type TautulliStatusReply struct {
	Response struct {
		Result  string `json:"result"`
		Message string `json:"message"`
		Data    struct {
		} `json:"data"`
	} `json:"response"`
}

type TautulliConfig struct {
	TautulliApiKey    string `json:"tautulli_apikey"`
	TautulliIP        string `json:"tautulli_ip"`
	TautulliPort      int    `json:"tautulli_port"`
	TautulliLength    int    `json:"tautulli_length"`
	TautulliRoot      string `json:"tautulli_root"`
	TautulliLibraries string `json:"tautulli_libraries"`
	TautulliGrouping  bool   `json:"tautulli_grouping"`
	TautulliHttps     bool   `json:"tautulli_https"`
	TautulliName      string `json:"tautulli_name"`
}

type TautulliConfigLegacy struct {
	TautulliApiKey    string `json:"tautulli_apikey"`
	TautulliIP        string `json:"tautulli_ip"`
	TautulliPort      int    `json:"tautulli_port"`
	TautulliLength    int    `json:"tautulli_length"`
	TautulliRoot      string `json:"tautulli_root"`
	TautulliLibraries string `json:"tautulli_libraries"`
	TautulliGrouping  bool   `json:"tautulli_grouping"`
	TautulliHttps     bool   `json:"tautulli_https"`
}
