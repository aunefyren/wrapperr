package main

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/routes"
	"aunefyren/wrapperr/utilities"
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

	utilities.PrintASCII()

	// Create and define file for logging
	file, err := os.OpenFile("config/wrapperr.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Println("Failed to load configuration file. Error: ")
		log.Println(err)

		fmt.Println("Failed to load configuration file. Error: ")
		fmt.Println(err)

		os.Exit(1)
	}

	config, err := files.GetConfig()
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
			err = files.SaveConfig(config)
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
	router.HandleFunc("/api/validate/admin", routes.ApiValidateAdmin)
	router.HandleFunc("/api/get/config", routes.ApiGetConfig)
	router.HandleFunc("/api/get/log", routes.ApiGetLog)
	router.HandleFunc("/api/set/config", routes.ApiSetConfig)
	router.HandleFunc("/api/update/admin", routes.ApiUpdateAdmin)

	// No-auth routes
	router.HandleFunc("/api/get/config-state", routes.ApiWrapperrConfigured)
	router.HandleFunc("/api/login/admin", routes.ApiLogInAdmin)
	router.HandleFunc("/api/get/wrapperr-version", routes.ApiGetWrapperrVersion)
	router.HandleFunc("/api/get/admin-state", routes.ApiGetAdminState)
	router.HandleFunc("/api/get/functions", routes.ApiGetFunctions)
	router.HandleFunc("/api/create/admin", routes.ApiCreateAdmin)
	router.HandleFunc("/api/get/tautulli-connection", routes.ApiGetTautulliConncection)
	router.HandleFunc("/api/get/share-link", routes.ApiGetShareLink)

	// User auth routes
	router.HandleFunc("/api/get/login-url", routes.ApiGetLoginURL)
	router.HandleFunc("/api/login/plex-auth", routes.ApiLoginPlexAuth)
	router.HandleFunc("/api/validate/plex-auth", routes.ApiValidatePlexAuth)
	router.HandleFunc("/api/create/share-link", routes.ApiCreateShareLink)
	router.HandleFunc("/api/get/user-share-link", routes.ApiGetUserShareLink)
	router.HandleFunc("/api/delete/user-share-link", routes.ApiDeleteUserShareLink)

	// Get stats route
	router.HandleFunc("/api/get/statistics", routes.ApiWrapperGetStatistics)

	// Static routes
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/")))

	// Start web-server
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
}
