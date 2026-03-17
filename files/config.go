package files

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/aunefyren/wrapperr/models"

	"github.com/google/uuid"
)

const wrapperr_version_parameter = "{{RELEASE_TAG}}"
const minSecretKeySize = 32

var config_path, _ = filepath.Abs("./config/config.json")
var default_config_path, _ = filepath.Abs("./files/configDefault.json")
var certPath, _ = filepath.Abs("./config/cert.pem")
var certKeyPath, _ = filepath.Abs("./config/key.pem")
var timezonesPath, _ = filepath.Abs("./files/timezones.json")

// migrationFn takes raw config JSON and returns transformed JSON
// each function is responsible for bumping "wrapperr_version" to the target version
type migrationFn func([]byte) ([]byte, error)

// migrations is the ordered chain of version-to-version migrations
// each entry defines the version a config must currently be at to apply that step
// add new entries here as the project evolves
var migrations = []struct {
	targetVersion string
	fn            migrationFn
}{
	// v3.0.0 and earlier used a single tautulli_config object instead of an array.
	// ConvertLegacyToCurrentConfig previously handled this via a separate code path
	{"", migrateV0toV3_1_0},
	{"v3.0.4", migrateV0toV3_1_0},
	{"v3.2.10", migrateV3_2_0toV3_3_0},
}

// migrateConfig walks the migration chain, applying each applicable step in order
// it reads "wrapperr_version" after every step to advance through the chain correctly
func migrateConfig(data []byte) ([]byte, error) {
	for {
		var versioned struct {
			Version string `json:"wrapperr_version"`
		}
		if err := json.Unmarshal(data, &versioned); err != nil {
			return nil, err
		}

		// dev mode release tag
		if strings.EqualFold(versioned.Version, "{{RELEASE_TAG}}") {
			return data, nil
		}

		applied := false
		for _, m := range migrations {
			if versionLessThan(versioned.Version, m.targetVersion) {
				log.Printf("Migrating config from %s to %s", versioned.Version, m.targetVersion)
				var err error
				data, err = m.fn(data)
				if err != nil {
					return nil, err
				}
				applied = true
				break
			}
		}

		if !applied {
			return data, nil
		}
	}
}

// checks if version a is older than b
func versionLessThan(a, b string) bool {
	return compareVersions(a, b) < 0
}

// checks if version are the same, older or newer
func compareVersions(a, b string) int {
	aParts := parseVersion(a)
	bParts := parseVersion(b)
	for i := range bParts {
		if aParts[i] != bParts[i] {
			if aParts[i] < bParts[i] {
				return -1
			}
			return 1
		}
	}
	return 0
}

// parses a v3.2.1 version string into parts
func parseVersion(v string) [3]int {
	v = strings.TrimPrefix(v, "v")
	var major, minor, patch int
	fmt.Sscanf(v, "%d.%d.%d", &major, &minor, &patch)
	return [3]int{major, minor, patch}
}

// migrateV0toV310 converts the old single tautulli_config object into the
// tautulli_config array introduced in v3.1.0
func migrateV0toV3_1_0(data []byte) ([]byte, error) {
	newVersion := "v3.1.0"

	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}

	// if tautulli_config is already an array, nothing to do
	var probe []json.RawMessage
	if err := json.Unmarshal(raw["tautulli_config"], &probe); err == nil {
		// Already an array — just bump the version.
		raw["wrapperr_version"], _ = json.Marshal(newVersion)
		return json.Marshal(raw)
	}

	// it is a single object, wrap it in an array
	var legacy models.TautulliConfigLegacy
	if err := json.Unmarshal(raw["tautulli_config"], &legacy); err != nil {
		return nil, err
	}

	modern := models.TautulliConfig{
		TautulliApiKey:    legacy.TautulliApiKey,
		TautulliIP:        legacy.TautulliIP,
		TautulliLibraries: legacy.TautulliLibraries,
		TautulliRoot:      legacy.TautulliRoot,
		TautulliGrouping:  legacy.TautulliGrouping,
		TautulliHttps:     legacy.TautulliHttps,
		TautulliLength:    legacy.TautulliLength,
		TautulliPort:      legacy.TautulliPort,
		TautulliName:      "Server 1",
	}

	newArray, err := json.Marshal([]models.TautulliConfig{modern})
	if err != nil {
		return nil, err
	}

	raw["tautulli_config"] = newArray
	raw["wrapperr_version"], _ = json.Marshal(newVersion)

	log.Printf("Migrated tautulli_config from single object to array (%s).", newVersion)
	return json.Marshal(raw)
}

