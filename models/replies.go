package models

type BooleanReply struct {
	Message string `json:"message"`
	Error   bool   `json:"error"`
	Data    bool   `json:"data"`
}

type StringReply struct {
	Message string `json:"message"`
	Error   bool   `json:"error"`
	Data    string `json:"data"`
}

type ConfigReply struct {
	Message  string         `json:"message"`
	Error    bool           `json:"error"`
	Data     WrapperrConfig `json:"data"`
	Username string         `json:"username"`
}

type DefaultReply struct {
	Message string `json:"message"`
	Error   bool   `json:"error"`
}

type GetLoginURLReply struct {
	ID      int    `json:"id"`
	Code    string `json:"code"`
	URL     string `json:"url"`
	Message string `json:"message"`
	Error   bool   `json:"error"`
}
