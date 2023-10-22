package files

import (
	"aunefyren/wrapperr/models"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

var link_path, _ = filepath.Abs("./config/links")

// Save new link object to the correct path
func SaveLink(link_object *models.WrapperrShareLink, plexAuth bool) error {

	// Check if the link folder exists
	err := CheckLinkDir()
	if err != nil {
		return err
	}

	file, err := json.MarshalIndent(link_object, "", "	")
	if err != nil {
		return err
	}

	var link_object_path string
	if plexAuth {
		link_object_path, _ = filepath.Abs(link_path + "/" + strconv.Itoa(link_object.UserID) + ".json")
	} else {
		link_object_path, _ = filepath.Abs(link_path + "/" + link_object.Hash + ".json")
	}

	err = ioutil.WriteFile(link_object_path, file, 0644)
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

func DeleteLink(fileName string) error {
	linkpath, err := filepath.Abs(link_path + "/" + fileName + ".json")
	if err != nil {
		log.Println("Failed to create path. Error: " + err.Error())
		return errors.New("Failed to create path.")
	}
	err = os.Remove(linkpath)
	if err != nil {
		log.Println("Failed to delete file. Error: " + err.Error())
		return errors.New("Failed to delete file.")
	}
	return nil
}

// Read
func GetLink(fileName string) (*models.WrapperrShareLink, error) {
	// Check if the link folder exists
	err := CheckLinkDir()
	if err != nil {
		return nil, err
	}

	link_object := models.WrapperrShareLink{}

	share_link_path, err := filepath.Abs(link_path + "/" + fileName + ".json")
	if err != nil {
		return nil, err
	}

	_, err = os.Stat(share_link_path)
	if err != nil {
		log.Println("Failed to load file from path. Returning error. Error: " + err.Error())
		return nil, errors.New("Invalid share link.")
	}

	file, err := ioutil.ReadFile(share_link_path)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(file, &link_object)
	if err != nil {
		return nil, err
	}

	// Return config object
	return &link_object, nil
}

func CleanOldShareableLinks() {
	// Check if the link folder exists
	err := CheckLinkDir()
	if err != nil {
		log.Println("Failed to verify link directory exists. Error: " + err.Error())
		return
	}

	items, _ := ioutil.ReadDir(link_path)

	for _, item := range items {
		if item.IsDir() {
			continue
		} else {
			if strings.HasSuffix(strings.ToLower(item.Name()), ".json") {
				fileNameParts := strings.Split(item.Name(), ".")
				if len(fileNameParts) != 2 {
					continue
				}
				linkObject, err := GetLink(fileNameParts[0])
				if err != nil {
					log.Println("Failed to load " + item.Name() + ". Error: " + err.Error())
				}
				now := time.Now()
				linkTime, err := time.Parse("2006-01-02", linkObject.Date)
				if err != nil {
					log.Println("Failed to parse " + item.Name() + " datetime. Error: " + err.Error())
				}
				linkTime = linkTime.Add(7 * 24 * time.Hour)
				if linkTime.Before(now) {
					log.Println("Deleting " + item.Name() + ".")
					err = DeleteLink(fileNameParts[0])
					if err != nil {
						log.Println("Failed to delete " + item.Name() + ". Error: " + err.Error())
					}
				}
			}
		}
	}
}
