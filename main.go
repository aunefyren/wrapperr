package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/aunefyren/wrapperr/files"
	"github.com/aunefyren/wrapperr/middlewares"
	"github.com/aunefyren/wrapperr/models"
	"github.com/aunefyren/wrapperr/routes"
	"github.com/aunefyren/wrapperr/utilities"

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

	// Change the config to respect flags
	config, err = parseFlags(config)
	if err != nil {
		log.Println("Failed to parse input flags. Error: " + err.Error())
		os.Exit(1)
	}
	log.Println("Flags parsed.")

	// Initialize poster directories if posters are enabled
	if config.WrapperrCustomize.EnablePosters {
		log.Println("Initializing poster directories...")
		err = files.InitializePosterDirectories(config)
		if err != nil {
			log.Println("Warning: Failed to initialize poster directories. Error: " + err.Error())
			// Don't exit - posters are optional
		}
	}

	// Alert what port is in use
	log.Println("Starting Wrapperr on port " + strconv.Itoa(config.WrapperrPort) + ".")

	// Initialize Router
	router := initRouter(config)

	// Get TSL
	certFound := files.CheckCertFiles()

	// Start server
	if certFound {
		log.Println("Starting using HTTPS.")
		certPath, certKeyPath := files.GetCertPaths()
		log.Fatal(router.RunTLS(":"+strconv.Itoa(config.WrapperrPort), certPath, certKeyPath))
	} else {
		log.Println("Starting using HTTP.")
		log.Fatal(router.Run(":" + strconv.Itoa(config.WrapperrPort)))
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
			// config pages
			open.POST("/get/wrapperr-version", routes.ApiGetWrapperrVersion)
			open.POST("/get/admin-state", routes.ApiGetAdminState)
			open.POST("/get/functions", routes.ApiGetFunctions)
			open.POST("/get/config-state", routes.ApiWrapperrConfigured)
			open.POST("/get/tautulli-connection", routes.ApiGetTautulliConncection)

			// usage pages
			open.POST("/get/share-link", routes.ApiGetShareLink)
			open.POST("/login/plex-auth", routes.ApiLoginPlexAuth)
			open.GET("/get/poster/:serverHash/:filename", routes.ApiGetPoster)
			open.POST("/download/poster", routes.ApiDownloadPoster)

			// admin pages
			open.POST("/login/admin", routes.ApiLogInAdmin)
			open.POST("/create/admin", routes.ApiCreateAdmin)
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
			admin.POST("/mfa/enroll", routes.ApiEnrollMFA)
			admin.POST("/mfa/activate", routes.ApiActivateMFA)
			admin.POST("/mfa/disable", routes.ApiDisableMFA)
			admin.POST("/get/log", routes.ApiGetLog)
			admin.POST("/get/timezones", routes.ApiGetTimezones)
			admin.POST("/get/cache-statistics", routes.ApiWrapperCacheStatistics)
			admin.POST("/get/users", routes.ApiGetUsers)
			admin.POST("/get/users/:userId", routes.ApiGetUser)
			admin.POST("/get/users/:userId/statistics", routes.ApiGetUserStatistics)
			admin.POST("/get/users/:userId/ignore", routes.ApiIgnoreUser)
			admin.POST("/sync/users", routes.ApiSyncTautulliUsers)
			admin.POST("/clean/poster-cache", routes.ApiCleanPosterCache)
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

	if !config.DisableAdminPage {
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
	}

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

// boolToFlagString renders a bool as the "true"/"false" string used by the string-based boolean flags.
func boolToFlagString(value bool) string {
	if value {
		return "true"
	}
	return "false"
}

// parseFlags overlays command-line flags onto the configuration loaded from disk.
//
// Only flags that are *explicitly* provided on the command line override the
// corresponding config value; any flag left unset keeps the value already in
// config.json. The config is re-saved only when at least one flag was supplied,
// so a plain start never rewrites the file with unchanged data.
func parseFlags(configFile models.WrapperrConfig) (models.WrapperrConfig, error) {
	// Define flag variables with the configuration file as default values.
	// Booleans are taken as strings so an unset flag is distinguishable and
	// "true"/"false" can be passed straight through from environment variables.
	var port = flag.Int("port", configFile.WrapperrPort, "The port Wrapperr is listening on.")
	var timezone = flag.String("timezone", configFile.Timezone, "The timezone Wrapperr is running in.")
	var applicationName = flag.String("applicationname", configFile.ApplicationName, "The name shown for this Wrapperr instance.")
	var applicationURL = flag.String("applicationurl", configFile.ApplicationURL, "The external URL Wrapperr is reachable at.")
	var wrapperrRoot = flag.String("wrapperrroot", configFile.WrapperrRoot, "The sub-path Wrapperr is served from (reverse proxy root).")
	var createShareLink = flag.String("createsharelink", boolToFlagString(configFile.CreateShareLinks), "If users can generate shareable links.")
	var plexAuth = flag.String("plexauth", boolToFlagString(configFile.PlexAuth), "If users must log in with Plex Auth.")
	var basicAuth = flag.String("basicauth", boolToFlagString(configFile.BasicAuth), "If admin routes require HTTP Basic auth.")
	var useCache = flag.String("usecache", boolToFlagString(configFile.UseCache), "If Tautulli data is cached to disk.")
	var useLogs = flag.String("uselogs", boolToFlagString(configFile.UseLogs), "If logs are written to file and stdout.")
	var winterTheme = flag.String("wintertheme", boolToFlagString(configFile.WinterTheme), "If the winter theme is enabled.")
	var disableAdminPage = flag.String("disableadminpage", boolToFlagString(configFile.DisableAdminPage), "If the admin web pages are disabled.")

	// Parse flags
	flag.Parse()

	// Record which flags were explicitly supplied on the command line.
	// flag pointers are never nil after Parse(), so this is the only reliable
	// way to tell a deliberately-set flag from one left at its config default.
	provided := map[string]bool{}
	flag.Visit(func(f *flag.Flag) { provided[f.Name] = true })

	// Apply each flag only when it was actually provided.
	if provided["port"] {
		configFile.WrapperrPort = *port
	}
	if provided["timezone"] {
		configFile.Timezone = *timezone
	}
	if provided["applicationname"] {
		configFile.ApplicationName = *applicationName
	}
	if provided["applicationurl"] {
		configFile.ApplicationURL = *applicationURL
	}
	if provided["wrapperrroot"] {
		configFile.WrapperrRoot = *wrapperrRoot
	}
	if provided["createsharelink"] {
		configFile.CreateShareLinks = strings.EqualFold(*createShareLink, "true")
	}
	if provided["plexauth"] {
		configFile.PlexAuth = strings.EqualFold(*plexAuth, "true")
	}
	if provided["basicauth"] {
		configFile.BasicAuth = strings.EqualFold(*basicAuth, "true")
	}
	if provided["usecache"] {
		configFile.UseCache = strings.EqualFold(*useCache, "true")
	}
	if provided["uselogs"] {
		configFile.UseLogs = strings.EqualFold(*useLogs, "true")
	}
	if provided["wintertheme"] {
		configFile.WinterTheme = strings.EqualFold(*winterTheme, "true")
	}
	if provided["disableadminpage"] {
		configFile.DisableAdminPage = strings.EqualFold(*disableAdminPage, "true")
	}

	// Failsafe, if port is 0, set to default 8282
	if configFile.WrapperrPort == 0 {
		configFile.WrapperrPort = 8282
	}

	// Nothing was overridden on the command line, so leave config.json untouched.
	if len(provided) == 0 {
		return configFile, nil
	}

	// Persist the overridden values back to config.json.
	err := files.SaveConfig(configFile)
	if err != nil {
		return configFile, err
	}

	return configFile, nil
}
