package routes

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/models"
	"aunefyren/wrapperr/modules"
	"aunefyren/wrapperr/utilities"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

// API route used to retrieve the Wrapperr configuration file.
func ApiGetConfig(w http.ResponseWriter, r *http.Request) {

	payload, err := modules.AuthorizeToken(w, r)

	if err == nil && payload.Admin {

		config, err := files.GetConfig()

		if err != nil {
			utilities.RespondDefaultError(w, r, errors.New("Failed to retrieve Wrapperr configuration."), 500)
		} else {
			config_reply := models.ConfigReply{
				Data:     *config,
				Message:  "Retrieved Wrapperr config.",
				Error:    false,
				Username: payload.Username,
			}

			ip_string := utilities.GetOriginIPString(w, r)

			log.Println("Retrieved Wrapperr configuration." + ip_string)

			utilities.RespondWithJSON(w, http.StatusOK, config_reply)
			return

		}

	} else if !payload.Admin {

		log.Println(errors.New("Only the admin can retrieve the config."))
		utilities.RespondDefaultError(w, r, errors.New("Only the admin can retrieve the config."), 401)
		return

	} else {

		log.Println(err)
		utilities.RespondDefaultError(w, r, errors.New("Failed to authorize JWT token."), 500)
		return

	}
}

// API route used to update the Wrapperr configuration file.
func ApiSetConfig(w http.ResponseWriter, r *http.Request) {

	payload, err := modules.AuthorizeToken(w, r)

	if err == nil && payload.Admin {

		config, err := files.GetConfig()

		if err != nil {
			log.Println(err)
			utilities.RespondDefaultError(w, r, errors.New("Failed to retrieve Wrapperr configuration."), 500)
		} else {

			original_root := config.WrapperrRoot

			// Read payload from Post input
			reqBody, err := ioutil.ReadAll(r.Body)
			if err != nil {
				log.Println("Failed to parse config request. Error:")
				log.Println(err)
				utilities.RespondDefaultError(w, r, errors.New("Failed to parse config request."), 401)
				return
			}

			var config_payload models.SetWrapperrConfig
			json.Unmarshal(reqBody, &config_payload)

			// Confirm username length
			if config_payload.DataType == "" {
				log.Println("Cannot set new config. Invalid data type recieved.")
				utilities.RespondDefaultError(w, r, errors.New("Data type specified is invalid."), 400)
				return
			}

			if config_payload.DataType == "tautulli_config" {

				config.TautulliConfig = config_payload.TautulliConfig
				err = files.SaveConfig(config)
				if err != nil {
					utilities.RespondDefaultError(w, r, errors.New("Failed to save new Wrapperr configuration."), 500)
				}

			} else if config_payload.DataType == "wrapperr_customize" {

				config.WrapperrCustomize = config_payload.WrapperrCustomize

				err = files.SaveConfig(config)
				if err != nil {
					utilities.RespondDefaultError(w, r, errors.New("Failed to save new Wrapperr configuration."), 500)
					return
				}

			} else if config_payload.DataType == "wrapperr_data" {

				new_time, err := time.LoadLocation(config_payload.WrapperrData.Timezone)
				if err != nil {
					log.Println("Failed to set the new time zone. Error: ")
					log.Println(err)
					utilities.RespondDefaultError(w, r, errors.New("Given time zone is invalid."), 401)
					return
				}

				config.UseCache = config_payload.WrapperrData.UseCache
				config.UseLogs = config_payload.WrapperrData.UseLogs
				config.PlexAuth = config_payload.WrapperrData.PlexAuth
				config.WrapperrRoot = config_payload.WrapperrData.WrapperrRoot
				config.CreateShareLinks = config_payload.WrapperrData.CreateShareLinks
				config.Timezone = config_payload.WrapperrData.Timezone
				config.ApplicationName = config_payload.WrapperrData.ApplicationName
				config.ApplicationURL = config_payload.WrapperrData.ApplicationURL
				config.WrappedEnd = config_payload.WrapperrData.WrappedEnd
				config.WrappedStart = config_payload.WrapperrData.WrappedStart
				config.WinterTheme = config_payload.WrapperrData.WinterTheme

				err = files.SaveConfig(config)
				if err != nil {
					log.Println(err)
					utilities.RespondDefaultError(w, r, errors.New("Failed to save new Wrapperr configuration."), 500)
					return
				}

				time.Local = new_time

			} else {
				log.Println("Cannot set new config. Invalid data type recieved. Type: " + config_payload.DataType)
				utilities.RespondDefaultError(w, r, errors.New("Failed to save new Wrapperr confguration."), 400)
				return
			}

			log.Println("New Wrapperr configuration saved for type: " + config_payload.DataType + ".")
			utilities.RespondDefaultOkay(w, r, "Saved new Wrapperr config.")

			if config.WrapperrRoot != original_root {
				log.Println("Root changed, attempting Wrapperr restart.")
				err = utilities.RestartSelf()
				if err != nil {
					log.Println("Failed to restart. Error: " + err.Error())
				}
			}

			return

		}

	} else if !payload.Admin {

		log.Println("User not authenticated as admin.")
		utilities.RespondDefaultError(w, r, errors.New("User not authenticated as admin."), 401)
		return

	} else {

		log.Println(err)
		utilities.RespondDefaultError(w, r, errors.New("Failed to save config."), 500)
		return

	}
}