// converts obfuscate_other_users from bool to string.
func migrateV3_2_0toV3_3_0(data []byte) ([]byte, error) {
	newVersion := "v3.3.0"

	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}

	customizeRaw, exists := raw["wrapperr_customize"]
	if !exists {
		raw["wrapperr_version"], _ = json.Marshal(newVersion)
		return json.Marshal(raw)
	}

	var customize map[string]json.RawMessage
	if err := json.Unmarshal(customizeRaw, &customize); err != nil {
		return nil, err
	}

	if obfuscateRaw, exists := customize["obfuscate_other_users"]; exists {
		var boolValue bool
		if err := json.Unmarshal(obfuscateRaw, &boolValue); err == nil {
			// it is still a bool, convert to string.
			newValue := "friendly_name"
			if boolValue {
				newValue = "obfuscate"
			}
			customize["obfuscate_other_users"], _ = json.Marshal(newValue)
			log.Printf("Migrated obfuscate_other_users bool to string: %q (%s).", newValue, newVersion)

			newCustomize, err := json.Marshal(customize)
			if err != nil {
				return nil, err
			}
			raw["wrapperr_customize"] = newCustomize
		}
	}

	raw["wrapperr_version"], _ = json.Marshal(newVersion)
	return json.Marshal(raw)
}

// check if the config file has been configured for usage
func GetConfigState() (bool, error) {

	// check if an admin is configured. Wrapperr must be claimed by an admin to function.
	admin, err := GetAdminState()
	if err != nil {
		log.Println("Get config state threw error trying to validate admin state.")
		return false, err
	} else if !admin {
		return false, nil
	}

	// retrieve config object from function
	config, err := GetConfig()
	if err != nil {
		log.Println("Get config state threw error trying to retrieve config.")
		return false, err
	}

	// check if certain parameters are set
	// these are essential parameters the user must configure for basic functionality
	if config.TautulliConfig[0].TautulliApiKey != "" && config.TautulliConfig[0].TautulliIP != "" && config.TautulliConfig[0].TautulliLength != 0 && config.Timezone != "" && config.WrappedStart != 0 && config.WrappedEnd != 0 && config.WrapperrVersion != "" {
		return true, nil
	} else {
		return false, nil
	}
}

// get private key from the config file
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

// update private key to random string
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
func SaveConfig(config models.WrapperrConfig) (err error) {
	err = nil

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

	var config models.WrapperrConfig

	// Define default boolean values since they are harder to separate from deliberate boolean values
	config.UseCache = true
	config.PlexAuth = true
	config.UseLogs = true
	config.DisableAdminPage = false

	var tautulli_config = models.TautulliConfig{
		TautulliGrouping: true,
		TautulliPort:     80,
		TautulliLength:   5000,
	}
	config.TautulliConfig = append(config.TautulliConfig, tautulli_config)

	config.CreateShareLinks = true
	config.WinterTheme = true
	config.BasicAuth = false
	config.WrappedDynamic = false
	config.WrappedDynamicDays = 0
	config.WrapperrCustomize.StatsTopListLength = 10
	config.WrapperrCustomize.ObfuscateOtherUsers = "obfuscate"
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
	config.WrapperrCustomize.GetYearStatsLeaderboardNumbers = false

	err := SaveConfig(config)
	if err != nil {
		return err
	}

	return nil
}

