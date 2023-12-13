package main

import (
	"aunefyren/wrapperr/files"
	"aunefyren/wrapperr/middlewares"
	"aunefyren/wrapperr/models"
	"aunefyren/wrapperr/routes"
	"aunefyren/wrapperr/utilities"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "time/tzdata"
)

func main() {
	utilities.PrintASCII()
	gin.SetMode(gin.ReleaseMode)

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

	// Initialize Router
	router := initRouter(config)

	// Get TSL
	certFound := files.CheckCertFiles()

	// Start server
	if certFound {
		log.Println("Starting using HTTPS.")
		certPath, certKeyPath := files.GetCertPaths()
		log.Fatal(router.RunTLS(":"+strconv.Itoa(port), certPath, certKeyPath))
	} else {
		log.Println("Starting using HTTP.")
		log.Fatal(router.Run(":" + strconv.Itoa(port)))
	}
}

func initRouter(config models.WrapperrConfig) *gin.Engine {
	var root string
	if config.WrapperrRoot != "" {
		root = "/" + config.WrapperrRoot
	} else {
		root = ""
	}

	router := gin.Default()

	router.LoadHTMLGlob("web/*/*.html")

	// API endpoint
	api := router.Group(root + "/api")
	{
		// Requires no auth token
		open := api.Group("")
		{
			open.POST("/get/wrapperr-version", routes.ApiGetWrapperrVersion)
			open.POST("/get/admin-state", routes.ApiGetAdminState)
			open.POST("/get/functions", routes.ApiGetFunctions)
			open.POST("/create/admin", routes.ApiCreateAdmin)
			open.POST("/get/config-state", routes.ApiWrapperrConfigured)
			open.POST("/login/admin", routes.ApiLogInAdmin)
			open.POST("/get/tautulli-connection", routes.ApiGetTautulliConncection)
			open.POST("/get/share-link", routes.ApiGetShareLink)
			open.POST("/login/plex-auth", routes.ApiLoginPlexAuth)
		}

		// Can be user auth based on config
		both := api.Group("")
		{
			both.POST("/create/share-link", routes.ApiCreateShareLink)
			both.POST("/get/statistics", routes.ApiWrapperGetStatistics)
		}

		// Must include an auth token (With Plex auth)
		auth := api.Group("").Use(middlewares.AuthMiddleware(false))
		{
			auth.POST("/get/login-url", routes.ApiGetLoginURL)
			auth.POST("/validate/plex-auth", routes.ApiValidatePlexAuth)
			auth.POST("/get/user-share-link", routes.ApiGetUserShareLink)
			auth.POST("/delete/user-share-link", routes.ApiDeleteUserShareLink)
		}

		// Must include an auth token (With admin)
		admin := api.Group("").Use(middlewares.AuthMiddleware(true))
		{
			admin.POST("/validate/admin", routes.ApiValidateAdmin)
			admin.POST("/get/config", routes.ApiGetConfig)
			admin.POST("/set/config", routes.ApiSetConfig)
			admin.POST("/update/admin", routes.ApiUpdateAdmin)
			admin.POST("/get/log", routes.ApiGetLog)
			admin.POST("/get/timezones", routes.ApiGetTimezones)
			admin.POST("/get/cache-statistics", routes.ApiWrapperCacheStatistics)
			admin.POST("/get/users", routes.ApiGetUsers)
			admin.POST("/get/users/:userId", routes.ApiGetUser)
			admin.POST("/get/users/:userId/ignore", routes.ApiIgnoreUser)
			admin.POST("/sync/users", routes.ApiSyncTautulliUsers)
		}
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		// AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Access-Control-Allow-Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc:  func(origin string) bool { return true },
		MaxAge:           12 * time.Hour,
	}))

	// Static endpoint for different directories
	router.Static(root+"/assets", "./web/assets")
	router.Static(root+"/js", "./web/js")

	// Static endpoint for homepage
	router.GET(root+"/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "frontpage.html", nil)
	})

	// Static endpoint for admin functions
	router.GET(root+"/admin", func(c *gin.Context) {
		c.HTML(http.StatusOK, "admin.html", nil)
	})

	// Static endpoint for Tautulli admin functions
	router.GET(root+"/admin/tautulli", func(c *gin.Context) {
		c.HTML(http.StatusOK, "tautulli.html", nil)
	})

	// Static endpoint for admin settings functions
	router.GET(root+"/admin/settings", func(c *gin.Context) {
		c.HTML(http.StatusOK, "settings.html", nil)
	})

	// Static endpoint for admin customization functions
	router.GET(root+"/admin/customization", func(c *gin.Context) {
		c.HTML(http.StatusOK, "customization.html", nil)
	})

	// Static endpoint for admin caching functions
	router.GET(root+"/admin/caching", func(c *gin.Context) {
		c.HTML(http.StatusOK, "caching.html", nil)
	})

	// Static endpoint for admin log functions
	router.GET(root+"/admin/logs", func(c *gin.Context) {
		c.HTML(http.StatusOK, "logs.html", nil)
	})

	// Static endpoint for admin users functions
	router.GET(root+"/admin/users", func(c *gin.Context) {
		c.HTML(http.StatusOK, "users.html", nil)
	})

	// Static endpoint for robots.txt
	router.GET(root+"/robots.txt", func(c *gin.Context) {
		TXTfile, err := os.ReadFile("./web/txt/robots.txt")
		if err != nil {
			fmt.Println("Reading robots.txt threw error trying to open the file. Error: " + err.Error())
		}
		c.Data(http.StatusOK, "text/plain", TXTfile)
	})

	// Static endpoint for service-worker
	router.GET("/service-worker.js", func(c *gin.Context) {
		JSfile, err := os.ReadFile("./web/js/service-worker.js")
		if err != nil {
			fmt.Println("Reading service-worker threw error trying to open the file. Error: " + err.Error())
		}
		c.Data(http.StatusOK, "text/javascript", JSfile)
	})

	// Static endpoint for manifest
	router.GET("/manifest.json", func(c *gin.Context) {
		JSONfile, err := os.ReadFile("./web/json/manifest.json")
		if err != nil {
			fmt.Println("Reading manifest threw error trying to open the file. Error: " + err.Error())
		}
		c.Data(http.StatusOK, "text/json", JSONfile)
	})

	return router
}
