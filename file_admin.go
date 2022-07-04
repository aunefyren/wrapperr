package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

var admin_config_path, _ = filepath.Abs("./config/admin.json")

// Check if the config file has been configured for usage
func GetAdminState() (bool, error) {

	// Retrieve config object from function
	admin_config, err := GetAdminConfig()
	if err != nil {
		log.Println("Admin config state retrival threw error.")
		return false, err
	}

	// Check if certain parameters are set. These are essential paramteres the user must configure for basic functionality.
	if admin_config.AdminUsername != "" && admin_config.AdminPassword != "" {
		return true, nil
	} else {
		return false, nil
	}
}

// Saves the given admin config struct as admin.json
func SaveAdminConfig(config AdminConfig) error {

	file, err := json.MarshalIndent(config, "", "    ")
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(admin_config_path, file, 0644)
	if err != nil {
		return err
	}

	return nil
}

// Read the config file and return the file as an object
func GetAdminConfig() (*AdminConfig, error) {

	// Create admin.json if it doesn't exist
	if _, err := os.Stat(admin_config_path); errors.Is(err, os.ErrNotExist) {
		log.Println("Admin config file does not exist. Creating.")

		err := CreateAdminConfigFile()
		if err != nil {
			return nil, err
		}
	}

	// Load config file for alterations, information
	file, err := os.Open(admin_config_path)
	if err != nil {
		log.Println("Admin config opening threw error.")
		return nil, err
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	admin_config := AdminConfig{}
	err = decoder.Decode(&admin_config)
	if err != nil {
		log.Println("Admin config parsing threw error.")
		return nil, err
	}

	return &admin_config, nil
}

// Creates empty admin.json
func CreateAdminConfigFile() error {

	var admin_config AdminConfig

	err := SaveAdminConfig(admin_config)
	if err != nil {
		return err
	}

	return nil
}
