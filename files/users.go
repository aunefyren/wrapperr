package files

import (
	"aunefyren/wrapperr/models"
	"encoding/json"
	"errors"
	"log"
	"os"
	"path/filepath"
	"sort"
)

var usersPath, _ = filepath.Abs("./config/users.json")

// Saves the given users struct as users.json
func SaveUsers(users []models.WrapperrUser) (err error) {
	err = nil

	file, err := json.MarshalIndent(users, "", "	")
	if err != nil {
		return err
	}

	err = os.WriteFile(usersPath, file, 0644)
	if err != nil {
		return err
	}

	return nil
}

// Creates empty users.json
func CreateUsersFile() error {
	var users []models.WrapperrUser

	err := SaveUsers(users)
	if err != nil {
		return err
	}

	return nil
}

// Read the users file and return the file as an object
func GetUsers() (users []models.WrapperrUser, err error) {
	users = []models.WrapperrUser{}
	err = nil

	// Create users.json if it doesn't exist
	if _, err := os.Stat(usersPath); errors.Is(err, os.ErrNotExist) {
		log.Println("Users file does not exist. Creating.")

		err = CreateUsersFile()
		if err != nil {
			return users, err
		}
	}

	// Load users file
	file, err := os.ReadFile(usersPath)
	if err != nil {
		return users, err
	}

	// Parse users file
	err = json.Unmarshal(file, &users)
	if err != nil {
		return users, err
	}
	if err != nil {
		return users, err
	}

	sort.Slice(users, func(i, j int) bool {
		return users[i].UserID < users[j].UserID
	})

	// Return users object
	return users, nil
}
