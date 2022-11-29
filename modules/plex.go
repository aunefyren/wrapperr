package modules

import (
	"aunefyren/wrapperr/models"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

var content_type string = "application/json"
var x_plex_product string = "Wrapperr"
var strong bool = true
var x_plex_model string = "Plex OAuth"
var x_plex_language string = "en"

func GetPin(ClientKey string, WrapperrVersion string) (*models.PlexGetPinReply, error) {

	url_string := "https://plex.tv/api/v2/pins"

	params := url.Values{}
	params.Add("strong", strconv.FormatBool(strong))
	params.Add("X-Plex-Product", x_plex_product)
	params.Add("X-Plex-Client-Identifier", ClientKey)
	params.Add("X-Plex-Version", WrapperrVersion)
	params.Add("X-Plex-Model", x_plex_model)
	params.Add("X-Plex-Language", x_plex_language)

	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("POST", url_string, payload)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Accept", content_type)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	var body_reply models.PlexGetPinReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		return nil, err
	}

	return &body_reply, nil
}

func GetLoginURLString(client_id string, code string, home_url string) string {

	base := "https://app.plex.tv/auth#?"
	forwardUrl := home_url + "?close_me=true"

	return base + "clientID=" + url.QueryEscape(client_id) + "&code=" + url.QueryEscape(code) + "&context%5Bdevice%5D%5Bproduct%5D=" + url.QueryEscape(x_plex_product) + "&forwardUrl=" + url.QueryEscape(forwardUrl)

}

func GetPlexAuthLogin(ID int, Code string, WrapperrVersion string, ClientKey string) (*models.PlexGetPinReply, error) {

	url_string := "https://plex.tv/api/v2/pins/" + strconv.Itoa(ID)

	params := url.Values{}
	params.Add("X-Plex-Client-Identifier", ClientKey)
	params.Add("X-Plex-Version", WrapperrVersion)
	params.Add("X-Plex-Model", x_plex_model)
	params.Add("X-Plex-Language", x_plex_language)
	params.Add("code", Code)

	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", url_string, payload)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Accept", content_type)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)

	var body_reply models.PlexGetPinReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		return nil, err
	}

	return &body_reply, nil
}

func PlexAuthValidateToken(PlexAuth string, ClientKey string, WrapperrVersion string) (*models.PlexGetUserReply, error) {

	url_string := "https://plex.tv/api/v2/user"

	params := url.Values{}
	params.Add("X-Plex-Client-Identifier", ClientKey)
	params.Add("X-Plex-Version", WrapperrVersion)
	params.Add("X-Plex-Product", x_plex_product)
	params.Add("X-Plex-Model", x_plex_model)
	params.Add("X-Plex-Language", x_plex_language)
	params.Add("X-Plex-Token", PlexAuth)

	payload := strings.NewReader(params.Encode())

	req, err := http.NewRequest("GET", url_string, payload)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Accept", content_type)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)

	var body_reply models.PlexGetUserReply
	json.Unmarshal(body, &body_reply)
	if err != nil {
		return nil, err
	}

	return &body_reply, nil
}
