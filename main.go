package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"

	_ "time/tzdata"
)

func main() {

	PrintASCII()

	// Create and define file for logging
	file, err := os.OpenFile("config/wrapperr.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Println("Failed to load configuration file. Error: ")
		log.Println(err)

		fmt.Println("Failed to load configuration file. Error: ")
		fmt.Println(err)

		os.Exit(1)
	}

	config, err := GetConfig()
	if err != nil {
		log.Println("Failed to load configuration file. Error: ")
		log.Println(err)

		fmt.Println("Failed to load configuration file. Error: ")
		fmt.Println(err)

		os.Exit(1)
	}

	// Set time zone from config if it is not empty
	if config.Timezone != "" {
		loc, err := time.LoadLocation(config.Timezone)
		if err != nil {
			fmt.Println("Failed to set time zone from config. Error: ")
			fmt.Println(err)
			fmt.Println("Removing value...")

			log.Println("Failed to set time zone from config. Error: ")
			log.Println(err)
			log.Println("Removing value...")

			config.Timezone = ""
			err = SaveConfig(config)
			if err != nil {
				log.Println("Failed to set new time zone in the config. Error: ")
				log.Println(err)
				log.Println("Exiting...")
				os.Exit(1)
			}

		} else {
			time.Local = loc
		}
	}

	// Set log file is logging is enabled
	if config.UseLogs {
		log.SetOutput(file)
	}

	// Define port variable with the port from the config file as default
	var port int
	flag.IntVar(&port, "port", config.WrapperrPort, "The port Wrapperr is listening on.")

	// Parse the flags from input
	flag.Parse()

	// Alert what port is in use
	log.Println("Starting Wrapperr on port: " + strconv.Itoa(port) + ".")
	fmt.Println("Starting Wrapperr on port: " + strconv.Itoa(port) + ".")

	// Assign routes
	router := mux.NewRouter().StrictSlash(true)

	// Admin auth routes
	router.HandleFunc("/api/validate/admin", ApiValidateAdmin)
	router.HandleFunc("/api/get/config", ApiGetConfig)
	router.HandleFunc("/api/get/log", ApiGetLog)
	router.HandleFunc("/api/set/config", ApiSetConfig)
	router.HandleFunc("/api/update/admin", ApiUpdateAdmin)

	// No-auth routes
	router.HandleFunc("/api/get/config-state", ApiWrapperrConfigured)
	router.HandleFunc("/api/login/admin", ApiLogInAdmin)
	router.HandleFunc("/api/get/wrapperr-version", ApiGetWrapperrVersion)
	router.HandleFunc("/api/get/admin-state", ApiGetAdminState)
	router.HandleFunc("/api/get/functions", ApiGetFunctions)
	router.HandleFunc("/api/create/admin", ApiCreateAdmin)
	router.HandleFunc("/api/get/tautulli-connection", ApiGetTautulliConncection)
	router.HandleFunc("/api/get/share-link", ApiGetShareLink)

	// User auth routes
	router.HandleFunc("/api/get/login-url", ApiGetLoginURL)
	router.HandleFunc("/api/login/plex-auth", ApiLoginPlexAuth)
	router.HandleFunc("/api/validate/plex-auth", ApiValidatePlexAuth)
	router.HandleFunc("/api/create/share-link", ApiCreateShareLink)
	router.HandleFunc("/api/get/user-share-link", ApiGetUserShareLink)
	router.HandleFunc("/api/delete/user-share-link", ApiDeleteUserShareLink)

	// Get stats route
	router.HandleFunc("/api/get/statistics", ApiWrapperGetStatistics)

	// Static routes
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/")))

	// Start web-server
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
}
