package files

import (
	"aunefyren/wrapperr/models"
	"encoding/json"
	"errors"
	"log"
	"os"
	"path/filepath"
	"strconv"
)

var link_path, _ = filepath.Abs("./config/links")

// Save new link object to the correct path
func SaveLink(link_object *models.WrapperrShareLink) error {

	// Check if the link folder exists
	err := CheckLinkDir()
	if err != nil {
		return err
	}

	file, err := json.MarshalIndent(link_object, "", "	")
	if err != nil {
		return err
	}

	var link_object_path, _ = filepath.Abs(link_path + "/" + strconv.Itoa(link_object.UserID) + ".json")

	err = os.WriteFile(link_object_path, file, 0644)
	if err != nil {
		return err
	}

	return nil
}

// Create the directory in which links are stored
func CreateLinkDir() error {
	err := os.Mkdir(link_path, 0755)
	if err != nil {
		return err
	}

	return nil
}

// Check if the link directory exists. If not, attempt to create it
func CheckLinkDir() error {
	_, err := os.Stat(link_path)
	if os.IsNotExist(err) {
		log.Println("Link directory does not exist. Creating...")

		err := CreateLinkDir()
		if err != nil {
			return err
		}

		log.Println("Created link directory.")
	}

	return nil
}

// Read
func GetLink(UserID string) (*models.WrapperrShareLink, error) {
	// Check if the link folder exists
	err := CheckLinkDir()
	if err != nil {
		return nil, err
	}

	link_object := models.WrapperrShareLink{}

	share_link_path, err := filepath.Abs(link_path + "/" + UserID + ".json")
	if err != nil {
		return nil, err
	}

	_, err = os.Stat(share_link_path)
	if err != nil {
		return nil, errors.New("Invalid share link.")
	}

	file, err := os.Open(share_link_path)
	if err != nil {
		return nil, err
	}

	defer file.Close()
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&link_object)
	if err != nil {
		return nil, err
	}

	if link_object.Expired {
		return nil, errors.New("This Wrapped link has expired.")
	}

	// Return config object
	return &link_object, nil
}
