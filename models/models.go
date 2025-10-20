package models

type WrapperrCustomize struct {
	WrapperrFrontPageTitle                      string `json:"wrapperr_front_page_title"`
	WrapperrFrontPageSubtitle                   string `json:"wrapperr_front_page_subtitle"`
	WrapperrFrontPageSearchTitle                string `json:"wrapperr_front_page_search_title"`
	StatsIntroTitle                             string `json:"stats_intro_title"`
	StatsIntroSubtitle                          string `json:"stats_intro_subtitle"`
	StatsOutroTitle                             string `json:"stats_outro_title"`
	StatsOutroSubtitle                          string `json:"stats_outro_subtitle"`
	StatsOrderByPlays                           bool   `json:"stats_order_by_plays"`
	StatsOrderByDuration                        bool   `json:"stats_order_by_duration"`
	StatsTopListLength                          int    `json:"stats_top_list_length"`
	ObfuscateOtherUsers                         bool   `json:"obfuscate_other_users"`
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
	WrapperrVersion              string `json:"wrapperr_version"`
	ApplicationName              string `json:"application_name"`
	PlexAuth                     bool   `json:"plex_auth"`
	WrapperrFrontPageTitle       string `json:"wrapperr_front_page_title"`
	WrapperrFrontPageSubtitle    string `json:"wrapperr_front_page_subtitle"`
	WrapperrFrontPageSearchTitle string `json:"wrapperr_front_page_search_title"`
	WrapperrRoot                 string `json:"wrapperr_root"`
	ClientKey                    string `json:"client_key"`
	WrapperrConfigured           bool   `json:"wrapperr_configured"`
	WinterTheme                  bool   `json:"winter_theme"`
	BasicAuth                    bool   `json:"basic_auth"`
	Message                      string `json:"message"`
	Error                        bool   `json:"error"`
}

type WrapperrFunctions struct {
	WrapperrCustomize WrapperrCustomize `json:"wrapperr_customize"`
	WrapperrVersion   string            `json:"wrapperr_version"`
	PlexAuth          bool              `json:"plex_auth"`
	CreateShareLinks  bool              `json:"create_share_links"`
}

type GetLoginURL struct {
	HomeURL string `json:"home_url"`
}

type SearchWrapperrRequest struct {
	PlexIdentity string `json:"plex_identity"`
}

type CacheWrapperrRequest struct {
	CacheLimit int `json:"cache_limit"`
}

type WrapperrDay struct {
	Date            string          `json:"date"`
	Data            []TautulliEntry `json:"data"`
	DataComplete    bool            `json:"data_complete"`
	TautulliServers []string        `json:"tautulli_servers"`
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

type WrapperrStatisticsReply struct {
	Error     bool                   `json:"error"`
	Date      string                 `json:"date"`
	Message   string                 `json:"message"`
	User      WrapperrStatisticsUser `json:"user"`
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

type WrapperrStatisticsUser struct {
	Name         string `json:"name"`
	FriendlyName string `json:"friendlyname"`
	ID           int    `json:"id"`
	UserMovies   struct {
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
}

type WrapperrShowBuddy struct {
	Message       string `json:"message"`
	Error         bool   `json:"error"`
	BuddyName     string `json:"buddy_name"`
	BuddyID       int    `json:"buddy_id"`
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

type Timezones struct {
	Timezones []string `json:"timezones"`
}
