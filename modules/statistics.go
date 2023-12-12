package modules

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/models"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/goombaio/namegenerator"
	"github.com/patrickmn/sortutil"
)

func GetWrapperStatistics(user_name string, user_friendlyname string, user_id int, user_email string, config models.WrapperrConfig, adminConfig models.AdminConfig, cachingMode bool, cacheLimit int) (wrapperrReply models.WrapperrStatisticsReply, cachingComplete *bool, err error) {
	log.Println("Getting stats for: " + user_name + " " + user_friendlyname + " " + strconv.Itoa(user_id) + " " + user_email)

	wrapperrReply = models.WrapperrStatisticsReply{
		Message: "Statistics retrieved.",
		Error:   false,
	}
	err = nil
	cachingComplete = nil

	// Create empty array object for each day in Wrapped period. If cache is enabled, call GetCache() and replace the empty object.
	wrapperr_data := []models.WrapperrDay{}
	if config.UseCache {
		wrapperr_data, err = files.GetCache()
		if err != nil {
			log.Println("Failed to load cache file. Error: " + err.Error())
			return wrapperrReply, cachingComplete, errors.New("Failed to load cache file.")
		}
	}

	log.Println("Cache stage completed for " + user_name + ".")

	// Download/refresh data-set from Tautulli
	wrapperr_data, wrapperr_data_complete, err := WrapperrDownloadDays(user_id, wrapperr_data, cacheLimit, config)
	if err != nil {
		log.Println("Failed to download data for wrapping. Error: " + err.Error())
		return wrapperrReply, cachingComplete, errors.New("Failed to download data for wrapping.")
	}

	log.Println("Tautulli refresh/download stage completed.")

	// If cache is enabled, send the object to SaveCache() for later use.
	if config.UseCache {
		err = files.SaveCache(&wrapperr_data)
		if err != nil {
			log.Println("Failed to save new cache file for " + user_name + " (" + strconv.Itoa(user_id) + "). Error: " + err.Error())
			return wrapperrReply, cachingComplete, errors.New("Failed to save new cache file for " + user_name + " (" + strconv.Itoa(user_id) + ").")
		}
	}

	// If caching mode is in use, stop the process here and return the result to the user
	if cachingMode {
		return wrapperrReply, &wrapperr_data_complete, nil
	}

	// Create reply object
	var wrapperr_reply models.WrapperrStatisticsReply
	wrapperr_reply.User.ID = user_id
	wrapperr_reply.User.Name = user_name
	wrapperr_reply.User.FriendlyName = user_friendlyname
	wrapperr_reply.Date = time.Now().Format("2006-01-02")
	wrapperr_reply.Message = "Statistics retrieved."

	// Loop through Wrapperr data and format reply
	wrapperrReply, err = WrapperrLoopData(user_id, config, wrapperr_data, wrapperr_reply)
	if err != nil {
		log.Println("Failed to wrap data. Error: " + err.Error())
		return wrapperrReply, cachingComplete, errors.New("Failed to wrap data.")
	}

	return wrapperrReply, cachingComplete, err
}