// Read the config file and return the file as an object
func GetConfig() (config models.WrapperrConfig, err error) {
	config = models.WrapperrConfig{}
	err = nil

	// Create config.json if it doesn't exist
	if _, err := os.Stat(config_path); errors.Is(err, os.ErrNotExist) {
		log.Println("Config file does not exist. Creating.")

		err = CreateConfigFile()
		if err != nil {
			log.Println("Failed to create config file. Error: " + err.Error())
			return config, errors.New("Failed to create config file.")
		}
	}

	// load config file
	file, err := os.ReadFile(config_path)
	if err != nil {
		log.Println("Failed to read file. Error: " + err.Error())
		return config, errors.New("Failed to read file.")
	}

	// run the migration chain
	file, err = migrateConfig(file)
	if err != nil {
		// migration failed, back up the broken config and fall back to the default
		log.Println("Config migration failed: " + err.Error())

		new_save_loc, backupErr := BackUpConfig(config_path)
		if backupErr != nil {
			log.Println("Failed to back up config file: " + backupErr.Error())
			return config, err
		}
		log.Println("Backed up un-migrateable config to '" + new_save_loc + "'. Loading default.")

		file, err = os.ReadFile(default_config_path)
		if err != nil {
			log.Println("Failed to read file after migration. Error: " + err.Error())
			return config, errors.New("Failed to read file after migration.")
		}
	}

	// unmarshal into the current struct, shape is guaranteed correct after migration
	config = models.WrapperrConfig{}
	if err = json.Unmarshal(file, &config); err != nil {
		log.Println("Failed to unmarshal file. Error: " + err.Error())
		return config, errors.New("Failed to unmarshal file.")
	}

	// Load default config file for filling in missing/empty values
	defaultFile, err := os.ReadFile(default_config_path)
	if err != nil {
		log.Println("Get config file threw error trying to open the template file.")
		return config, err
	}

	config_default := models.WrapperrConfig{}
	if err = json.Unmarshal(defaultFile, &config_default); err != nil {
		log.Println("Get config file threw error trying to parse the template file.")
		return config, err
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

	// If there is no time zone, set it to Europe/Paris (defined in the default template)
	if config.Timezone == "" {
		config.Timezone = config_default.Timezone
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
		config.WrappedEnd = config_default.WrappedEnd
	}

	if config.TautulliConfig == nil || len(config.TautulliConfig) == 0 {

		log.Println("Tautulli server array is empty, adding a new one.")

		config.TautulliConfig = []models.TautulliConfig{}

		NewTautulliConfig := models.TautulliConfig{
			TautulliLength: config_default.TautulliConfig[0].TautulliLength,
			TautulliPort:   config_default.TautulliConfig[0].TautulliPort,
		}

		config.TautulliConfig = append(config.TautulliConfig, NewTautulliConfig)
	}

	// Set Tautulli length to 5000 if zero is set
	if config.TautulliConfig[0].TautulliLength == 0 {
		log.Println("Tautulli item length on server number 1 is 0, replacing with 5000.")
		config.TautulliConfig[0].TautulliLength = config_default.TautulliConfig[0].TautulliLength
	}

	// Set Tautulli port to 80 if zero is set
	if config.TautulliConfig[0].TautulliPort == 0 {
		log.Println("Tautulli port on server number 1 is 0, replacing with 80.")
		config.TautulliConfig[0].TautulliPort = config_default.TautulliConfig[0].TautulliPort
	}

	config, err = VerifyNonEmptyCustomValues(config, config_default)
	if err != nil {
		return config, err
	}

	// Save new version of config json
	err = SaveConfig(config)
	if err != nil {
		return config, err
	}

	// Return config object
	return config, nil
}

func BackUpConfig(ConfigPath string) (string, error) {
	new_save_loc := ConfigPath + "." + uuid.NewString() + ".replaced"
	err := os.Rename(config_path, new_save_loc)
	if err != nil {
		return "", err
	}
	return new_save_loc, nil
}

// verify values and replace empty ones
func VerifyNonEmptyCustomValues(config models.WrapperrConfig, config_default models.WrapperrConfig) (models.WrapperrConfig, error) {

	if config.WrapperrCustomize.StatsTopListLength < 0 {
		config.WrapperrCustomize.StatsTopListLength = config_default.WrapperrCustomize.StatsTopListLength
	}

	if config.WrapperrCustomize.WrapperrFrontPageTitle == "" {
		config.WrapperrCustomize.WrapperrFrontPageTitle = config_default.WrapperrCustomize.WrapperrFrontPageTitle
	}

	if config.WrapperrCustomize.WrapperrFrontPageSubtitle == "" {
		config.WrapperrCustomize.WrapperrFrontPageSubtitle = config_default.WrapperrCustomize.WrapperrFrontPageSubtitle
	}

	if config.WrapperrCustomize.WrapperrFrontPageSearchTitle == "" {
		config.WrapperrCustomize.WrapperrFrontPageSearchTitle = config_default.WrapperrCustomize.WrapperrFrontPageSearchTitle
	}

	if config.WrapperrCustomize.StatsIntroTitle == "" {
		config.WrapperrCustomize.StatsIntroTitle = config_default.WrapperrCustomize.StatsIntroTitle
	}

	if config.WrapperrCustomize.StatsIntroSubtitle == "" {
		config.WrapperrCustomize.StatsIntroSubtitle = config_default.WrapperrCustomize.StatsIntroSubtitle
	}

	if config.WrapperrCustomize.StatsOutroTitle == "" {
		config.WrapperrCustomize.StatsOutroTitle = config_default.WrapperrCustomize.StatsOutroTitle
	}

	if config.WrapperrCustomize.StatsOutroSubtitle == "" {
		config.WrapperrCustomize.StatsOutroSubtitle = config_default.WrapperrCustomize.StatsOutroSubtitle
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

	return config, nil

}

func GetCertPaths() (string, string) {
	return certPath, certKeyPath
}

// Get private key from the config file
func CheckCertFiles() (certFound bool) {
	certFound = false

	// Create config.json if it doesn't exist
	if _, err := os.Stat(certPath); errors.Is(err, os.ErrNotExist) {
		return
	}

	if _, err := os.Stat(certKeyPath); errors.Is(err, os.ErrNotExist) {
		return
	}

	certFound = true
	return
}

func GetTimezones() (timezones models.Timezones, err error) {
	timezones = models.Timezones{}
	err = nil

	// Load config file
	file, err := os.ReadFile(timezonesPath)
	if err != nil {
		return timezones, err
	}

	// Parse config file
	err = json.Unmarshal(file, &timezones)
	if err != nil {
		return timezones, err
	}

	return
}
