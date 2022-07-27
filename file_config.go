package main

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

var wrapperr_version_parameter = "v3.0.3"
var config_path, _ = filepath.Abs("./config/config.json")
var default_config_path, _ = filepath.Abs("./config_default.json")

const minSecretKeySize = 32

// Check if the config file has been configured for usage
func GetConfigState() (bool, error) {

	// Check if an admin is configured. Wrapperr must be claimed by an admin to function.
	admin, err := GetAdminState()
	if err != nil {
		log.Println("Get config state threw error trying to validate admin state.")
		return false, err
	} else if !admin {
		return false, nil
	}

	// Retrieve config object from function
	config, err := GetConfig()
	if err != nil {
		log.Println("Get config state threw error trying to retrieve config.")
		return false, err
	}

	// Check if certain parameters are set. These are essential paramteres the user must configure for basic functionality.
	if config.TautulliConfig.TautulliApiKey != "" && config.TautulliConfig.TautulliIP != "" && config.TautulliConfig.TautulliLength != 0 && config.Timezone != "" && config.WrappedStart != 0 && config.WrappedEnd != 0 && config.WrapperrVersion != "" {
		return true, nil
	} else {
		return false, nil
	}
}

// Get private key from the config file
func GetPrivateKey() (string, error) {

	// Retrieve config object from function
	config, err := GetConfig()
	if err != nil {
		return "", err
	}

	// Get variable from env file
	var private_key = config.PrivateKey

	if len(config.PrivateKey) < minSecretKeySize {
		return "", errors.New("Invalid private key size in configuration file.")
	}

	// If private key is not empty, return it.
	// If empty create a new one, write to file, and return the new one
	if private_key != "" {
		return private_key, nil
	} else {
		NewPrivateKey, err := UpdatePrivateKey()
		if err != nil {
			return "", err
		} else {
			return NewPrivateKey, nil
		}
	}
}

// Update private key to random string
func UpdatePrivateKey() (string, error) {

	// Retrieve config object from function
	config, err := GetConfig()
	if err != nil {
		return "", err
	}

	// Get variable from env file
	config.PrivateKey = uuid.New().String()

	// Save new config
	err = SaveConfig(config)
	if err != nil {
		return "", err
	}

	// Return empty error
	return config.PrivateKey, nil
}

// Saves the given config struct as config.json
func SaveConfig(config *WrapperrConfig) error {

	file, err := json.MarshalIndent(config, "", "	")
	if err != nil {
		return err
	}

	err = os.WriteFile(config_path, file, 0644)
	if err != nil {
		return err
	}

	return nil
}

// Creates empty config.json
func CreateConfigFile() error {

	var config WrapperrConfig

	// Define default boolean values since they are harder to seperate from deliberate boolean values
	config.UseCache = true
	config.PlexAuth = true
	config.UseLogs = true
	config.TautulliConfig.TautulliGrouping = true
	config.CreateShareLinks = true
	config.WinterTheme = true
	config.WrapperrCustomize.StatsOrderByDuration = true
	config.WrapperrCustomize.StatsOrderByPlays = true
	config.WrapperrCustomize.GetUserMovieStats = true
	config.WrapperrCustomize.GetUserShowStats = true
	config.WrapperrCustomize.GetUserShowBuddy = true
	config.WrapperrCustomize.GetUserMusicStats = true
	config.WrapperrCustomize.GetYearStatsMovies = true
	config.WrapperrCustomize.GetYearStatsShows = true
	config.WrapperrCustomize.GetYearStatsMusic = true
	config.WrapperrCustomize.GetYearStatsLeaderboard = true

	err := SaveConfig(&config)
	if err != nil {
		return err
	}

	return nil
}