func WrapperrDownloadDays(ID int, wrapperr_data []models.WrapperrDay, loop_interval int, config models.WrapperrConfig) ([]models.WrapperrDay, bool, error) {

	// Define variables
	var complete_date_loop bool = true
	var use_loop_interval bool = true
	var found_date bool = false
	var found_date_index int = 0

	ignoredUserIDSArray, err := UsersGetIgnoredUserIDs()
	if err != nil {
		log.Println("Failed to get ignored users. Error: " + err.Error())
		return []models.WrapperrDay{}, false, errors.New("Failed to get ignored users.")
	}

	// If loop_interval is less than one, do not utilize the loop interval and set use_loop_interval to false
	if loop_interval < 1 {
		use_loop_interval = false
	}

	// Go through each Tautulli server
	for q := 0; q < len(config.TautulliConfig); q++ {

		// Log Tautulli server
		log.Println("Checking Tautulli server '" + config.TautulliConfig[q].TautulliName + "'.")

		// Define object with end date from wrapped period
		end_loop_date := time.Unix(int64(config.WrappedEnd), 0)

		// Split the string containing libraries. If the result is zero, set the first object in the array to an empty string
		libraries := strings.Split(config.TautulliConfig[q].TautulliLibraries, ",")
		if len(libraries) < 1 {
			libraries[0] = ""
		}

		// Create a date time object containing the beginning of the wrapped period. If that date time object is before the end_loop_date variable, keep adding one day, each iteration
		for loop_time := time.Unix(int64(config.WrappedStart), 0); !loop_time.After(end_loop_date); loop_time = loop_time.AddDate(0, 0, 1) {

			// Define string variable with current iteration date and variable with date time containing the current local time
			current_loop_date := loop_time.Format("2006-01-02")
			now := time.Now()

			// Stop if time has reached current time or end loop date
			if loop_time.After(now) || loop_time.After(end_loop_date) {
				break
			}

			// Clean array to populate with results
			wrapperr_day := models.WrapperrDay{
				Date:            current_loop_date,
				Data:            nil,
				DataComplete:    true,
				TautulliServers: []string{},
			}

			// Declare variables to populate
			found_date = false
			found_date_index = 0
			tautulli_server_processed := false

			// Go through all dates in current dataset
			for j := 0; j < len(wrapperr_data); j++ {

				// Parse current date string
				time_temp, err := time.Parse("2006-01-02", wrapperr_data[j].Date)
				if err != nil {
					log.Println(err)
				}

				// If current date in the dataset is current processing date
				if time_temp.Format("2006-01-02") == loop_time.Format("2006-01-02") {
					// Keep index, save bool as true,
					found_date_index = j
					found_date = true

					// Look at processed servers for current server
					for y := 0; y < len(wrapperr_data[j].TautulliServers); y++ {
						if wrapperr_data[j].TautulliServers[y] == config.TautulliConfig[q].TautulliName {
							tautulli_server_processed = true
						}
					}

					// Keep current dataset
					wrapperr_day = wrapperr_data[j]

					// Stop looking
					break
				}

			}

			if found_date && wrapperr_data[found_date_index].DataComplete && tautulli_server_processed {

				// Found the date, the data is complete and the server is processed for the day. Skip.
				continue

			} else if found_date && !wrapperr_data[found_date_index].DataComplete {

				// The date is found, the data is not complete
				log.Println("Date " + current_loop_date + " from server '" + config.TautulliConfig[q].TautulliName + "' marked as incomplete in cache. Refreshing.")

				// Remove processed server to ensure re-processing by all servers
				wrapperr_day.TautulliServers = []string{}

			} else if !found_date || !tautulli_server_processed {

				// No data found, download with empty dataset
				log.Println("Downloading day: " + current_loop_date + " from server '" + config.TautulliConfig[q].TautulliName + "'.")

			} else {

				// Something is wrong. Quit.
				log.Println("Unknown date error from server '" + config.TautulliConfig[q].TautulliName + "'. Skipping.")
				continue

			}

			// Loop through selected libraries for Tautullli API calls
			for library_loop := 0; library_loop < len(libraries); library_loop++ {

				var library_str string = ""
				var grouping string = ""

				// If no libraries are selected do not specify one in API call to Tautulli
				if libraries[library_loop] == "" {
					library_str = ""
				} else {
					library_str = "&section_id=" + strings.TrimSpace(libraries[library_loop])
				}

				// Create string for selecting grouping feature in API call
				if config.TautulliConfig[q].TautulliGrouping {
					grouping = "1"
				} else {
					grouping = "0"
				}

				// Get data from Tautulli for server, day, and library
				tautulli_data, err := TautulliDownloadStatistics(config.TautulliConfig[q].TautulliPort, config.TautulliConfig[q].TautulliIP, config.TautulliConfig[q].TautulliHttps, config.TautulliConfig[q].TautulliRoot, config.TautulliConfig[q].TautulliApiKey, config.TautulliConfig[q].TautulliLength, library_str, grouping, current_loop_date)
				if err != nil {
					log.Println("Failed to download data for date from Tautulli API. Error: " + err.Error())
					log.Println("Skipping day on current server.")
					continue
				}

				// Loop through retrieved data from Tautulli
				for j := 0; j < len(tautulli_data); j++ {
					if tautulli_data[j].MediaType == "movie" || tautulli_data[j].MediaType == "episode" || tautulli_data[j].MediaType == "track" {

						// If the data is generated by an ignored user, skip the data
						ignoreData := false
						for u := 0; u < len(ignoredUserIDSArray); u++ {
							if ignoredUserIDSArray[u] == tautulli_data[j].UserID {
								ignoreData = true
							}
						}
						if ignoreData {
							continue
						}

						if tautulli_data[j].FullTitle == nil ||
							tautulli_data[j].GrandparentRatingKey == nil ||
							tautulli_data[j].GrandparentTitle == nil ||
							tautulli_data[j].OriginalTitle == nil ||
							tautulli_data[j].ParentRatingKey == nil ||
							tautulli_data[j].ParentTitle == nil ||
							tautulli_data[j].RatingKey == nil ||
							tautulli_data[j].Title == nil ||
							tautulli_data[j].OriginallyAvailableAt == nil {
							log.Println("Tautulli item has missing data point(s). Unable to process statistics. Skipping data.")
							continue
						}

						// Translate data to own struct
						tautulli_entry := models.TautulliEntry{
							Date:                  tautulli_data[j].Date,
							RowID:                 tautulli_data[j].RowID,
							Duration:              tautulli_data[j].Duration,
							FriendlyName:          tautulli_data[j].FriendlyName,
							FullTitle:             *tautulli_data[j].FullTitle,
							GrandparentRatingKey:  *tautulli_data[j].GrandparentRatingKey,
							GrandparentTitle:      *tautulli_data[j].GrandparentTitle,
							OriginalTitle:         *tautulli_data[j].OriginalTitle,
							MediaType:             tautulli_data[j].MediaType,
							ParentRatingKey:       *tautulli_data[j].ParentRatingKey,
							ParentTitle:           *tautulli_data[j].ParentTitle,
							PausedCounter:         tautulli_data[j].PausedCounter,
							PercentComplete:       tautulli_data[j].PercentComplete,
							RatingKey:             *tautulli_data[j].RatingKey,
							Title:                 *tautulli_data[j].Title,
							User:                  tautulli_data[j].User,
							UserID:                tautulli_data[j].UserID,
							Year:                  tautulli_data[j].Year,
							OriginallyAvailableAt: *tautulli_data[j].OriginallyAvailableAt,
						}

						// Append to day data
						wrapperr_day.Data = append(wrapperr_day.Data, tautulli_entry)
					}
				}

			}

			// If the date is the current day, mark as incomplete so it can be refreshed the next time
			if loop_time.Format("2006-01-02") == now.Format("2006-01-02") {
				wrapperr_day.DataComplete = false
			}

			// Add current Tautulli server to processed servers for this day
			if wrapperr_day.TautulliServers == nil || len(wrapperr_day.TautulliServers) == 0 {
				var servers []string
				servers = append(servers, config.TautulliConfig[q].TautulliName)
				wrapperr_day.TautulliServers = servers
			} else {
				wrapperr_day.TautulliServers = append(wrapperr_day.TautulliServers, config.TautulliConfig[q].TautulliName)
			}

			// If found in dataset, update the values. if not found, append to dataset array.
			if found_date {
				wrapperr_data[found_date_index] = wrapperr_day
			} else {
				wrapperr_data = append(wrapperr_data, wrapperr_day)
			}

			// Change the loop interval to change date
			if loop_interval > 0 && use_loop_interval {
				loop_interval -= 1
			}

			// If loop interval is enabled, and reached 0, break the for loop and mark the data download as incomplete
			if loop_interval == 0 && use_loop_interval {
				complete_date_loop = false
				break
			}

		}

		// If loop interval is enabled, and reached 0, break the for loop and mark the data download as incomplete
		if loop_interval == 0 && use_loop_interval {
			complete_date_loop = false
			break
		}

	}

	return wrapperr_data, complete_date_loop, nil
}

