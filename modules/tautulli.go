package modules

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/models"
	"aunefyren/wrapperr/utilities"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

func TautulliTestConnection(TautulliPort int, TautulliIP string, TautulliHttps bool, TautulliRoot string, TautulliApiKey string) (bool, error) {

	urlString, err := utilities.BuildURL(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot)
	if err != nil {
		errString := strings.Replace(err.Error(), TautulliApiKey, "REDACTED", -1)
		log.Println("Failed to build Tautulli connection URL. Error: " + errString)
		return false, errors.New("Failed to build Tautulli connection URL.")
	}

	urlString = urlString + "api/v2/" + "?apikey=" + TautulliApiKey + "&cmd=status"

	params := url.Values{}
	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", urlString, payload)
	if err != nil {
		errString := strings.Replace(err.Error(), TautulliApiKey, "REDACTED", -1)
		log.Println("Failed to reach Tautulli server. Error: " + errString)
		return false, errors.New("Failed to reach Tautulli server. Error: " + errString)
	}

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		errString := strings.Replace(err.Error(), TautulliApiKey, "REDACTED", -1)
		log.Println("Failed to reach Tautulli server. Error: " + errString)
		return false, errors.New("Failed to reach Tautulli server. Error: " + errString)
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		errString := strings.Replace(err.Error(), TautulliApiKey, "REDACTED", -1)
		log.Println("Failed to read Tautulli server response. Error: " + errString)
		return false, errors.New("Failed to read Tautulli response. Error: " + errString)
	} else if res.StatusCode != 200 {
		errString := "Tautulli didn't respond with status code 200, got: " + res.Status + " instead."
		reply := string(body)
		replyString := strings.Replace(reply, TautulliApiKey, "REDACTED", -1)
		log.Println("Failed to connect to Tautulli server. \n\nReply: " + replyString + ". +n\nError: " + errString)
		return false, errors.New("Failed to connect to Tautulli server. \n\nReply: " + replyString + ". \n\nError: " + errString)
	}

	var body_reply models.TautulliStatusReply
	err = json.Unmarshal(body, &body_reply)
	if err != nil {
		errString := strings.Replace(err.Error(), TautulliApiKey, "REDACTED", -1)
		reply := string(body)
		replyString := strings.Replace(reply, TautulliApiKey, "REDACTED", -1)
		log.Println("Failed to parse Tautulli server response. \n\nReply: " + replyString + ". +n\nError: " + errString)
		return false, errors.New("Failed to parse Tautulli server response. \n\nReply: " + replyString + ". \n\nError: " + errString)
	}

	var tautulli_status bool = false

	if body_reply.Response.Result == "success" {

		tautulli_status = true

	} else if body_reply.Response.Result == "error" {

		errString := strings.Replace(body_reply.Response.Message, TautulliApiKey, "REDACTED", -1)
		log.Println("Tautulli server responded with an error. Error: " + errString)
		return false, errors.New("Tautulli server responded with an error. Error: " + errString)

	}

	return tautulli_status, nil
}

func TautulliGetUserId(TautulliPort int, TautulliIP string, TautulliHttps bool, TautulliRoot string, TautulliApiKey string, PlexUser string) (userID int, userName string, userFriendlyName string, userEmail string, userActive bool, err error) {
	userID = 0
	userName = ""
	userEmail = ""
	userFriendlyName = ""
	userActive = false
	err = nil

	body_reply, err := TautulliGetUsers(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot, TautulliApiKey)
	if err != nil {
		log.Println("Failed to get users from Tautulli. Error: " + err.Error())
		return userID, userName, userFriendlyName, userEmail, userActive, errors.New("Failed to get users from Tautulli.")
	}

	for i := 0; i < len(body_reply.Response.Data); i++ {
		if body_reply.Response.Data[i].UserID != 0 && (strings.ToLower(body_reply.Response.Data[i].Username) == strings.ToLower(PlexUser) || strings.ToLower(body_reply.Response.Data[i].Email) == strings.ToLower(PlexUser)) {
			ActiveInt := body_reply.Response.Data[i].IsActive
			if ActiveInt == 0 {
				userActive = false
			} else if ActiveInt == 1 {
				userActive = true
			} else {
				return userID, userName, userFriendlyName, userEmail, userActive, errors.New("Invalid IsActive state in Tautulli.")
			}

			return body_reply.Response.Data[i].UserID, body_reply.Response.Data[i].Username, body_reply.Response.Data[i].FriendlyName, body_reply.Response.Data[i].Email, userActive, nil
		}
	}

	log.Println("Could not find any user that matched the given Plex Identity: '" + PlexUser + "'.")
	return userID, userName, userEmail, userFriendlyName, userActive, errors.New("Failed to find user.")
}

