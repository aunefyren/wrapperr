package modules

import (
	"aunefyren/wrapperr/models"
	"aunefyren/wrapperr/utilities"
	"encoding/json"
	"errors"
	"io/ioutil"
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
	body, err := ioutil.ReadAll(res.Body)
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
		log.Println("Tautulli server responsed with an error. Error: " + errString)
		return false, errors.New("Tautulli server responsed with an error. Error: " + errString)

	}

	return tautulli_status, nil
}

func TautulliGetUserId(TautulliPort int, TautulliIP string, TautulliHttps bool, TautulliRoot string, TautulliApiKey string, PlexUser string) (int, string, error) {

	url_string, err := utilities.BuildURL(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot)
	if err != nil {
		log.Println(err)
		return 0, "", errors.New("Failed to build Tautulli connection URL.")
	}

	url_string = url_string + "api/v2/" + "?apikey=" + TautulliApiKey + "&cmd=get_users"

	params := url.Values{}
	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", url_string, payload)
	if err != nil {
		log.Println(err)
		return 0, "", errors.New("Failed to reach Tautulli server.")
	}

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return 0, "", errors.New("Failed to reach Tautulli server.")
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)

	var body_reply models.TautulliGetUsersReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		log.Println(err)
		return 0, "", errors.New("Failed to parse Tautulli response.")
	}

	for i := 0; i < len(body_reply.Response.Data); i++ {
		if body_reply.Response.Data[i].UserID != 0 && (strings.ToLower(body_reply.Response.Data[i].Username) == strings.ToLower(PlexUser) || strings.ToLower(body_reply.Response.Data[i].Email) == strings.ToLower(PlexUser)) {

			var username string

			if body_reply.Response.Data[i].FriendlyName != "" {
				username = body_reply.Response.Data[i].FriendlyName
			} else if body_reply.Response.Data[i].Username != "" {
				username = body_reply.Response.Data[i].Username
			} else {
				return 0, "", errors.New("Failed retrieve Plex username.")
			}

			return body_reply.Response.Data[i].UserID, username, nil
		}
	}

	log.Println("Could not find any user that matched the given Plex Identity: '" + PlexUser + "'.")
	return 0, "", errors.New("Failed to find user.")
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
	body, err := ioutil.ReadAll(res.Body)

	var body_reply models.TautulliGetHistoryReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		log.Println(err)
		return []models.TautulliHistoryItem{}, errors.New("Failed to parse Tautulli response.")
	}

	return body_reply.Response.Data.Data, nil

}