func WrapperrLoopData(user_id int, config models.WrapperrConfig, wrapperr_data []models.WrapperrDay, wrapperr_reply models.WrapperrStatisticsReply) (models.WrapperrStatisticsReply, error) {

	end_loop_date := time.Unix(int64(config.WrappedEnd), 0)
	start_loop_date := time.Unix(int64(config.WrappedStart), 0)
	top_list_limit := config.WrapperrCustomize.StatsTopListLength

	var wrapperr_user_movie []models.TautulliEntry
	var wrapperr_user_episode []models.TautulliEntry
	var wrapperr_user_show []models.TautulliEntry
	var wrapperr_user_track []models.TautulliEntry
	var wrapperr_user_album []models.TautulliEntry
	var wrapperr_user_artist []models.TautulliEntry
	var wrapperr_year_user []models.WrapperrYearUserEntry
	var wrapperr_year_movie []models.TautulliEntry
	var wrapperr_year_show []models.TautulliEntry
	var wrapperr_year_artist []models.TautulliEntry

	for i := 0; i < len(wrapperr_data); i++ {

		for j := 0; j < len(wrapperr_data[i].Data); j++ {

			// Create object using datetime from history entry
			current_loop_date := time.Unix(int64(wrapperr_data[i].Data[j].Date), 0)

			// Stop if time has reached current time or end loop date
			if current_loop_date.After(end_loop_date) || current_loop_date.Before(start_loop_date) {
				break
			}

			// If the entry is a movie watched by the current user
			if config.WrapperrCustomize.GetUserMovieStats && wrapperr_data[i].Data[j].MediaType == "movie" && wrapperr_data[i].Data[j].UserID == user_id {

				// Skip entry if year is invalid (0 or some value where no movies could have been made) or duration is less than 5 min
				if wrapperr_data[i].Data[j].Year < 1750 || wrapperr_data[i].Data[j].Duration < 300 {
					continue
				}

				movie_found := false

				// Look for movie within pre-defined array
				for d := 0; d < len(wrapperr_user_movie); d++ {
					if ((wrapperr_user_movie[d].Year == wrapperr_data[i].Data[j].Year && wrapperr_data[i].Data[j].OriginallyAvailableAt == "") || wrapperr_user_movie[d].OriginallyAvailableAt == wrapperr_data[i].Data[j].OriginallyAvailableAt) && wrapperr_user_movie[d].Title == wrapperr_data[i].Data[j].Title {
						wrapperr_user_movie[d].Plays += 1
						wrapperr_user_movie[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_user_movie[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						movie_found = true
						break
					}
				}

				if !movie_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_user_movie = append(wrapperr_user_movie, wrapperr_data[i].Data[j])
				}

			}

			// If the entry is an episode watched by the current user
			if config.WrapperrCustomize.GetUserShowStats && wrapperr_data[i].Data[j].MediaType == "episode" && wrapperr_data[i].Data[j].UserID == user_id {

				episode_found := false
				show_found := false

				// Look for episode within pre-defined array
				for d := 0; d < len(wrapperr_user_episode); d++ {

					if ((wrapperr_user_episode[d].Year == wrapperr_data[i].Data[j].Year && wrapperr_data[i].Data[j].OriginallyAvailableAt == "") || wrapperr_user_episode[d].OriginallyAvailableAt == wrapperr_data[i].Data[j].OriginallyAvailableAt) && wrapperr_user_episode[d].Title == wrapperr_data[i].Data[j].Title && wrapperr_user_episode[d].ParentTitle == wrapperr_data[i].Data[j].ParentTitle && wrapperr_user_episode[d].GrandparentTitle == wrapperr_data[i].Data[j].GrandparentTitle {
						wrapperr_user_episode[d].Plays += 1
						wrapperr_user_episode[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_user_episode[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						episode_found = true
						break
					}
				}

				if !episode_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_user_episode = append(wrapperr_user_episode, wrapperr_data[i].Data[j])
				}

				// Look for show within pre-defined array
				for d := 0; d < len(wrapperr_user_show); d++ {
					if wrapperr_user_show[d].GrandparentTitle == wrapperr_data[i].Data[j].GrandparentTitle {
						wrapperr_user_show[d].Plays += 1
						wrapperr_user_show[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_user_show[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						show_found = true
						break
					}
				}

				if !show_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_user_show = append(wrapperr_user_show, wrapperr_data[i].Data[j])
				}

			}

			// If the entry is a track listened to by the current user
			if config.WrapperrCustomize.GetUserMusicStats && wrapperr_data[i].Data[j].MediaType == "track" && wrapperr_data[i].Data[j].UserID == user_id {

				track_found := false
				album_found := false
				artist_found := false

				// Look for track within pre-defined array
				for d := 0; d < len(wrapperr_user_track); d++ {
					if ((wrapperr_user_track[d].Year == wrapperr_data[i].Data[j].Year && wrapperr_data[i].Data[j].OriginallyAvailableAt == "") || wrapperr_user_track[d].OriginallyAvailableAt == wrapperr_data[i].Data[j].OriginallyAvailableAt) && wrapperr_user_track[d].Title == wrapperr_data[i].Data[j].Title {
						wrapperr_user_track[d].Plays += 1
						wrapperr_user_track[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_user_track[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						track_found = true
						break
					}
				}

				if !track_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_user_track = append(wrapperr_user_track, wrapperr_data[i].Data[j])
				}

				// If track has unknown album or artist, skip
				if wrapperr_data[i].Data[j].ParentTitle == "[Unknown Album]" || wrapperr_data[i].Data[j].GrandparentTitle == "[Unknown Artist]" {
					continue
				}

				// Look for album within pre-defined array
				for d := 0; d < len(wrapperr_user_album); d++ {
					if ((wrapperr_user_album[d].Year == wrapperr_data[i].Data[j].Year && wrapperr_data[i].Data[j].OriginallyAvailableAt == "") || wrapperr_user_album[d].OriginallyAvailableAt == wrapperr_data[i].Data[j].OriginallyAvailableAt) && wrapperr_user_album[d].ParentTitle == wrapperr_data[i].Data[j].ParentTitle {
						wrapperr_user_album[d].Plays += 1
						wrapperr_user_album[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_user_album[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						album_found = true
						break
					}
				}

				if !album_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_user_album = append(wrapperr_user_album, wrapperr_data[i].Data[j])
				}

				// Look for artist within pre-defined array
				for d := 0; d < len(wrapperr_user_artist); d++ {
					if wrapperr_user_artist[d].GrandparentTitle == wrapperr_data[i].Data[j].GrandparentTitle {
						wrapperr_user_artist[d].Plays += 1
						wrapperr_user_artist[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_user_artist[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						artist_found = true
						break
					}
				}

				if !artist_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_user_artist = append(wrapperr_user_artist, wrapperr_data[i].Data[j])
				}

			}

			// If the entry is a movie watched by any user and the stat setting is configured
			if config.WrapperrCustomize.GetYearStatsMovies && wrapperr_data[i].Data[j].MediaType == "movie" {

				// Skip entry if year is invalid (0 or some value where no movies could have been made) or duration is less than 5 min
				if wrapperr_data[i].Data[j].Year < 1750 || wrapperr_data[i].Data[j].Duration < 300 {
					continue
				}

				movie_found := false
				user_found := false

				// Look for movie within pre-defined array
				for d := 0; d < len(wrapperr_year_movie); d++ {
					if ((wrapperr_year_movie[d].Year == wrapperr_data[i].Data[j].Year && wrapperr_data[i].Data[j].OriginallyAvailableAt == "") || wrapperr_year_movie[d].OriginallyAvailableAt == wrapperr_data[i].Data[j].OriginallyAvailableAt) && wrapperr_year_movie[d].Title == wrapperr_data[i].Data[j].Title {
						wrapperr_year_movie[d].Plays += 1
						wrapperr_year_movie[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_year_movie[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						movie_found = true
						break
					}
				}

				// If movie was not found, add it to array
				if !movie_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_year_movie = append(wrapperr_year_movie, wrapperr_data[i].Data[j])
				}

				// Look for user within pre-defined array
				for d := 0; d < len(wrapperr_year_user); d++ {
					if wrapperr_year_user[d].UserID == wrapperr_data[i].Data[j].UserID {
						wrapperr_year_user[d].Plays += 1
						wrapperr_year_user[d].DurationMovies += wrapperr_data[i].Data[j].Duration
						wrapperr_year_user[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						user_found = true
						break
					}
				}

				// If user was not found, add it to array
				if !user_found {
					var user_entry = models.WrapperrYearUserEntry{
						Plays:          1,
						DurationMovies: wrapperr_data[i].Data[j].Duration,
						PausedCounter:  wrapperr_data[i].Data[j].PausedCounter,
						User:           wrapperr_data[i].Data[j].FriendlyName,
						UserID:         wrapperr_data[i].Data[j].UserID,
					}
					wrapperr_year_user = append(wrapperr_year_user, user_entry)
				}

			}

			// If the entry is a show watched by any user and the stat setting is configured
			if config.WrapperrCustomize.GetYearStatsShows && wrapperr_data[i].Data[j].MediaType == "episode" {

				show_found := false
				user_found := false

				// Look for show within pre-defined array
				for d := 0; d < len(wrapperr_year_show); d++ {
					if wrapperr_year_show[d].GrandparentTitle == wrapperr_data[i].Data[j].GrandparentTitle {
						wrapperr_year_show[d].Plays += 1
						wrapperr_year_show[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_year_show[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						show_found = true
						break
					}
				}

				// If show was not found, add it to array
				if !show_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_year_show = append(wrapperr_year_show, wrapperr_data[i].Data[j])
				}

				// Look for user within pre-defined array
				for d := 0; d < len(wrapperr_year_user); d++ {
					if wrapperr_year_user[d].UserID == wrapperr_data[i].Data[j].UserID {
						wrapperr_year_user[d].Plays += 1
						wrapperr_year_user[d].DurationShows += wrapperr_data[i].Data[j].Duration
						wrapperr_year_user[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						user_found = true
						break
					}
				}

				// If user was not found, add it to array
				if !user_found {
					var user_entry = models.WrapperrYearUserEntry{
						Plays:         1,
						DurationShows: wrapperr_data[i].Data[j].Duration,
						PausedCounter: wrapperr_data[i].Data[j].PausedCounter,
						User:          wrapperr_data[i].Data[j].FriendlyName,
						UserID:        wrapperr_data[i].Data[j].UserID,
					}
					wrapperr_year_user = append(wrapperr_year_user, user_entry)
				}

			}

			// If the entry is a track listened to by any user and the stat setting is configured
			if config.WrapperrCustomize.GetYearStatsMusic && wrapperr_data[i].Data[j].MediaType == "track" {

				artist_found := false
				user_found := false

				// Look for artist within pre-defined array
				for d := 0; d < len(wrapperr_year_artist); d++ {
					if wrapperr_year_artist[d].GrandparentTitle == wrapperr_data[i].Data[j].GrandparentTitle {
						wrapperr_year_artist[d].Plays += 1
						wrapperr_year_artist[d].Duration += wrapperr_data[i].Data[j].Duration
						wrapperr_year_artist[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						artist_found = true
						break
					}
				}

				// If artist was not found, add it to array
				if !artist_found {
					wrapperr_data[i].Data[j].Plays = 1
					wrapperr_year_artist = append(wrapperr_year_artist, wrapperr_data[i].Data[j])
				}

				// Look for user within pre-defined array
				for d := 0; d < len(wrapperr_year_user); d++ {
					if wrapperr_year_user[d].UserID == wrapperr_data[i].Data[j].UserID {
						wrapperr_year_user[d].Plays += 1
						wrapperr_year_user[d].DurationArtists += wrapperr_data[i].Data[j].Duration
						wrapperr_year_user[d].PausedCounter += wrapperr_data[i].Data[j].PausedCounter

						user_found = true
						break
					}
				}

				// If user was not found, add it to array
				if !user_found {
					var user_entry = models.WrapperrYearUserEntry{
						Plays:           1,
						DurationArtists: wrapperr_data[i].Data[j].Duration,
						PausedCounter:   wrapperr_data[i].Data[j].PausedCounter,
						User:            wrapperr_data[i].Data[j].FriendlyName,
						UserID:          wrapperr_data[i].Data[j].UserID,
					}
					wrapperr_year_user = append(wrapperr_year_user, user_entry)
				}

			}

		}

	}

	// Format reply for personal movie details
	if config.WrapperrCustomize.GetUserMovieStats && len(wrapperr_user_movie) > 0 {

		// Sort user movie array by duration
		sortutil.DescByField(wrapperr_user_movie, "Duration")
		count := 0
		for _, entry := range wrapperr_user_movie {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMovies.Data.MoviesDuration = append(wrapperr_reply.User.UserMovies.Data.MoviesDuration, entry)
			count += 1
		}

		// Sort user movie array by plays
		sortutil.DescByField(wrapperr_user_movie, "Plays")
		count = 0
		for _, entry := range wrapperr_user_movie {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMovies.Data.MoviesPlays = append(wrapperr_reply.User.UserMovies.Data.MoviesPlays, entry)
			count += 1
		}

		// Find longest pause
		sortutil.DescByField(wrapperr_user_movie, "PausedCounter")
		wrapperr_reply.User.UserMovies.Data.UserMovieMostPaused.Duration = wrapperr_user_movie[0].Duration
		wrapperr_reply.User.UserMovies.Data.UserMovieMostPaused.PausedCounter = wrapperr_user_movie[0].PausedCounter
		wrapperr_reply.User.UserMovies.Data.UserMovieMostPaused.Plays = wrapperr_user_movie[0].Plays
		wrapperr_reply.User.UserMovies.Data.UserMovieMostPaused.Title = wrapperr_user_movie[0].Title
		wrapperr_reply.User.UserMovies.Data.UserMovieMostPaused.Year = wrapperr_user_movie[0].Year

		// Find average movie completion, duration sum and play sum
		movie_completion_sum := 0
		movie_duration_sum := 0
		for _, entry := range wrapperr_user_movie {
			movie_completion_sum += entry.PercentComplete
			movie_duration_sum += entry.Duration
		}
		wrapperr_reply.User.UserMovies.Data.UserMovieFinishingPercent = float64(movie_completion_sum) / float64(len(wrapperr_user_movie))
		wrapperr_reply.User.UserMovies.Data.MovieDuration = movie_duration_sum
		wrapperr_reply.User.UserMovies.Data.MoviePlays = len(wrapperr_user_movie)

		// Find oldest movie
		sortutil.AscByField(wrapperr_user_movie, "Year")
		wrapperr_reply.User.UserMovies.Data.UserMovieOldest.Duration = wrapperr_user_movie[0].Duration
		wrapperr_reply.User.UserMovies.Data.UserMovieOldest.PausedCounter = wrapperr_user_movie[0].PausedCounter
		wrapperr_reply.User.UserMovies.Data.UserMovieOldest.Plays = wrapperr_user_movie[0].Plays
		wrapperr_reply.User.UserMovies.Data.UserMovieOldest.Title = wrapperr_user_movie[0].Title
		wrapperr_reply.User.UserMovies.Data.UserMovieOldest.Year = wrapperr_user_movie[0].Year

		wrapperr_reply.User.UserMovies.Message = "All movies processed."

	} else {
		wrapperr_reply.User.UserMovies.Data.MoviesDuration = []models.TautulliEntry{}
		wrapperr_reply.User.UserMovies.Data.MoviesPlays = []models.TautulliEntry{}

		wrapperr_reply.User.UserMovies.Message = "No movies processed."
	}

	// Format reply for personal show details
	if config.WrapperrCustomize.GetUserShowStats && len(wrapperr_user_show) > 0 {

		// Sort user show array by duration
		sortutil.DescByField(wrapperr_user_show, "Duration")
		count := 0
		for _, entry := range wrapperr_user_show {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserShows.Data.ShowsDuration = append(wrapperr_reply.User.UserShows.Data.ShowsDuration, entry)
			count += 1
		}

		// Sort user show array by plays
		sortutil.DescByField(wrapperr_user_show, "Plays")
		count = 0
		for _, entry := range wrapperr_user_show {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserShows.Data.ShowsPlays = append(wrapperr_reply.User.UserShows.Data.ShowsPlays, entry)
			count += 1
		}

		// Find the longest duration spent on a certain episode
		sortutil.DescByField(wrapperr_user_episode, "Duration")
		wrapperr_reply.User.UserShows.Data.EpisodeDurationLongest.Duration = wrapperr_user_episode[0].Duration
		wrapperr_reply.User.UserShows.Data.EpisodeDurationLongest.GrandparentTitle = wrapperr_user_episode[0].GrandparentTitle
		wrapperr_reply.User.UserShows.Data.EpisodeDurationLongest.ParentTitle = wrapperr_user_episode[0].ParentTitle
		wrapperr_reply.User.UserShows.Data.EpisodeDurationLongest.Plays = wrapperr_user_episode[0].Plays
		wrapperr_reply.User.UserShows.Data.EpisodeDurationLongest.Title = wrapperr_user_episode[0].Title

		// Find duration sum and play sum
		episode_duration_sum := 0
		for _, entry := range wrapperr_user_episode {
			episode_duration_sum += entry.Duration
		}
		wrapperr_reply.User.UserShows.Data.ShowDuration = episode_duration_sum
		wrapperr_reply.User.UserShows.Data.ShowPlays = len(wrapperr_user_show)

		// Find show buddy...

		wrapperr_reply.User.UserShows.Message = "All shows processed."

	} else {
		wrapperr_reply.User.UserShows.Data.ShowsDuration = []models.TautulliEntry{}
		wrapperr_reply.User.UserShows.Data.ShowsPlays = []models.TautulliEntry{}

		wrapperr_reply.User.UserShows.Message = "No shows processed."
	}

	// Format reply for personal music details
	if config.WrapperrCustomize.GetUserMusicStats && len(wrapperr_user_track) > 0 {

		// Sort user track array by duration
		sortutil.DescByField(wrapperr_user_track, "Duration")
		count := 0
		for _, entry := range wrapperr_user_track {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMusic.Data.TracksDuration = append(wrapperr_reply.User.UserMusic.Data.TracksDuration, entry)
			count += 1
		}

		// Sort user track array by plays
		sortutil.DescByField(wrapperr_user_track, "Plays")
		count = 0
		for _, entry := range wrapperr_user_track {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMusic.Data.TracksPlays = append(wrapperr_reply.User.UserMusic.Data.TracksPlays, entry)
			count += 1
		}

		// Sort user album array by duration
		sortutil.DescByField(wrapperr_user_album, "Duration")
		count = 0
		for _, entry := range wrapperr_user_album {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMusic.Data.AlbumsDuration = append(wrapperr_reply.User.UserMusic.Data.AlbumsDuration, entry)
			count += 1
		}

		// Sort user album array by plays
		sortutil.DescByField(wrapperr_user_album, "Plays")
		count = 0
		for _, entry := range wrapperr_user_album {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMusic.Data.AlbumsPlays = append(wrapperr_reply.User.UserMusic.Data.AlbumsPlays, entry)
			count += 1
		}

		// Sort user artist array by duration
		sortutil.DescByField(wrapperr_user_artist, "Duration")
		count = 0
		for _, entry := range wrapperr_user_artist {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMusic.Data.ArtistsDuration = append(wrapperr_reply.User.UserMusic.Data.ArtistsDuration, entry)
			count += 1
		}

		// Sort user artist array by plays
		sortutil.DescByField(wrapperr_user_artist, "Plays")
		count = 0
		for _, entry := range wrapperr_user_artist {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.User.UserMusic.Data.ArtistsPlays = append(wrapperr_reply.User.UserMusic.Data.ArtistsPlays, entry)
			count += 1
		}

		// Find duration sum and play sum
		track_duration_sum := 0
		for _, entry := range wrapperr_user_track {
			track_duration_sum += entry.Duration
		}
		wrapperr_reply.User.UserMusic.Data.TrackDuration = track_duration_sum
		wrapperr_reply.User.UserMusic.Data.TrackPlays = len(wrapperr_user_track)

		// Find oldest album
		sortutil.AscByField(wrapperr_user_album, "Year")
		var oldest_album_index = 0
		for d := 0; d < len(wrapperr_user_album); d++ {
			if wrapperr_user_album[d].Year > 1000 {
				oldest_album_index = d
				break
			}
		}
		wrapperr_reply.User.UserMusic.Data.UserAlbumOldest.Duration = wrapperr_user_album[oldest_album_index].Duration
		wrapperr_reply.User.UserMusic.Data.UserAlbumOldest.GrandparentTitle = wrapperr_user_album[oldest_album_index].GrandparentTitle
		wrapperr_reply.User.UserMusic.Data.UserAlbumOldest.ParentTitle = wrapperr_user_album[oldest_album_index].ParentTitle
		wrapperr_reply.User.UserMusic.Data.UserAlbumOldest.Plays = wrapperr_user_album[oldest_album_index].Plays
		wrapperr_reply.User.UserMusic.Data.UserAlbumOldest.Year = wrapperr_user_album[oldest_album_index].Year

		wrapperr_reply.User.UserMusic.Message = "All tracks processed."

	} else {
		wrapperr_reply.User.UserMusic.Data.TracksDuration = []models.TautulliEntry{}
		wrapperr_reply.User.UserMusic.Data.TracksPlays = []models.TautulliEntry{}

		wrapperr_reply.User.UserMusic.Message = "No tracks processed."
	}

	// Format reply for universal movie details
	if config.WrapperrCustomize.GetYearStatsMovies && len(wrapperr_year_movie) > 0 {

		// Sort year movie array by duration
		sortutil.DescByField(wrapperr_year_movie, "Duration")
		count := 0
		for _, entry := range wrapperr_year_movie {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearMovies.Data.MoviesDuration = append(wrapperr_reply.YearStats.YearMovies.Data.MoviesDuration, entry)
			count += 1
		}

		// Sort year movie array by plays
		sortutil.DescByField(wrapperr_year_movie, "Plays")
		count = 0
		for _, entry := range wrapperr_year_movie {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearMovies.Data.MoviesPlays = append(wrapperr_reply.YearStats.YearMovies.Data.MoviesPlays, entry)
			count += 1
		}

		// Find duration sum and play sum
		movie_duration_sum := 0
		movie_play_sum := 0
		for _, entry := range wrapperr_year_movie {
			movie_play_sum += entry.Plays
			movie_duration_sum += entry.Duration
		}
		wrapperr_reply.YearStats.YearMovies.Data.MovieDuration = movie_duration_sum
		wrapperr_reply.YearStats.YearMovies.Data.MoviePlays = movie_play_sum

		wrapperr_reply.YearStats.YearMovies.Message = "All movies processed."

	} else {
		wrapperr_reply.YearStats.YearMovies.Data.MoviesDuration = []models.TautulliEntry{}
		wrapperr_reply.YearStats.YearMovies.Data.MoviesPlays = []models.TautulliEntry{}

		wrapperr_reply.YearStats.YearMovies.Message = "No movies processed."
	}

	// Format reply for universal show details
	if config.WrapperrCustomize.GetYearStatsShows && len(wrapperr_year_show) > 0 {

		// Sort year show array by duration
		sortutil.DescByField(wrapperr_year_show, "Duration")
		count := 0
		for _, entry := range wrapperr_year_show {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearShows.Data.ShowsDuration = append(wrapperr_reply.YearStats.YearShows.Data.ShowsDuration, entry)
			count += 1
		}

		// Sort year show array by plays
		sortutil.DescByField(wrapperr_year_show, "Plays")
		count = 0
		for _, entry := range wrapperr_year_show {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearShows.Data.ShowsPlays = append(wrapperr_reply.YearStats.YearShows.Data.ShowsPlays, entry)
			count += 1
		}

		// Find duration sum and play sum
		show_duration_sum := 0
		show_play_sum := 0
		for _, entry := range wrapperr_year_show {
			show_play_sum += entry.Plays
			show_duration_sum += entry.Duration
		}
		wrapperr_reply.YearStats.YearShows.Data.ShowDuration = show_duration_sum
		wrapperr_reply.YearStats.YearShows.Data.ShowPlays = show_play_sum

		wrapperr_reply.YearStats.YearShows.Message = "All shows processed."

	} else {
		wrapperr_reply.YearStats.YearShows.Data.ShowsDuration = []models.TautulliEntry{}
		wrapperr_reply.YearStats.YearShows.Data.ShowsPlays = []models.TautulliEntry{}

		wrapperr_reply.YearStats.YearShows.Message = "No shows processed."
	}

	// Format reply for universal artist details
	if config.WrapperrCustomize.GetYearStatsMusic && len(wrapperr_year_artist) > 0 {

		// Sort year artist array by duration
		sortutil.DescByField(wrapperr_year_artist, "Duration")
		count := 0
		for _, entry := range wrapperr_year_artist {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearMusic.Data.ArtistsDuration = append(wrapperr_reply.YearStats.YearMusic.Data.ArtistsDuration, entry)
			count += 1
		}

		// Sort year artist array by plays
		sortutil.DescByField(wrapperr_year_artist, "Plays")
		count = 0
		for _, entry := range wrapperr_year_artist {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearMusic.Data.ArtistsPlays = append(wrapperr_reply.YearStats.YearMusic.Data.ArtistsPlays, entry)
			count += 1
		}

		// Find duration sum and play sum
		music_duration_sum := 0
		music_play_sum := 0
		for _, entry := range wrapperr_year_artist {
			music_play_sum += entry.Plays
			music_duration_sum += entry.Duration
		}
		wrapperr_reply.YearStats.YearMusic.Data.MusicDuration = music_duration_sum
		wrapperr_reply.YearStats.YearMusic.Data.MusicPlays = music_play_sum

		wrapperr_reply.YearStats.YearMusic.Message = "All tracks processed."

	} else {
		wrapperr_reply.YearStats.YearMusic.Data.ArtistsDuration = []models.TautulliEntry{}
		wrapperr_reply.YearStats.YearMusic.Data.ArtistsPlays = []models.TautulliEntry{}

		wrapperr_reply.YearStats.YearMusic.Message = "No tracks processed."
	}

	// Create userID to obfuscated name struct
	type obfuscatedUser struct {
		userID  int
		newName string
	}
	// Create array to store userIDs and their obfucasted name
	obfuscateCatalog := []obfuscatedUser{}

	// Create name generator engine
	seed := time.Now().UTC().UnixNano()
	nameGenerator := namegenerator.NewNameGenerator(seed)

	// Format reply for universal user details
	if (config.WrapperrCustomize.GetYearStatsMusic || config.WrapperrCustomize.GetYearStatsMovies || config.WrapperrCustomize.GetYearStatsShows) && config.WrapperrCustomize.GetYearStatsLeaderboard && len(wrapperr_year_user) > 0 {

		// Create new array with duration sum, then sort year users array by duration
		var wrapperr_year_user_summed []models.WrapperrYearUserEntry

		for d := 0; d < len(wrapperr_year_user); d++ {
			wrapperr_year_user[d].Duration = wrapperr_year_user[d].DurationMovies + wrapperr_year_user[d].DurationShows + wrapperr_year_user[d].DurationArtists

			if config.WrapperrCustomize.ObfuscateOtherUsers {

				// Declare variables
				var newName string
				currentUserID := wrapperr_year_user[d].UserID

				// Give new name
				if currentUserID == 0 {
					newName = "Managed user"
				} else {
					// Generate random name
					newNameGen := nameGenerator.Generate()

					// Try to improve random name
					newNameGenArray := strings.Split(newNameGen, "-")
					newNamePartOne := newNameGenArray[0]
					newNamePartTwo := newNameGenArray[1]
					newName = strings.Title(newNamePartOne) + " " + strings.Title(newNamePartTwo)
				}

				// Create obfucasted struct type
				obfuscatedUser := obfuscatedUser{
					userID:  wrapperr_year_user[d].UserID,
					newName: newName,
				}

				// Verify user is not already in catalog
				userIDFound := false
				for o := 0; o < len(obfuscateCatalog); o++ {
					if obfuscateCatalog[o].userID == currentUserID {
						userIDFound = true
						break
					}
				}

				// If not found, push to catalog
				if !userIDFound {
					obfuscateCatalog = append(obfuscateCatalog, obfuscatedUser)
				}

				// Obfuscate user in dataset if it is not themself
				if currentUserID != user_id {
					wrapperr_year_user[d].FriendlyName = newName
					wrapperr_year_user[d].User = newName
					wrapperr_year_user[d].UserID = 0
				}
			}

			wrapperr_year_user_summed = append(wrapperr_year_user_summed, wrapperr_year_user[d])
		}
		sortutil.DescByField(wrapperr_year_user, "Duration")
		count := 0
		for _, entry := range wrapperr_year_user {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearUsers.Data.UsersDuration = append(wrapperr_reply.YearStats.YearUsers.Data.UsersDuration, entry)
			count += 1
		}

		// Sort year show array by plays
		sortutil.DescByField(wrapperr_year_user, "Plays")
		count = 0
		for _, entry := range wrapperr_year_user {
			if count >= top_list_limit && top_list_limit != 0 {
				break
			}
			wrapperr_reply.YearStats.YearUsers.Data.UsersPlays = append(wrapperr_reply.YearStats.YearUsers.Data.UsersPlays, entry)
			count += 1
		}

		wrapperr_reply.YearStats.YearMovies.Message = "All users processed."

		// Scrub the data after ordering array
		if !config.WrapperrCustomize.GetYearStatsLeaderboardNumbers {
			for index, _ := range wrapperr_reply.YearStats.YearUsers.Data.UsersPlays {
				wrapperr_reply.YearStats.YearUsers.Data.UsersPlays[index].Duration = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersPlays[index].DurationArtists = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersPlays[index].DurationMovies = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersPlays[index].DurationShows = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersPlays[index].Plays = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersPlays[index].PausedCounter = 0
			}
			for index, _ := range wrapperr_reply.YearStats.YearUsers.Data.UsersDuration {
				wrapperr_reply.YearStats.YearUsers.Data.UsersDuration[index].Duration = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersDuration[index].DurationArtists = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersDuration[index].DurationMovies = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersDuration[index].DurationShows = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersDuration[index].Plays = 0
				wrapperr_reply.YearStats.YearUsers.Data.UsersDuration[index].PausedCounter = 0
			}
		}

	} else {
		wrapperr_reply.YearStats.YearUsers.Data.UsersDuration = []models.WrapperrYearUserEntry{}
		wrapperr_reply.YearStats.YearUsers.Data.UsersPlays = []models.WrapperrYearUserEntry{}

		wrapperr_reply.YearStats.YearMovies.Message = "No users processed."
	}

	// Get show buddy
	if config.WrapperrCustomize.GetUserShowBuddy {

		if len(wrapperr_reply.User.UserShows.Data.ShowsDuration) < 1 {
			wrapperr_reply.User.UserShows.Data.ShowBuddy.Message = "Show buddy is enabled but no top show was not found."
			wrapperr_reply.User.UserShows.Data.ShowBuddy.Error = true
		} else {

			err, buddy_name, buddy_id, buddy_found, buddy_duration := GetUserShowBuddy(config, wrapperr_reply.User.UserShows.Data.ShowsDuration[0], user_id, wrapperr_data)

			var show_buddy models.WrapperrShowBuddy

			if err != nil {
				log.Println("Show buddy threw error: ")
				log.Println(err)
				show_buddy.Message = "Failed to retrieve show buddy."
				show_buddy.Error = true
			} else {

				// Obfuscate username of buddy if enabled
				if config.WrapperrCustomize.ObfuscateOtherUsers {
					// Verify user is not already in catalog of users to maintain name consistancy
					userIDFound := false
					userNameFound := ""
					for o := 0; o < len(obfuscateCatalog); o++ {
						if obfuscateCatalog[o].userID == buddy_id {
							userIDFound = true
							userNameFound = obfuscateCatalog[o].newName
							break
						}
					}

					// If not found, give random name
					// If found, give buddy that username
					if !userIDFound {
						buddy_name = nameGenerator.Generate()
					} else {
						buddy_name = userNameFound
					}

					// Remove buddy id
					buddy_id = 0
				}

				show_buddy.Message = "Show buddy retrieved."
				show_buddy.Error = false
				show_buddy.BuddyName = buddy_name
				show_buddy.BuddyID = buddy_id
				show_buddy.BuddyDuration = buddy_duration
				show_buddy.BuddyFound = buddy_found

				log.Println("Show buddy retrieved.")
			}

			wrapperr_reply.User.UserShows.Data.ShowBuddy = show_buddy

		}

	} else {
		wrapperr_reply.User.UserShows.Data.ShowBuddy.Message = "Show buddy is disabled in the settings."
		wrapperr_reply.User.UserShows.Data.ShowBuddy.Error = true
	}

	return wrapperr_reply, nil

}

func GetUserShowBuddy(config models.WrapperrConfig, top_show models.TautulliEntry, user_id int, wrapperr_data []models.WrapperrDay) (error, string, int, bool, int) {

	var top_show_users []models.WrapperrYearUserEntry
	var top_show_buddy_name = "Something went wrong."
	var top_show_buddy_id = 0
	var top_show_buddy_duration = 0
	var top_show_buddy_found = false
	var error_bool = errors.New("Something went wrong.")

	end_loop_date := time.Unix(int64(config.WrappedEnd), 0)
	start_loop_date := time.Unix(int64(config.WrappedStart), 0)

	for i := 0; i < len(wrapperr_data); i++ {

		for j := 0; j < len(wrapperr_data[i].Data); j++ {

			// Create object using datetime from history entry
			current_loop_date := time.Unix(int64(wrapperr_data[i].Data[j].Date), 0)

			// Stop if time has reached current time or end loop date
			if current_loop_date.After(end_loop_date) || current_loop_date.Before(start_loop_date) {
				continue
			}

			if wrapperr_data[i].Data[j].GrandparentTitle == top_show.GrandparentTitle {

				user_found := false

				// Look for user within pre-defined array
				for d := 0; d < len(top_show_users); d++ {
					if top_show_users[d].UserID == wrapperr_data[i].Data[j].UserID {
						top_show_users[d].Plays += 1
						top_show_users[d].Duration += wrapperr_data[i].Data[j].Duration

						user_found = true
						break
					}
				}

				// If user was not found, add it to array
				if !user_found {
					var user_entry = models.WrapperrYearUserEntry{
						Plays:        1,
						Duration:     wrapperr_data[i].Data[j].Duration,
						FriendlyName: wrapperr_data[i].Data[j].FriendlyName,
						UserID:       wrapperr_data[i].Data[j].UserID,
					}
					top_show_users = append(top_show_users, user_entry)
				}

			}

		}

	}

	if len(top_show_users) < 2 {
		return nil, "None", 0, false, 0
	}

	sortutil.DescByField(top_show_users, "Duration")

	// Find requesters index
	user_index := 0
	for index, user := range top_show_users {
		if user_id == user.UserID {
			user_index = index
			break
		}
	}

	// Find relative users
	for index, user := range top_show_users {

		if user.UserID != user_id && len(top_show_users) == 2 {
			top_show_buddy_name = user.FriendlyName
			top_show_buddy_id = user.UserID
			top_show_buddy_duration = user.Duration
			top_show_buddy_found = true
			error_bool = nil
			break
		}

		if user.UserID != user_id && index == user_index-1 {
			top_show_buddy_name = user.FriendlyName
			top_show_buddy_id = user.UserID
			top_show_buddy_duration = user.Duration
			top_show_buddy_found = true
			error_bool = nil
			break
		}

		if user.UserID != user_id && index == user_index+1 {
			top_show_buddy_name = user.FriendlyName
			top_show_buddy_id = user.UserID
			top_show_buddy_duration = user.Duration
			top_show_buddy_found = true
			error_bool = nil
			break
		}

	}

	return error_bool, top_show_buddy_name, top_show_buddy_id, top_show_buddy_found, top_show_buddy_duration

}