func TautulliGetUsers(TautulliPort int, TautulliIP string, TautulliHttps bool, TautulliRoot string, TautulliApiKey string) (usersReply models.TautulliGetUsersReply, err error) {
	usersReply = models.TautulliGetUsersReply{}
	err = nil

	url_string, err := utilities.BuildURL(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot)
	if err != nil {
		log.Println("Failed to build Tautulli connection URL. Error: " + err.Error())
		return usersReply, errors.New("Failed to build Tautulli connection URL.")
	}

	url_string = url_string + "api/v2/" + "?apikey=" + TautulliApiKey + "&cmd=get_users"

	params := url.Values{}
	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", url_string, payload)
	if err != nil {
		log.Println("Failed to reach Tautulli server. Error: " + err.Error())
		return usersReply, errors.New("Failed to reach Tautulli server.")
	}

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("Failed to reach Tautulli server. Error: " + err.Error())
		return usersReply, errors.New("Failed to reach Tautulli server.")
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)

	json.Unmarshal(body, &usersReply)
	if err != nil {
		log.Println(err)
		return usersReply, errors.New("Failed to parse Tautulli response.")
	}

	return usersReply, err
}

func TautulliDownloadStatistics(TautulliPort int, TautulliIP string, TautulliHttps bool, TautulliRoot string, TautulliApiKey string, TautulliLength int, Libraries string, Grouping string, StartDate string) ([]models.TautulliHistoryItem, error) {

	url_string, err := utilities.BuildURL(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot)
	if err != nil {
		log.Println(err)
		return []models.TautulliHistoryItem{}, errors.New("Failed to build Tautulli connection URL.")
	}

	url_string = url_string + "api/v2/" + "?apikey=" + TautulliApiKey + "&cmd=get_history&order_column=date&order_dir=desc&include_activity=0" + Libraries + "&grouping=" + Grouping + "&length=" + strconv.Itoa(TautulliLength) + "&start_date=" + StartDate

	params := url.Values{}
	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", url_string, payload)
	if err != nil {
		log.Println(err)
		return []models.TautulliHistoryItem{}, errors.New("Failed to reach Tautulli server.")
	}

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return []models.TautulliHistoryItem{}, errors.New("Failed to reach Tautulli server.")
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)

	var body_reply models.TautulliGetHistoryReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		log.Println(err)
		return []models.TautulliHistoryItem{}, errors.New("Failed to parse Tautulli response.")
	}

	return body_reply.Response.Data.Data, nil

}

func TautulliTestEveryServer() (err error) {
	err = nil

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		return errors.New("Failed to load Wrapperr configuration.")
	}

	for i := 0; i < len(config.TautulliConfig); i++ {
		log.Println("Checking Tautulli server '" + config.TautulliConfig[i].TautulliName + "'.")
		tautulli_state, err := TautulliTestConnection(config.TautulliConfig[i].TautulliPort, config.TautulliConfig[i].TautulliIP, config.TautulliConfig[i].TautulliHttps, config.TautulliConfig[i].TautulliRoot, config.TautulliConfig[i].TautulliApiKey)
		if err != nil {
			log.Println("Failed to reach Tautulli server '" + config.TautulliConfig[i].TautulliName + "'. Error: " + err.Error())
			return errors.New("Failed to reach Tautulli server '" + config.TautulliConfig[i].TautulliName + "'.")
		} else if !tautulli_state {
			log.Println("Failed to ping Tautulli server '" + config.TautulliConfig[i].TautulliName + "' before retrieving statistics.")
			return errors.New("Failed to ping Tautulli server '" + config.TautulliConfig[i].TautulliName + "'.")
		}
	}

	return
}

func TautulliGetUsersFromEveryServer() (tautulliUsers []models.TautulliUser, err error) {
	err = nil
	tautulliUsers = []models.TautulliUser{}

	config, err := files.GetConfig()
	if err != nil {
		log.Println("Failed to load Wrapperr configuration. Error: " + err.Error())
		return tautulliUsers, errors.New("Failed to load Wrapperr configuration.")
	}

	for i := 0; i < len(config.TautulliConfig); i++ {
		log.Println("Getting users from Tautulli server '" + config.TautulliConfig[i].TautulliName + "'.")
		tautulliReply, err := TautulliGetUsers(config.TautulliConfig[i].TautulliPort, config.TautulliConfig[i].TautulliIP, config.TautulliConfig[i].TautulliHttps, config.TautulliConfig[i].TautulliRoot, config.TautulliConfig[i].TautulliApiKey)
		if err != nil {
			log.Println("Failed to get users from Tautulli. Error: " + err.Error())
			return tautulliUsers, errors.New("Failed to get users from Tautulli.")
		}

		for _, user := range tautulliReply.Response.Data {
			tautulliUsers = append(tautulliUsers, user)
		}
	}

	return
}
