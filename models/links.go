package models

type WrapperrShareLinkCreateRequest struct {
	Data      WrapperrStatisticsReply `json:"data"`
	Functions WrapperrCustomize       `json:"functions"`
}

type WrapperrShareLinkGetRequest struct {
	Hash string `json:"hash"`
}

type WrapperrShareLink struct {
	Date            string                         `json:"date"`
	UserID          int                            `json:"user_id"`
	WrapperrVersion string                         `json:"wrapperr_version"`
	Hash            string                         `json:"hash"`
	Content         WrapperrShareLinkCreateRequest `json:"content"`
	Message         string                         `json:"message"`
	Error           bool                           `json:"error"`
	Expired         bool                           `json:"expired"`
}
