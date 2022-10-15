package main

import (
	"time"

	"github.com/google/uuid"
)

type Default_Reply struct {
	Message string `json:"message"`
	Error   bool   `json:"error"`
}

/*
type CustomPayload struct {
	jwt.Payload
	Username string `json:"username,omitempty"`
	PlexID   int    `json:"plexid,omitempty"`
	Admin    bool   `json:"admin,omitempty"`
}
*/

type Payload struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	Admin     bool      `json:"admin"`
	AuthToken string    `json:"authtoken"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiredAt time.Time `json:"expired_at"`
}

type JWTMaker struct {
	secretKey string
}

type AdminConfig struct {
	AdminUsername string `json:"admin_username"`
	AdminPassword string `json:"admin_password"`
}

type WrapperrConfig struct {
	TautulliConfig    TautulliConfig    `json:"tautulli_config"`
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
	WinterTheme       bool              `json:"winter_theme"`
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
}

type WrapperrCustomize struct {
	WrapperrFrontPageTitle                      string `json:"wrapperr_front_page_title"`
	WrapperrFrontPageSubtitle                   string `json:"wrapperr_front_page_subtitle"`
	StatsIntroTitle                             string `json:"stats_intro_title"`
	StatsIntroSubtitle                          string `json:"stats_intro_subtitle"`
	StatsOutroTitle                             string `json:"stats_outro_title"`
	StatsOutroSubtitle                          string `json:"stats_outro_subtitle"`
	StatsOrderByPlays                           bool   `json:"stats_order_by_plays"`
	StatsOrderByDuration                        bool   `json:"stats_order_by_duration"`
	StatsTopListLength                          int    `json:"stats_top_list_length"`
	GetUserMovieStats                           bool   `json:"get_user_movie_stats"`
	GetUserMovieStatsTitle                      string `json:"get_user_movie_stats_title"`
	GetUserMovieStatsSubtitle                   string `json:"get_user_movie_stats_subtitle"`
	GetUserMovieStatsSubsubtitle                string `json:"get_user_movie_stats_subsubtitle"`
	GetUserMovieStatsSubtitleOne                string `json:"get_user_movie_stats_subtitle_one"`
	GetUserMovieStatsSubsubtitleOne             string `json:"get_user_movie_stats_subsubtitle_one"`
	GetUserMovieStatsSubtitleNone               string `json:"get_user_movie_stats_subtitle_none"`
	GetUserMovieStatsSubsubtitleNone            string `json:"get_user_movie_stats_subsubtitle_none"`
	GetUserMovieStatsTopMovie                   string `json:"get_user_movie_stats_top_movie"`
	GetUserMovieStatsTopMoviePlural             string `json:"get_user_movie_stats_top_movie_plural"`
	GetUserMovieStatsMovieCompletionTitle       string `json:"get_user_movie_stats_movie_completion_title"`
	GetUserMovieStatsMovieCompletionTitlePlural string `json:"get_user_movie_stats_movie_completion_title_plural"`
	GetUserMovieStatsMovieCompletionSubtitle    string `json:"get_user_movie_stats_movie_completion_subtitle"`
	GetUserMovieStatsPauseTitle                 string `json:"get_user_movie_stats_pause_title"`
	GetUserMovieStatsPauseSubtitle              string `json:"get_user_movie_stats_pause_subtitle"`
	GetUserMovieStatsPauseTitleOne              string `json:"get_user_movie_stats_pause_title_one"`
	GetUserMovieStatsPauseSubtitleOne           string `json:"get_user_movie_stats_pause_subtitle_one"`
	GetUserMovieStatsPauseTitleNone             string `json:"get_user_movie_stats_pause_title_none"`
	GetUserMovieStatsPauseSubtitleNone          string `json:"get_user_movie_stats_pause_subtitle_none"`
	GetUserMovieStatsOldestTitle                string `json:"get_user_movie_stats_oldest_title"`
	GetUserMovieStatsOldestSubtitle             string `json:"get_user_movie_stats_oldest_subtitle"`
	GetUserMovieStatsOldestSubtitlePre1950      string `json:"get_user_movie_stats_oldest_subtitle_pre_1950"`
	GetUserMovieStatsOldestSubtitlePre1975      string `json:"get_user_movie_stats_oldest_subtitle_pre_1975"`
	GetUserMovieStatsOldestSubtitlePre2000      string `json:"get_user_movie_stats_oldest_subtitle_pre_2000"`
	GetUserMovieStatsSpentTitle                 string `json:"get_user_movie_stats_spent_title"`
	GetUserShowStats                            bool   `json:"get_user_show_stats"`
	GetUserShowBuddy                            bool   `json:"get_user_show_stats_buddy"`
	GetUserShowStatsTitle                       string `json:"get_user_show_stats_title"`
	GetUserShowStatsSubtitle                    string `json:"get_user_show_stats_subtitle"`
	GetUserShowStatsSubsubtitle                 string `json:"get_user_show_stats_subsubtitle"`
	GetUserShowStatsSubtitleOne                 string `json:"get_user_show_stats_subtitle_one"`
	GetUserShowStatsSubsubtitleOne              string `json:"get_user_show_stats_subsubtitle_one"`
	GetUserShowStatsSubtitleNone                string `json:"get_user_show_stats_subtitle_none"`
	GetUserShowStatsSubsubtitleNone             string `json:"get_user_show_stats_subsubtitle_none"`
	GetUserShowStatsTopShow                     string `json:"get_user_show_stats_top_show"`
	GetUserShowStatsTopShowPlural               string `json:"get_user_show_stats_top_show_plural"`
	GetUserShowStatsSpentTitle                  string `json:"get_user_show_stats_spent_title"`
	GetUserShowStatsMostPlayedTitle             string `json:"get_user_show_stats_most_played_title"`
	GetUserShowStatsMostPlayedSubtitle          string `json:"get_user_show_stats_most_played_subtitle"`
	GetUserShowStatsBuddyTitle                  string `json:"get_user_show_stats_buddy_title"`
	GetUserShowStatsBuddySubtitle               string `json:"get_user_show_stats_buddy_subtitle"`
	GetUserShowStatsBuddyTitleNone              string `json:"get_user_show_stats_buddy_title_none"`
	GetUserShowStatsBuddySubtitleNone           string `json:"get_user_show_stats_buddy_subtitle_none"`
	GetUserMusicStats                           bool   `json:"get_user_music_stats"`
	GetUserMusicStatsTitle                      string `json:"get_user_music_stats_title"`
	GetUserMusicStatsSubtitle                   string `json:"get_user_music_stats_subtitle"`
	GetUserMusicStatsSubsubtitle                string `json:"get_user_music_stats_subsubtitle"`
	GetUserMusicStatsSubtitleOne                string `json:"get_user_music_stats_subtitle_one"`
	GetUserMusicStatsSubsubtitleOne             string `json:"get_user_music_stats_subsubtitle_one"`
	GetUserMusicStatsSubtitleNone               string `json:"get_user_music_stats_subtitle_none"`
	GetUserMusicStatsSubsubtitleNone            string `json:"get_user_music_stats_subsubtitle_none"`
	GetUserMusicStatsTopTrack                   string `json:"get_user_music_stats_top_track"`
	GetUserMusicStatsTopTrackPlural             string `json:"get_user_music_stats_top_track_plural"`
	GetUserMusicStatsTopAlbumPlural             string `json:"get_user_music_stats_top_album_plural"`
	GetUserMusicStatsTopArtistPlural            string `json:"get_user_music_stats_top_artist_plural"`
	GetUserMusicStatsSpentTitle                 string `json:"get_user_music_stats_spent_title"`
	GetUserMusicStatsSpentSubtitle              string `json:"get_user_music_stats_spent_subtitle"`
	GetUserMusicStatsOldestAlbumTitle           string `json:"get_user_music_stats_oldest_album_title"`
	GetUserMusicStatsOldestAlbumSubtitle        string `json:"get_user_music_stats_oldest_album_subtitle"`
	GetYearStatsTitle                           string `json:"get_year_stats_title"`
	GetYearStatsSubtitle                        string `json:"get_year_stats_subtitle"`
	GetYearStatsSubsubtitle                     string `json:"get_year_stats_subsubtitle"`
	GetYearStatsMovies                          bool   `json:"get_year_stats_movies"`
	GetYearStatsMoviesTitle                     string `json:"get_year_stats_movies_title"`
	GetYearStatsShows                           bool   `json:"get_year_stats_shows"`
	GetYearStatsShowsTitle                      string `json:"get_year_stats_shows_title"`
	GetYearStatsMusic                           bool   `json:"get_year_stats_music"`
	GetYearStatsMusicTitle                      string `json:"get_year_stats_music_title"`
	GetYearStatsLeaderboard                     bool   `json:"get_year_stats_leaderboard"`
	GetYearStatsLeaderboardNumbers              bool   `json:"get_year_stats_leaderboard_numbers"`
	GetYearStatsLeaderboardTitle                string `json:"get_year_stats_leaderboard_title"`
	GetYearStatsMoviesDurationTitle             string `json:"get_year_stats_movies_duration_title"`
	GetYearStatsShowsDurationTitle              string `json:"get_year_stats_shows_duration_title"`
	GetYearStatsMusicDurationTitle              string `json:"get_year_stats_music_duration_title"`
	GetYearStatsDurationSumTitle                string `json:"get_year_stats_duration_sum_title"`
	WrapperrAnd                                 string `json:"wrapperr_and"`
	WrapperrPlay                                string `json:"wrapperr_play"`
	WrapperrPlayPlural                          string `json:"wrapperr_play_plural"`
	WrapperrDay                                 string `json:"wrapperr_day"`
	WrapperrDayPlural                           string `json:"wrapperr_day_plural"`
	WrapperrHour                                string `json:"wrapperr_hour"`
	WrapperrHourPlural                          string `json:"wrapperr_hour_plural"`
	WrapperrMinute                              string `json:"wrapperr_minute"`
	WrapperrMinutePlural                        string `json:"wrapperr_minute_plural"`
	WrapperrSecond                              string `json:"wrapperr_second"`
	WrapperrSecondPlural                        string `json:"wrapperr_second_plural"`
	WrapperrSortPlays                           string `json:"wrapperr_sort_plays"`
	WrapperrSortDuration                        string `json:"wrapperr_sort_duration"`
}

type WrapperrVersion struct {
	WrapperrVersion           string `json:"wrapperr_version"`
	ApplicationName           string `json:"application_name"`
	PlexAuth                  bool   `json:"plex_auth"`
	WrapperrFrontPageTitle    string `json:"wrapperr_front_page_title"`
	WrapperrFrontPageSubtitle string `json:"wrapperr_front_page_subtitle"`
	ClientKey                 string `json:"client_key"`
	WrapperrConfigured        bool   `json:"wrapperr_configured"`
	WinterTheme               bool   `json:"winter_theme"`
	Message                   string `json:"message"`
	Error                     bool   `json:"error"`
}

type BooleanReply struct {
	Message string `json:"message"`
	Error   bool   `json:"error"`
	Data    bool   `json:"data"`
}

type StringReply struct {
	Message string `json:"message"`
	Error   bool   `json:"error"`
	Data    string `json:"data"`
}

type ConfigReply struct {
	Message  string         `json:"message"`
	Error    bool           `json:"error"`
	Data     WrapperrConfig `json:"data"`
	Username string         `json:"username"`
}

type WrapperrFunctions struct {
	WrapperrCustomize WrapperrCustomize `json:"wrapperr_customize"`
	WrapperrVersion   string            `json:"wrapperr_version"`
	PlexAuth          bool              `json:"plex_auth"`
	CreateShareLinks  bool              `json:"create_share_links"`
}

type SetWrapperrConfig struct {
	ClearCache        bool              `json:"clear_cache"`
	DataType          string            `json:"data_type"`
	TautulliConfig    TautulliConfig    `json:"tautulli_config"`
	WrapperrCustomize WrapperrCustomize `json:"wrapperr_customize"`
	WrapperrData      struct {
		UseCache         bool   `json:"use_cache"`
		UseLogs          bool   `json:"use_logs"`
		PlexAuth         bool   `json:"plex_auth"`
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

type GetLoginURL struct {
	HomeURL string `json:"home_url"`
}

type GetLoginURLReply struct {
	ID      int    `json:"id"`
	Code    string `json:"code"`
	URL     string `json:"url"`
	Message string `json:"message"`
	Error   bool   `json:"error"`
}

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

type TautulliStatusReply struct {
	Response struct {
		Result  string `json:"result"`
		Message string `json:"message"`
		Data    struct {
		} `json:"data"`
	} `json:"response"`
}

type SearchWrapperrRequest struct {
	CachingMode  bool   `json:"caching"`
	CachingLimit int    `json:"cache_limit"`
	PlexIdentity string `json:"plex_identity"`
}

type TautulliGetUsersReply struct {
	Response struct {
		Result  string      `json:"result"`
		Message interface{} `json:"message"`
		Data    []struct {
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
		} `json:"data"`
	} `json:"response"`
}

type WrapperrDay struct {
	Date         string          `json:"date"`
	Data         []TautulliEntry `json:"data"`
	DataComplete bool            `json:"data_complete"`
}

type TautulliEntry struct {
	Date                 int    `json:"date"`
	Duration             int    `json:"duration"`
	RowID                int    `json:"row_id"`
	FriendlyName         string `json:"friendly_name"`
	FullTitle            string `json:"full_title"`
	GrandparentRatingKey int    `json:"grandparent_rating_key"`
	GrandparentTitle     string `json:"grandparent_title"`
	OriginalTitle        string `json:"original_title"`
	MediaType            string `json:"media_type"`
	ParentRatingKey      int    `json:"parent_rating_key"`
	ParentTitle          string `json:"parent_title"`
	PausedCounter        int    `json:"paused_counter"`
	PercentComplete      int    `json:"percent_complete"`
	RatingKey            int    `json:"rating_key"`
	Title                string `json:"title"`
	User                 string `json:"user"`
	UserID               int    `json:"user_id"`
	Year                 int    `json:"year"`
	Plays                int    `json:"plays"`
}

type WrapperrYearUserEntry struct {
	FriendlyName     string `json:"friendly_name"`
	GrandparentTitle string `json:"grandparent_title"`
	OriginalTitle    string `json:"original_title"`
	ParentTitle      string `json:"parent_title"`
	PausedCounter    int    `json:"paused_counter"`
	Title            string `json:"title"`
	User             string `json:"user"`
	UserID           int    `json:"user_id"`
	Year             int    `json:"year"`
	Plays            int    `json:"plays"`
	DurationMovies   int    `json:"duration_movies"`
	DurationShows    int    `json:"duration_shows"`
	DurationArtists  int    `json:"duration_artists"`
	Duration         int    `json:"duration"`
}

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

type WrapperrStatisticsReply struct {
	Error   bool   `json:"error"`
	Date    string `json:"date"`
	Message string `json:"message"`
	User    struct {
		Name       string `json:"name"`
		ID         int    `json:"id"`
		UserMovies struct {
			Data struct {
				MoviesDuration      []TautulliEntry `json:"movies_duration"`
				MoviesPlays         []TautulliEntry `json:"movies_plays"`
				UserMovieMostPaused struct {
					Title         string `json:"title"`
					Year          int    `json:"year"`
					Plays         int    `json:"plays"`
					Duration      int    `json:"duration"`
					PausedCounter int    `json:"paused_counter"`
				} `json:"user_movie_most_paused"`
				UserMovieFinishingPercent float64 `json:"user_movie_finishing_percent"`
				UserMovieOldest           struct {
					Title         string `json:"title"`
					Year          int    `json:"year"`
					Plays         int    `json:"plays"`
					Duration      int    `json:"duration"`
					PausedCounter int    `json:"paused_counter"`
					Error         bool   `json:"error"`
				} `json:"user_movie_oldest"`
				MovieDuration int `json:"movie_duration"`
				MoviePlays    int `json:"movie_plays"`
			} `json:"data"`
			Message string `json:"message"`
			Error   bool   `json:"error"`
		} `json:"user_movies"`
		UserShows struct {
			Data struct {
				ShowsDuration          []TautulliEntry `json:"shows_duration"`
				ShowsPlays             []TautulliEntry `json:"shows_plays"`
				EpisodeDurationLongest struct {
					Title            string `json:"title"`
					ParentTitle      string `json:"parent_title"`
					GrandparentTitle string `json:"grandparent_title"`
					Duration         int    `json:"duration"`
					Plays            int    `json:"plays"`
					Error            bool   `json:"error"`
				} `json:"episode_duration_longest"`
				ShowDuration int               `json:"show_duration"`
				ShowPlays    int               `json:"show_plays"`
				ShowBuddy    WrapperrShowBuddy `json:"show_buddy"`
			} `json:"data"`
			Message string `json:"message"`
			Error   bool   `json:"error"`
		} `json:"user_shows"`
		UserMusic struct {
			Data struct {
				TracksDuration  []TautulliEntry `json:"tracks_duration"`
				TracksPlays     []TautulliEntry `json:"tracks_plays"`
				AlbumsDuration  []TautulliEntry `json:"albums_duration"`
				AlbumsPlays     []TautulliEntry `json:"albums_plays"`
				UserAlbumOldest struct {
					ParentTitle      string `json:"parent_title"`
					GrandparentTitle string `json:"grandparent_title"`
					Year             int    `json:"year"`
					Plays            int    `json:"plays"`
					Duration         int    `json:"duration"`
					Error            bool   `json:"error"`
				} `json:"user_album_oldest"`
				ArtistsDuration []TautulliEntry `json:"artists_duration"`
				ArtistsPlays    []TautulliEntry `json:"artists_plays"`
				TrackDuration   int             `json:"track_duration"`
				TrackPlays      int             `json:"track_plays"`
			} `json:"data"`
			Message string `json:"message"`
			Error   bool   `json:"error"`
		} `json:"user_music"`
	} `json:"user"`
	YearStats struct {
		YearMovies struct {
			Data struct {
				MoviesDuration []TautulliEntry `json:"movies_duration"`
				MoviesPlays    []TautulliEntry `json:"movies_plays"`
				MovieDuration  int             `json:"movie_duration"`
				MoviePlays     int             `json:"movie_plays"`
			} `json:"data"`
			Message string `json:"message"`
			Error   bool   `json:"error"`
		} `json:"year_movies"`
		YearShows struct {
			Data struct {
				ShowsDuration []TautulliEntry `json:"shows_duration"`
				ShowsPlays    []TautulliEntry `json:"shows_plays"`
				ShowDuration  int             `json:"show_duration"`
				ShowPlays     int             `json:"show_plays"`
			} `json:"data"`
			Message string `json:"message"`
			Error   bool   `json:"error"`
		} `json:"year_shows"`
		YearMusic struct {
			Data struct {
				ArtistsDuration []TautulliEntry `json:"artists_duration"`
				ArtistsPlays    []TautulliEntry `json:"artists_plays"`
				MusicDuration   int             `json:"music_duration"`
				MusicPlays      int             `json:"music_plays"`
			} `json:"data"`
			Message string `json:"message"`
			Error   bool   `json:"error"`
		} `json:"year_music"`
		YearUsers struct {
			Data struct {
				UsersDuration []WrapperrYearUserEntry `json:"users_duration"`
				UsersPlays    []WrapperrYearUserEntry `json:"users_plays"`
			} `json:"data"`
			Message string `json:"message"`
			Error   bool   `json:"error"`
		} `json:"year_users"`
	} `json:"year_stats"`
}

type WrapperrShareLinkCreateRequest struct {
	Data      WrapperrStatisticsReply `json:"data"`
	Functions WrapperrCustomize       `json:"functions"`
}

type WrapperrShareLinkGetRequest struct {
	Hash string `json:"hash"`
}

type WrapperrShareLink struct {
	Date            string                         `json:"date"`
	UserID          int                            `json:"user_id"`
	WrapperrVersion string                         `json:"wrapperr_version"`
	Hash            string                         `json:"hash"`
	Content         WrapperrShareLinkCreateRequest `json:"content"`
	Message         string                         `json:"message"`
	Error           bool                           `json:"error"`
	Expired         bool                           `json:"expired"`
}

type WrapperrShowBuddy struct {
	Message       string `json:"message"`
	Error         bool   `json:"error"`
	BuddyName     string `json:"buddy_name"`
	BuddyDuration int    `json:"buddy_duration"`
	BuddyFound    bool   `json:"buddy_found"`
}

type WrapperrLogLine struct {
	Date    string `json:"date"`
	Time    string `json:"time"`
	Message string `json:"message"`
}

type WrapperrLogLineReply struct {
	Message string            `json:"message"`
	Error   bool              `json:"error"`
	Data    []WrapperrLogLine `json:"data"`
	Limit   int               `json:"limit"`
}
