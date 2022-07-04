package main

import (
	"bufio"
	"log"
	"os"
	"path/filepath"
	"regexp"
)

var log_path, _ = filepath.Abs("./config/wrapperr.log")
var max_lines_returned = 200

func GetLogLines() ([]WrapperrLogLine, error) {

	readFile, err := os.Open(log_path)

	if err != nil {
		log.Println(err)
		return nil, err
	}

	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)
	var fileLines []string

	for fileScanner.Scan() {
		fileLines = append(fileLines, fileScanner.Text())
	}

	readFile.Close()

	var logline_array []WrapperrLogLine
	var re = regexp.MustCompile(`([0-9]{4,4}\/{1,1}[0-9]{2,2}\/[0-9]{2,2})\s([0-9]{2,2}:[0-9]{2,2}:[0-9]{2,2})\s([^\n]{1,})`)

	for _, line := range fileLines {

		match := re.FindStringSubmatch(line)

		var logline WrapperrLogLine

		if len(match) != 4 {

			logline.Date = "Error"
			logline.Time = "Error"
			logline.Message = "This line was unparseable for front-end reading."

		} else {

			logline.Date = match[1]
			logline.Time = match[2]
			logline.Message = match[3]

		}

		logline_array = append(logline_array, logline)

	}

	if len(logline_array) > max_lines_returned {

		logline_array = logline_array[len(logline_array)-max_lines_returned:]

	}

	return logline_array, nil
}