// Read the config file and return the file as an object
func GetConfig() (*WrapperrConfig, error) {
	// Create config.json if it doesn't exist
	if _, err := os.Stat(config_path); errors.Is(err, os.ErrNotExist) {
		log.Println("Config file does not exist. Creating.")

		err := CreateConfigFile()
		if err != nil {
			return nil, err
		}
	}

	file, err := os.Open(config_path)
	if err != nil {
		log.Println("Get config file threw error trying to open the file.")
		return nil, err
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	config := WrapperrConfig{}
	err = decoder.Decode(&config)
	if err != nil {
		log.Println("Get config file threw error trying to parse the file.")
		return nil, err
	}

	file, err = os.Open(default_config_path)
	if err != nil {
		log.Println("Get config file threw error trying to open the template file.")
		return nil, err
	}
	defer file.Close()
	decoder = json.NewDecoder(file)
	config_default := WrapperrConfig{}
	err = decoder.Decode(&config_default)
	if err != nil {
		log.Println("Get config file threw error trying to parse the template file.")
		return nil, err
	}

	// Update the Wrapperr version the config file is created for
	if config.WrapperrVersion != wrapperr_version_parameter {
		config.WrapperrVersion = wrapperr_version_parameter
	}

	// Create a new Client Key if there is none
	if config.ClientKey == "" {
		config.ClientKey = uuid.New().String()
	}

	// Create a new Private Key if there is none
	if config.PrivateKey == "" {
		config.PrivateKey = uuid.New().String()
	}

	// If there is no application name, set it to Wrapperr (defined in the default template)
	if config.ApplicationName == "" {
		config.ApplicationName = config_default.ApplicationName
	}

	// If there is no application name, set it to Wrapperr (defined in the default template)
	if config.WrapperrPort == 0 {
		config.WrapperrPort = config_default.WrapperrPort
	}

	// Set Wrapperr start time to jan if there is no time
	if config.WrappedStart == 0 {
		config.WrappedStart = config_default.WrappedStart
	}

	// Set Wrapperr end time to dec if there is no time
	if config.WrappedEnd == 0 {
		config.WrappedEnd = config_default.WrappedEnd // If no start time, set to 31 Dec
	}

	// Set Tautulli length to 5000 if none is set
	if config.TautulliConfig.TautulliLength == 0 {
		config.TautulliConfig.TautulliLength = config_default.TautulliConfig.TautulliLength
	}

	// Set Tautulli port to 80 if none is set
	if config.TautulliConfig.TautulliPort == 0 {
		config.TautulliConfig.TautulliPort = config_default.TautulliConfig.TautulliPort
	}

	if config.WrapperrCustomize.WrapperrFrontPageTitle == "" {
		config.WrapperrCustomize.WrapperrFrontPageTitle = config_default.WrapperrCustomize.WrapperrFrontPageTitle
	}

	if config.WrapperrCustomize.WrapperrFrontPageSubtitle == "" {
		config.WrapperrCustomize.WrapperrFrontPageSubtitle = config_default.WrapperrCustomize.WrapperrFrontPageSubtitle
	}

	if config.WrapperrCustomize.StatsIntroTitle == "" {
		config.WrapperrCustomize.StatsIntroTitle = config_default.WrapperrCustomize.StatsIntroTitle // If no intro title string, set to default intro title
	}

	if config.WrapperrCustomize.StatsIntroSubtitle == "" {
		config.WrapperrCustomize.StatsIntroSubtitle = config_default.WrapperrCustomize.StatsIntroSubtitle // If no intro subtitle string, set to default intro subtitle
	}

	if config.WrapperrCustomize.StatsOutroTitle == "" {
		config.WrapperrCustomize.StatsOutroTitle = config_default.WrapperrCustomize.StatsOutroTitle // If no outro title string, set to default outro title
	}

	if config.WrapperrCustomize.StatsOutroSubtitle == "" {
		config.WrapperrCustomize.StatsOutroSubtitle = config_default.WrapperrCustomize.StatsOutroSubtitle // If no outro subtitle string, set to default outro subtitle
	}

	if !config.WrapperrCustomize.StatsOrderByDuration && !config.WrapperrCustomize.StatsOrderByPlays {
		config.WrapperrCustomize.StatsOrderByDuration = true
	}

	if config.WrapperrCustomize.GetUserMovieStatsTitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsTitle = config_default.WrapperrCustomize.GetUserMovieStatsTitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsSubtitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsSubtitle = config_default.WrapperrCustomize.GetUserMovieStatsSubtitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsSubsubtitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsSubsubtitle = config_default.WrapperrCustomize.GetUserMovieStatsSubsubtitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsSubtitleOne == "" {
		config.WrapperrCustomize.GetUserMovieStatsSubtitleOne = config_default.WrapperrCustomize.GetUserMovieStatsSubtitleOne
	}

	if config.WrapperrCustomize.GetUserMovieStatsSubsubtitleOne == "" {
		config.WrapperrCustomize.GetUserMovieStatsSubsubtitleOne = config_default.WrapperrCustomize.GetUserMovieStatsSubsubtitleOne
	}

	if config.WrapperrCustomize.GetUserMovieStatsSubtitleNone == "" {
		config.WrapperrCustomize.GetUserMovieStatsSubtitleNone = config_default.WrapperrCustomize.GetUserMovieStatsSubtitleNone
	}

	if config.WrapperrCustomize.GetUserMovieStatsSubsubtitleNone == "" {
		config.WrapperrCustomize.GetUserMovieStatsSubsubtitleNone = config_default.WrapperrCustomize.GetUserMovieStatsSubsubtitleNone
	}

	if config.WrapperrCustomize.GetUserMovieStatsTopMovie == "" {
		config.WrapperrCustomize.GetUserMovieStatsTopMovie = config_default.WrapperrCustomize.GetUserMovieStatsTopMovie
	}

	if config.WrapperrCustomize.GetUserMovieStatsTopMoviePlural == "" {
		config.WrapperrCustomize.GetUserMovieStatsTopMoviePlural = config_default.WrapperrCustomize.GetUserMovieStatsTopMoviePlural
	}

	if config.WrapperrCustomize.GetUserMovieStatsMovieCompletionTitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsMovieCompletionTitle = config_default.WrapperrCustomize.GetUserMovieStatsMovieCompletionTitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsMovieCompletionTitlePlural == "" {
		config.WrapperrCustomize.GetUserMovieStatsMovieCompletionTitlePlural = config_default.WrapperrCustomize.GetUserMovieStatsMovieCompletionTitlePlural
	}

	if config.WrapperrCustomize.GetUserMovieStatsMovieCompletionSubtitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsMovieCompletionSubtitle = config_default.WrapperrCustomize.GetUserMovieStatsMovieCompletionSubtitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsPauseTitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsPauseTitle = config_default.WrapperrCustomize.GetUserMovieStatsPauseTitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsPauseSubtitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsPauseSubtitle = config_default.WrapperrCustomize.GetUserMovieStatsPauseSubtitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsPauseTitleOne == "" {
		config.WrapperrCustomize.GetUserMovieStatsPauseTitleOne = config_default.WrapperrCustomize.GetUserMovieStatsPauseTitleOne
	}

	if config.WrapperrCustomize.GetUserMovieStatsPauseSubtitleOne == "" {
		config.WrapperrCustomize.GetUserMovieStatsPauseSubtitleOne = config_default.WrapperrCustomize.GetUserMovieStatsPauseSubtitleOne
	}

	if config.WrapperrCustomize.GetUserMovieStatsPauseTitleNone == "" {
		config.WrapperrCustomize.GetUserMovieStatsPauseTitleNone = config_default.WrapperrCustomize.GetUserMovieStatsPauseTitleNone
	}

	if config.WrapperrCustomize.GetUserMovieStatsPauseSubtitleNone == "" {
		config.WrapperrCustomize.GetUserMovieStatsPauseSubtitleNone = config_default.WrapperrCustomize.GetUserMovieStatsPauseSubtitleNone
	}

	if config.WrapperrCustomize.GetUserMovieStatsOldestTitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsOldestTitle = config_default.WrapperrCustomize.GetUserMovieStatsOldestTitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsOldestSubtitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsOldestSubtitle = config_default.WrapperrCustomize.GetUserMovieStatsOldestSubtitle
	}

	if config.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre1950 == "" {
		config.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre1950 = config_default.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre1950
	}

	if config.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre1975 == "" {
		config.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre1975 = config_default.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre1975
	}

	if config.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre2000 == "" {
		config.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre2000 = config_default.WrapperrCustomize.GetUserMovieStatsOldestSubtitlePre2000
	}

	if config.WrapperrCustomize.GetUserMovieStatsSpentTitle == "" {
		config.WrapperrCustomize.GetUserMovieStatsSpentTitle = config_default.WrapperrCustomize.GetUserMovieStatsSpentTitle
	}

	if config.WrapperrCustomize.GetUserShowStatsTitle == "" {
		config.WrapperrCustomize.GetUserShowStatsTitle = config_default.WrapperrCustomize.GetUserShowStatsTitle
	}

	if config.WrapperrCustomize.GetUserShowStatsSubtitle == "" {
		config.WrapperrCustomize.GetUserShowStatsSubtitle = config_default.WrapperrCustomize.GetUserShowStatsSubtitle
	}

	if config.WrapperrCustomize.GetUserShowStatsSubsubtitle == "" {
		config.WrapperrCustomize.GetUserShowStatsSubsubtitle = config_default.WrapperrCustomize.GetUserShowStatsSubsubtitle
	}

	if config.WrapperrCustomize.GetUserShowStatsSubtitleOne == "" {
		config.WrapperrCustomize.GetUserShowStatsSubtitleOne = config_default.WrapperrCustomize.GetUserShowStatsSubtitleOne
	}

	if config.WrapperrCustomize.GetUserShowStatsSubsubtitleOne == "" {
		config.WrapperrCustomize.GetUserShowStatsSubsubtitleOne = config_default.WrapperrCustomize.GetUserShowStatsSubsubtitleOne
	}

	if config.WrapperrCustomize.GetUserShowStatsSubtitleNone == "" {
		config.WrapperrCustomize.GetUserShowStatsSubtitleNone = config_default.WrapperrCustomize.GetUserShowStatsSubtitleNone
	}

	if config.WrapperrCustomize.GetUserShowStatsSubsubtitleNone == "" {
		config.WrapperrCustomize.GetUserShowStatsSubsubtitleNone = config_default.WrapperrCustomize.GetUserShowStatsSubsubtitleNone
	}

	if config.WrapperrCustomize.GetUserShowStatsTopShow == "" {
		config.WrapperrCustomize.GetUserShowStatsTopShow = config_default.WrapperrCustomize.GetUserShowStatsTopShow
	}

	if config.WrapperrCustomize.GetUserShowStatsTopShowPlural == "" {
		config.WrapperrCustomize.GetUserShowStatsTopShowPlural = config_default.WrapperrCustomize.GetUserShowStatsTopShowPlural
	}

	if config.WrapperrCustomize.GetUserShowStatsSpentTitle == "" {
		config.WrapperrCustomize.GetUserShowStatsSpentTitle = config_default.WrapperrCustomize.GetUserShowStatsSpentTitle
	}

	if config.WrapperrCustomize.GetUserShowStatsMostPlayedTitle == "" {
		config.WrapperrCustomize.GetUserShowStatsMostPlayedTitle = config_default.WrapperrCustomize.GetUserShowStatsMostPlayedTitle
	}

	if config.WrapperrCustomize.GetUserShowStatsMostPlayedSubtitle == "" {
		config.WrapperrCustomize.GetUserShowStatsMostPlayedSubtitle = config_default.WrapperrCustomize.GetUserShowStatsMostPlayedSubtitle
	}

	if config.WrapperrCustomize.GetUserShowStatsBuddyTitle == "" {
		config.WrapperrCustomize.GetUserShowStatsBuddyTitle = config_default.WrapperrCustomize.GetUserShowStatsBuddyTitle
	}

	if config.WrapperrCustomize.GetUserShowStatsBuddySubtitle == "" {
		config.WrapperrCustomize.GetUserShowStatsBuddySubtitle = config_default.WrapperrCustomize.GetUserShowStatsBuddySubtitle
	}

	if config.WrapperrCustomize.GetUserShowStatsBuddyTitleNone == "" {
		config.WrapperrCustomize.GetUserShowStatsBuddyTitleNone = config_default.WrapperrCustomize.GetUserShowStatsBuddyTitleNone
	}

	if config.WrapperrCustomize.GetUserShowStatsBuddySubtitleNone == "" {
		config.WrapperrCustomize.GetUserShowStatsBuddySubtitleNone = config_default.WrapperrCustomize.GetUserShowStatsBuddySubtitleNone
	}

	if config.WrapperrCustomize.GetUserMusicStatsTitle == "" {
		config.WrapperrCustomize.GetUserMusicStatsTitle = config_default.WrapperrCustomize.GetUserMusicStatsTitle
	}

	if config.WrapperrCustomize.GetUserMusicStatsSubtitle == "" {
		config.WrapperrCustomize.GetUserMusicStatsSubtitle = config_default.WrapperrCustomize.GetUserMusicStatsSubtitle
	}

	if config.WrapperrCustomize.GetUserMusicStatsSubsubtitle == "" {
		config.WrapperrCustomize.GetUserMusicStatsSubsubtitle = config_default.WrapperrCustomize.GetUserMusicStatsSubsubtitle
	}

	if config.WrapperrCustomize.GetUserMusicStatsSubtitleOne == "" {
		config.WrapperrCustomize.GetUserMusicStatsSubtitleOne = config_default.WrapperrCustomize.GetUserMusicStatsSubtitleOne
	}

	if config.WrapperrCustomize.GetUserMusicStatsSubsubtitleOne == "" {
		config.WrapperrCustomize.GetUserMusicStatsSubsubtitleOne = config_default.WrapperrCustomize.GetUserMusicStatsSubsubtitleOne
	}

	if config.WrapperrCustomize.GetUserMusicStatsSubtitleNone == "" {
		config.WrapperrCustomize.GetUserMusicStatsSubtitleNone = config_default.WrapperrCustomize.GetUserMusicStatsSubtitleNone
	}

	if config.WrapperrCustomize.GetUserMusicStatsSubsubtitleNone == "" {
		config.WrapperrCustomize.GetUserMusicStatsSubsubtitleNone = config_default.WrapperrCustomize.GetUserMusicStatsSubsubtitleNone
	}

	if config.WrapperrCustomize.GetUserMusicStatsTopTrack == "" {
		config.WrapperrCustomize.GetUserMusicStatsTopTrack = config_default.WrapperrCustomize.GetUserMusicStatsTopTrack
	}

	if config.WrapperrCustomize.GetUserMusicStatsTopTrackPlural == "" {
		config.WrapperrCustomize.GetUserMusicStatsTopTrackPlural = config_default.WrapperrCustomize.GetUserMusicStatsTopTrackPlural
	}

	if config.WrapperrCustomize.GetUserMusicStatsTopAlbumPlural == "" {
		config.WrapperrCustomize.GetUserMusicStatsTopAlbumPlural = config_default.WrapperrCustomize.GetUserMusicStatsTopAlbumPlural
	}

	if config.WrapperrCustomize.GetUserMusicStatsTopArtistPlural == "" {
		config.WrapperrCustomize.GetUserMusicStatsTopArtistPlural = config_default.WrapperrCustomize.GetUserMusicStatsTopArtistPlural
	}

	if config.WrapperrCustomize.GetUserMusicStatsSpentTitle == "" {
		config.WrapperrCustomize.GetUserMusicStatsSpentTitle = config_default.WrapperrCustomize.GetUserMusicStatsSpentTitle
	}

	if config.WrapperrCustomize.GetUserMusicStatsSpentSubtitle == "" {
		config.WrapperrCustomize.GetUserMusicStatsSpentSubtitle = config_default.WrapperrCustomize.GetUserMusicStatsSpentSubtitle
	}

	if config.WrapperrCustomize.GetUserMusicStatsOldestAlbumTitle == "" {
		config.WrapperrCustomize.GetUserMusicStatsOldestAlbumTitle = config_default.WrapperrCustomize.GetUserMusicStatsOldestAlbumTitle
	}

	if config.WrapperrCustomize.GetUserMusicStatsOldestAlbumSubtitle == "" {
		config.WrapperrCustomize.GetUserMusicStatsOldestAlbumSubtitle = config_default.WrapperrCustomize.GetUserMusicStatsOldestAlbumSubtitle
	}

	if config.WrapperrCustomize.GetYearStatsTitle == "" {
		config.WrapperrCustomize.GetYearStatsTitle = config_default.WrapperrCustomize.GetYearStatsTitle
	}

	if config.WrapperrCustomize.GetYearStatsSubtitle == "" {
		config.WrapperrCustomize.GetYearStatsSubtitle = config_default.WrapperrCustomize.GetYearStatsSubtitle
	}

	if config.WrapperrCustomize.GetYearStatsSubsubtitle == "" {
		config.WrapperrCustomize.GetYearStatsSubsubtitle = config_default.WrapperrCustomize.GetYearStatsSubsubtitle
	}

	if config.WrapperrCustomize.GetYearStatsMoviesTitle == "" {
		config.WrapperrCustomize.GetYearStatsMoviesTitle = config_default.WrapperrCustomize.GetYearStatsMoviesTitle
	}

	if config.WrapperrCustomize.GetYearStatsShowsTitle == "" {
		config.WrapperrCustomize.GetYearStatsShowsTitle = config_default.WrapperrCustomize.GetYearStatsShowsTitle
	}

	if config.WrapperrCustomize.GetYearStatsMusicTitle == "" {
		config.WrapperrCustomize.GetYearStatsMusicTitle = config_default.WrapperrCustomize.GetYearStatsMusicTitle
	}

	if config.WrapperrCustomize.GetYearStatsLeaderboardTitle == "" {
		config.WrapperrCustomize.GetYearStatsLeaderboardTitle = config_default.WrapperrCustomize.GetYearStatsLeaderboardTitle
	}

	if config.WrapperrCustomize.GetYearStatsMoviesDurationTitle == "" {
		config.WrapperrCustomize.GetYearStatsMoviesDurationTitle = config_default.WrapperrCustomize.GetYearStatsMoviesDurationTitle
	}

	if config.WrapperrCustomize.GetYearStatsShowsDurationTitle == "" {
		config.WrapperrCustomize.GetYearStatsShowsDurationTitle = config_default.WrapperrCustomize.GetYearStatsShowsDurationTitle
	}

	if config.WrapperrCustomize.GetYearStatsMusicDurationTitle == "" {
		config.WrapperrCustomize.GetYearStatsMusicDurationTitle = config_default.WrapperrCustomize.GetYearStatsMusicDurationTitle
	}

	if config.WrapperrCustomize.GetYearStatsDurationSumTitle == "" {
		config.WrapperrCustomize.GetYearStatsDurationSumTitle = config_default.WrapperrCustomize.GetYearStatsDurationSumTitle
	}

	if config.WrapperrCustomize.WrapperrAnd == "" {
		config.WrapperrCustomize.WrapperrAnd = config_default.WrapperrCustomize.WrapperrAnd
	}

	if config.WrapperrCustomize.WrapperrPlay == "" {
		config.WrapperrCustomize.WrapperrPlay = config_default.WrapperrCustomize.WrapperrPlay
	}

	if config.WrapperrCustomize.WrapperrPlayPlural == "" {
		config.WrapperrCustomize.WrapperrPlayPlural = config_default.WrapperrCustomize.WrapperrPlayPlural
	}

	if config.WrapperrCustomize.WrapperrDay == "" {
		config.WrapperrCustomize.WrapperrDay = config_default.WrapperrCustomize.WrapperrDay
	}

	if config.WrapperrCustomize.WrapperrDayPlural == "" {
		config.WrapperrCustomize.WrapperrDayPlural = config_default.WrapperrCustomize.WrapperrDayPlural
	}

	if config.WrapperrCustomize.WrapperrHour == "" {
		config.WrapperrCustomize.WrapperrHour = config_default.WrapperrCustomize.WrapperrHour
	}

	if config.WrapperrCustomize.WrapperrHourPlural == "" {
		config.WrapperrCustomize.WrapperrHourPlural = config_default.WrapperrCustomize.WrapperrHourPlural
	}

	if config.WrapperrCustomize.WrapperrMinute == "" {
		config.WrapperrCustomize.WrapperrMinute = config_default.WrapperrCustomize.WrapperrMinute
	}

	if config.WrapperrCustomize.WrapperrMinutePlural == "" {
		config.WrapperrCustomize.WrapperrMinutePlural = config_default.WrapperrCustomize.WrapperrMinutePlural
	}

	if config.WrapperrCustomize.WrapperrSecond == "" {
		config.WrapperrCustomize.WrapperrSecond = config_default.WrapperrCustomize.WrapperrSecond
	}

	if config.WrapperrCustomize.WrapperrSecondPlural == "" {
		config.WrapperrCustomize.WrapperrSecondPlural = config_default.WrapperrCustomize.WrapperrSecondPlural
	}

	if config.WrapperrCustomize.WrapperrSortPlays == "" {
		config.WrapperrCustomize.WrapperrSortPlays = config_default.WrapperrCustomize.WrapperrSortPlays
	}

	if config.WrapperrCustomize.WrapperrSortDuration == "" {
		config.WrapperrCustomize.WrapperrSortDuration = config_default.WrapperrCustomize.WrapperrSortDuration
	}

	// Save new version of config json
	err = SaveConfig(&config)
	if err != nil {
		return nil, err
	}

	// Return config object
	return &config, nil
}
