package modules

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/models"
	"errors"
	"log"
)

func UsersSaveUserEntry(newUser models.WrapperrUser) (err error) {
	err = nil

	users, err := files.GetUsers()
	if err != nil {
		log.Println("Failed to get users. Error: " + err.Error())
		return errors.New("Failed to get users.")
	}

	var userFound = false
	var userIndex = 0
	for index, user := range users {
		if user.UserID == newUser.UserID || user.User == newUser.User {
			userFound = true
			userIndex = index
		}
	}

	if userFound {
		users[userIndex].Wrappings = append(users[userIndex].Wrappings, newUser.Wrappings...)
	} else {
		users = append(users, newUser)
	}

	err = files.SaveUsers(users)
	if err != nil {
		log.Println("Failed to save new users. Error: " + err.Error())
		return errors.New("Failed to save new users.")
	}

	return
}

func UsersGetUser(userID int) (user models.WrapperrUser, err error) {
	err = nil
	user = models.WrapperrUser{}

	users, err := files.GetUsers()
	if err != nil {
		log.Println("Failed to get users. Error: " + err.Error())
		return user, errors.New("Failed to get users.")
	}

	for _, foundUser := range users {
		if foundUser.UserID == userID {
			return foundUser, nil
		}
	}

	return user, errors.New("User not found.")
}

func UsersUpdateUser(userID int, FriendlyName string, userName string, Email string, Active bool, TautulliServers []string) (err error) {
	err = nil

	users, err := files.GetUsers()
	if err != nil {
		log.Println("Failed to get users. Error: " + err.Error())
		return errors.New("Failed to get users.")
	}

	userFound := false
	userIndex := 0
	for index, foundUser := range users {
		if foundUser.UserID == userID {
			userFound = true
			userIndex = index
		}
	}

	if !userFound {
		return errors.New("Failed to find user based on ID.")
	}

	users[userIndex].Active = Active
	users[userIndex].Email = Email
	users[userIndex].FriendlyName = FriendlyName
	users[userIndex].User = userName
	users[userIndex].TautulliServers = TautulliServers

	err = files.SaveUsers(users)
	if err != nil {
		log.Println("Failed to save users. Error: " + err.Error())
		return errors.New("Failed to save users.")
	}

	return
}
