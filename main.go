package main

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/routes"
	"aunefyren/wrapperr/utilities"
	"context"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/procyon-projects/chrono"

	_ "time/tzdata"
)

func main() {

	utilities.PrintASCII()

	// Create and define file for logging
	logFile, err := os.OpenFile("config/wrapperr.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		fmt.Println("Failed to load log file. Error: " + err.Error())
		os.Exit(1)
	}

	// Set log file as log destination
	log.SetOutput(logFile)
	fmt.Println("Log file set.")

	// Load config file
	config, err := files.GetConfig()
	if err != nil {
		fmt.Println("Failed to load configuration file. Error: " + err.Error())
		os.Exit(1)
	}

	var mw io.Writer
	// Set log file is logging is enabled
	if config.UseLogs {
		out := os.Stdout
		mw = io.MultiWriter(out, logFile)
	} else {
		out := os.Stdout
		mw = io.MultiWriter(out)
	}
	// Get pipe reader and writer | writes to pipe writer come out pipe reader
	_, w, _ := os.Pipe()

	// Replace stdout,stderr with pipe writer | all writes to stdout, stderr will go through pipe instead (log.print, log)
	os.Stdout = w
	os.Stderr = w

	// writes with log.Print should also write to mw
	log.SetOutput(mw)

	// Set time zone from config if it is not empty
	if config.Timezone != "" {
		loc, err := time.LoadLocation(config.Timezone)
		if err != nil {

			log.Println("Failed to set time zone from config. Error: " + err.Error())
			log.Println("Removing value...")

			config.Timezone = ""
			err = files.SaveConfig(config)
			if err != nil {
				log.Println("Failed to set new time zone in the config. Error: " + err.Error())
				log.Println("Exiting...")
				os.Exit(1)
			}

		} else {
			time.Local = loc
			log.Println("Timezone set to " + config.Timezone + ".")
		}
	}

	// Print current version
	log.Println("Running version " + config.WrapperrVersion + ".")

	// Define port variable with the port from the config file as default
	var port int
	flag.IntVar(&port, "port", config.WrapperrPort, "The port Wrapperr is listening on.")

	// Parse the flags from input
	flag.Parse()

	// Alert what port is in use
	log.Println("Starting Wrapperr on port " + strconv.Itoa(port) + ".")

	// Assign routes
	router := mux.NewRouter().StrictSlash(true)

	var root string
	if config.WrapperrRoot != "" {
		root = "/" + config.WrapperrRoot
	} else {
		root = ""
	}

	// Admin auth routes
	router.HandleFunc(root+"/api/validate/admin", routes.ApiValidateAdmin)
	router.HandleFunc(root+"/api/get/config", routes.ApiGetConfig)
	router.HandleFunc(root+"/api/get/log", routes.ApiGetLog)
	router.HandleFunc(root+"/api/set/config", routes.ApiSetConfig)
	router.HandleFunc(root+"/api/update/admin", routes.ApiUpdateAdmin)

	// No-auth routes
	router.HandleFunc(root+"/api/get/config-state", routes.ApiWrapperrConfigured)
	router.HandleFunc(root+"/api/login/admin", routes.ApiLogInAdmin)
	router.HandleFunc(root+"/api/get/wrapperr-version", routes.ApiGetWrapperrVersion)
	router.HandleFunc(root+"/api/get/admin-state", routes.ApiGetAdminState)
	router.HandleFunc(root+"/api/get/functions", routes.ApiGetFunctions)
	router.HandleFunc(root+"/api/create/admin", routes.ApiCreateAdmin)
	router.HandleFunc(root+"/api/get/tautulli-connection", routes.ApiGetTautulliConncection)
	router.HandleFunc(root+"/api/get/share-link", routes.ApiGetShareLink)

	// User auth routes
	router.HandleFunc(root+"/api/get/login-url", routes.ApiGetLoginURL)
	router.HandleFunc(root+"/api/login/plex-auth", routes.ApiLoginPlexAuth)
	router.HandleFunc(root+"/api/validate/plex-auth", routes.ApiValidatePlexAuth)
	router.HandleFunc(root+"/api/get/user-share-link", routes.ApiGetUserShareLink)

	// Depends on config
	router.HandleFunc(root+"/api/delete/user-share-link", routes.ApiDeleteUserShareLink)
	router.HandleFunc(root+"/api/create/share-link", routes.ApiCreateShareLink)

	// Get stats route
	router.HandleFunc(root+"/api/get/statistics", routes.ApiWrapperGetStatistics)

	// Assets route
	assetsFileServer := http.FileServer(http.Dir("./web/assets/"))
	router.PathPrefix(root + "/assets").Handler(http.StripPrefix(root+"/assets", assetsFileServer))

	// JS route
	jsFileServer := http.FileServer(http.Dir("./web/js/"))
	router.PathPrefix(root + "/js").Handler(http.StripPrefix(root+"/js", jsFileServer))

	// HTML frontpage route
	router.HandleFunc(root+"/", func(w http.ResponseWriter, r *http.Request) {
		// Using the http.ServeFile function to serve the frontpage.html file
		http.ServeFile(w, r, "./web/html/frontpage.html")
	})

	// HTML admin route
	router.HandleFunc(root+"/admin", func(w http.ResponseWriter, r *http.Request) {
		// Using the http.ServeFile function to serve the admin.html file
		http.ServeFile(w, r, "./web/html/admin.html")
	})

	// TXT robots route
	router.HandleFunc(root+"/robots.txt", func(w http.ResponseWriter, r *http.Request) {
		// Using the http.ServeFile function to serve the robots.txt file
		http.ServeFile(w, r, "./web/txt/robots.txt")
	})

	// Create task scheduler for sunday reminders
	taskScheduler := chrono.NewDefaultTaskScheduler()

	_, err = taskScheduler.ScheduleWithCron(func(ctx context.Context) {
		log.Println("Shareable link cleaner starting.")
		files.CleanOldShareableLinks()
	}, "0 0 0 * * *")

	if err != nil {
		log.Println("Shareable link cleaner was not scheduled successfully. Error: " + err.Error())
	}

	// Start web-server
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
}
