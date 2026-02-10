package files

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"path/filepath"

	"github.com/aunefyren/wrapperr/models"
)

var admin_config_path, _ = filepath.Abs("./config/admin.json")

// Check if the config file has been configured for usage
func GetAdminState() (bool, bool, error) {
	// Retrieve config object from function
	admin_config, err := GetAdminConfig()
	if err != nil {
		log.Println("Admin config state retrieval threw error.")
		return false, false, err
	}

	mfaActive := false
	if admin_config.AdminMFASecret != "" {
		mfaActive = true
	}

	// Check if certain parameters are set. These are essential parameters the user must configure for basic functionality.
	if admin_config.AdminUsername != "" && admin_config.AdminPassword != "" {
		return true, mfaActive, nil
	} else {
		return false, mfaActive, nil
	}
}

// Saves the given admin config struct as admin.json
func SaveAdminConfig(config models.AdminConfig) (err error) {
	err = nil

	file, err := json.MarshalIndent(config, "", "    ")
	if err != nil {
		return err
	}

	err = os.WriteFile(admin_config_path, file, 0644)
	if err != nil {
		return err
	}

	return
}

// Read the config file and return the file as an object
func GetAdminConfig() (adminConfig models.AdminConfig, err error) {
	adminConfig = models.AdminConfig{}
	err = nil

	// Create admin.json if it doesn't exist
	if _, err := os.Stat(admin_config_path); errors.Is(err, os.ErrNotExist) {
		log.Println("Admin config file does not exist. Creating.")

		err := CreateAdminConfigFile()
		if err != nil {
			return adminConfig, err
		}
	}

	// Load config file for alterations, information
	file, err := os.ReadFile(admin_config_path)
	if err != nil {
		log.Println("Admin config opening threw error. Error: " + err.Error())
		return adminConfig, err
	}

	admin_config := models.AdminConfig{}

	err = json.Unmarshal(file, &admin_config)
	if err != nil {
		log.Println("Admin config parsing threw error. Error: " + err.Error())
		return adminConfig, err
	}

	return admin_config, nil
}

// Creates empty admin.json
func CreateAdminConfigFile() (err error) {
	err = nil

	var admin_config models.AdminConfig

	err = SaveAdminConfig(admin_config)
	if err != nil {
		return err
	}

	return
}
