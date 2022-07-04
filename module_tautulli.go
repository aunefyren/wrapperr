package main

import (
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

	url_string, err := BuildURL(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot)
	if err != nil {
		log.Println(err)
		return false, errors.New("Failed to build Tautulli connection URL.")
	}

	url_string = url_string + "api/v2/" + "?apikey=" + TautulliApiKey + "&cmd=status"

	params := url.Values{}
	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", url_string, payload)
	if err != nil {
		log.Println(err)
		return false, errors.New("Failed to reach Tautulli server.")
	}

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return false, errors.New("Failed to reach Tautulli server.")
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)

	var body_reply TautulliStatusReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		log.Println(err)
		return false, errors.New("Failed to parse Tautulli response.")
	}

	var tautulli_status bool = false

	if body_reply.Response.Result == "success" {

		tautulli_status = true

	}

	return tautulli_status, nil
}

func TautulliGetUserId(TautulliPort int, TautulliIP string, TautulliHttps bool, TautulliRoot string, TautulliApiKey string, PlexUser string) (int, string, error) {

	url_string, err := BuildURL(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot)
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

	var body_reply TautulliGetUsersReply
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

func TautulliDownloadStatistics(TautulliPort int, TautulliIP string, TautulliHttps bool, TautulliRoot string, TautulliApiKey string, TautulliLength int, Libraries string, Grouping string, StartDate string) ([]TautulliHistoryItem, error) {

	url_string, err := BuildURL(TautulliPort, TautulliIP, TautulliHttps, TautulliRoot)
	if err != nil {
		log.Println(err)
		return []TautulliHistoryItem{}, errors.New("Failed to build Tautulli connection URL.")
	}

	url_string = url_string + "api/v2/" + "?apikey=" + TautulliApiKey + "&cmd=get_history&order_column=date&order_dir=desc&include_activity=0" + Libraries + "&grouping=" + Grouping + "&length=" + strconv.Itoa(TautulliLength) + "&start_date=" + StartDate

	params := url.Values{}
	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", url_string, payload)
	if err != nil {
		log.Println(err)
		return []TautulliHistoryItem{}, errors.New("Failed to reach Tautulli server.")
	}

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return []TautulliHistoryItem{}, errors.New("Failed to reach Tautulli server.")
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)

	var body_reply TautulliGetHistoryReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		log.Println(err)
		return []TautulliHistoryItem{}, errors.New("Failed to parse Tautulli response.")
	}

	return body_reply.Response.Data.Data, nil

}