// API route used to update admin accounts details (username, password).
func ApiUpdateAdmin(w http.ResponseWriter, r *http.Request) {

	admin, err := files.GetAdminState()
	if err != nil {
		log.Println("Failed to load admin state. Error: ")
		log.Println(err)
		utilities.RespondDefaultError(w, r, errors.New("Failed to load admin state."), 500)
		return
	}

	if !admin {
		log.Print("Admin update failed. No admin is configured.")
		utilities.RespondDefaultError(w, r, errors.New("No admin is configured."), 400)
		return
	} else {

		payload, err := modules.AuthorizeToken(w, r)

		if err == nil && payload.Admin {

			// Read payload from Post input
			reqBody, _ := ioutil.ReadAll(r.Body)
			var admin_payload models.AdminConfig
			json.Unmarshal(reqBody, &admin_payload)

			// Confirm username length
			if len(admin_payload.AdminUsername) < 4 {
				log.Println("Admin update failed. Admin username requires four or more characters.")
				utilities.RespondDefaultError(w, r, errors.New("Admin username is too short. Four characters or more required."), 500)
				return
			}

			// Confirm password length
			if len(admin_payload.AdminPassword) < 8 {
				log.Println("Admin update failed. Admin password requires eight or more characters.")
				utilities.RespondDefaultError(w, r, errors.New("Admin password is too short. Eight characters or more required."), 500)
				return
			}

			// Hash new password
			hash, err := utilities.HashAndSalt(admin_payload.AdminPassword)
			if err != nil {
				log.Println(err)
				utilities.RespondDefaultError(w, r, errors.New("Failed to hash your password."), 500)
				return
			}
			admin_payload.AdminPassword = hash

			// Save new admin config
			err = files.SaveAdminConfig(admin_payload)
			if err != nil {
				log.Println(err)
				utilities.RespondDefaultError(w, r, errors.New("Failed to update admin."), 500)
				return
			}

			// Update the private key to delete old logins
			_, err = files.UpdatePrivateKey()
			if err != nil {
				log.Println(err)
				utilities.RespondDefaultError(w, r, errors.New("Admin account updated, but failed to rotate private key. Old logins still function."), 500)
				return
			}

			log.Println("New admin account created. Server is now claimed.")
			fmt.Println("New admin account created. Server is now claimed.")

			utilities.RespondDefaultOkay(w, r, "Admin created.")
			return

		} else if !payload.Admin {

			log.Println("User not authenticated as admin.")
			utilities.RespondDefaultError(w, r, errors.New("User not authenticated as admin."), 401)
			return

		} else {

			log.Println(err)
			utilities.RespondDefaultError(w, r, errors.New("Failed to update admin."), 500)
			return

		}

	}
}

// API route which validates an admin JWT token
func ApiValidateAdmin(w http.ResponseWriter, r *http.Request) {

	payload, err := modules.AuthorizeToken(w, r)

	if err == nil && payload.Admin {

		log.Println("Admin login session JWT validated.")
		utilities.RespondDefaultOkay(w, r, "The admin login session is valid.")
		return

	} else if !payload.Admin {

		log.Println("User not authenticated as admin.")
		utilities.RespondDefaultError(w, r, errors.New("User not authenticated as admin."), 401)
		return

	} else {

		log.Println(err)
		utilities.RespondDefaultError(w, r, errors.New("Failed to validate admin."), 500)
		return

	}
}

// API route which retrieves lines from the log file
func ApiGetLog(w http.ResponseWriter, r *http.Request) {

	payload, err := modules.AuthorizeToken(w, r)

	if err != nil {

		log.Println(err)
		utilities.RespondDefaultError(w, r, errors.New("Failed to validate admin."), 500)
		return

	} else if !payload.Admin {

		log.Println("User not authenticated as admin.")
		utilities.RespondDefaultError(w, r, errors.New("User not authenticated as admin."), 401)
		return

	}

	log_lines, err := files.GetLogLines()
	if err != nil {

		log.Println("Error trying to retrieve log lines. Error: ")
		log.Println(err)
		utilities.RespondDefaultError(w, r, errors.New("Failed to retrieve log file."), 500)
		return

	}

	log_lines_return := models.WrapperrLogLineReply{
		Message: "Log lines retrieved",
		Error:   false,
		Data:    log_lines,
		Limit:   files.GetMaxLogLinesReturned(),
	}

	log.Println("Log lines retrieved for admin.")
	utilities.RespondWithJSON(w, http.StatusOK, log_lines_return)
	return

}
