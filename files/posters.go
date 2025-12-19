package files

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aunefyren/wrapperr/models"
	"github.com/aunefyren/wrapperr/utilities"
)

var posters_base_path, _ = filepath.Abs("./config/posters")

// GetTautulliServerHash generates a unique hash from Tautulli server config
// This prevents rating_key collisions between different servers
func GetTautulliServerHash(config models.TautulliConfig) string {
	protocol := "http"
	if config.TautulliHttps {
		protocol = "https"
	}
	serverString := fmt.Sprintf("%s://%s:%d%s",
		protocol, config.TautulliIP, config.TautulliPort, config.TautulliRoot)

	hash := sha256.Sum256([]byte(serverString))
	return hex.EncodeToString(hash[:])[:16] // Use first 16 chars for brevity
}

// InitializePosterDirectories creates poster directory structure
// Called on application startup if EnablePosters is true
func InitializePosterDirectories(config models.WrapperrConfig) error {
	// Create base posters directory
	if err := os.MkdirAll(posters_base_path, 0755); err != nil {
		return fmt.Errorf("failed to create posters directory: %w", err)
	}

	// Create subdirectory for each Tautulli server
	for _, tautulliConfig := range config.TautulliConfig {
		serverHash := GetTautulliServerHash(tautulliConfig)
		serverPath := filepath.Join(posters_base_path, serverHash)

		if err := os.MkdirAll(serverPath, 0755); err != nil {
			return fmt.Errorf("failed to create poster directory for server %s: %w",
				tautulliConfig.TautulliName, err)
		}

		log.Printf("[Posters] Initialized directory for server '%s': %s",
			tautulliConfig.TautulliName, serverHash)
	}

	return nil
}

// DownloadPoster downloads a single poster from Tautulli's pms_image_proxy endpoint
func DownloadPoster(tautulliConfig models.TautulliConfig, thumbPath string, ratingKey int) (string, error) {
	if thumbPath == "" {
		return "", errors.New("empty thumb path")
	}

	// Build Tautulli base URL
	urlString, err := utilities.BuildURL(
		tautulliConfig.TautulliPort,
		tautulliConfig.TautulliIP,
		tautulliConfig.TautulliHttps,
		tautulliConfig.TautulliRoot,
	)
	if err != nil {
		return "", fmt.Errorf("failed to build URL: %w", err)
	}

	// Tautulli pms_image_proxy endpoint
	// Reference: https://github.com/Tautulli/Tautulli/wiki/Tautulli-API-Reference#pms_image_proxy
	posterURL := fmt.Sprintf("%sapi/v2/?apikey=%s&cmd=pms_image_proxy&img=%s&width=300&height=450",
		urlString, tautulliConfig.TautulliApiKey, thumbPath)

	// Create HTTP request
	req, err := http.NewRequest("GET", posterURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Execute request with timeout
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to download poster: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("received non-200 status: %d", resp.StatusCode)
	}

	// Generate filename and path
	serverHash := GetTautulliServerHash(tautulliConfig)
	filename := fmt.Sprintf("%d.jpg", ratingKey)
	serverDir := filepath.Join(posters_base_path, serverHash)
	posterPath := filepath.Join(serverDir, filename)

	// Ensure directory exists
	if err := os.MkdirAll(serverDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Save image to file
	outFile, err := os.Create(posterPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to save poster: %w", err)
	}

	log.Printf("[Posters] Downloaded poster for rating_key %d (server: %s)", ratingKey, tautulliConfig.TautulliName)
	return posterPath, nil
}

// PosterExists checks if poster exists and is not expired
func PosterExists(tautulliConfig models.TautulliConfig, ratingKey int, maxAgeDays int) (bool, string) {
	serverHash := GetTautulliServerHash(tautulliConfig)
	filename := fmt.Sprintf("%d.jpg", ratingKey)
	posterPath := filepath.Join(posters_base_path, serverHash, filename)

	info, err := os.Stat(posterPath)
	if err != nil {
		return false, ""
	}

	// Check if file is too old
	if maxAgeDays > 0 {
		ageThreshold := time.Now().AddDate(0, 0, -maxAgeDays)
		if info.ModTime().Before(ageThreshold) {
			log.Printf("[Posters] Poster expired for rating_key %d (age: %v)", ratingKey, time.Since(info.ModTime()))
			return false, posterPath // Exists but expired
		}
	}

	return true, posterPath
}

// DownloadPostersForEntries batch downloads posters for a list of entries
// Called during cache build process
func DownloadPostersForEntries(
	entries []models.TautulliEntry,
	tautulliConfigs []models.TautulliConfig,
	maxAgeDays int,
) error {
	// Map server hashes to configs for quick lookup
	serverConfigMap := make(map[string]models.TautulliConfig)
	for _, config := range tautulliConfigs {
		hash := GetTautulliServerHash(config)
		serverConfigMap[hash] = config
	}

	successCount := 0
	errorCount := 0
	skippedCount := 0

	for _, entry := range entries {
		// Skip entries without poster data
		if entry.Thumb == "" || entry.RatingKey == 0 {
			continue
		}

		// Find the correct Tautulli config
		tautulliConfig, found := serverConfigMap[entry.TautulliServerHash]
		if !found {
			log.Printf("[Posters] Warning: Could not find Tautulli config for hash %s", entry.TautulliServerHash)
			errorCount++
			continue
		}

		// Check if poster already exists and is valid
		exists, _ := PosterExists(tautulliConfig, entry.RatingKey, maxAgeDays)
		if exists {
			skippedCount++
			continue
		}

		// Download poster
		_, err := DownloadPoster(tautulliConfig, entry.Thumb, entry.RatingKey)
		if err != nil {
			log.Printf("[Posters] Failed to download poster for rating_key %d: %v", entry.RatingKey, err)
			errorCount++
			continue
		}

		successCount++

		// Rate limiting - don't hammer the server
		time.Sleep(100 * time.Millisecond)
	}

	log.Printf("[Posters] Download complete: %d successful, %d skipped (cached), %d errors",
		successCount, skippedCount, errorCount)
	return nil
}

// CleanExpiredPosters removes posters older than maxAgeDays
// Can be called manually via admin endpoint
func CleanExpiredPosters(maxAgeDays int) error {
	if maxAgeDays <= 0 {
		return nil
	}

	ageThreshold := time.Now().AddDate(0, 0, -maxAgeDays)
	removedCount := 0

	err := filepath.Walk(posters_base_path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && strings.HasSuffix(info.Name(), ".jpg") {
			if info.ModTime().Before(ageThreshold) {
				log.Printf("[Posters] Removing expired poster: %s", path)
				if err := os.Remove(path); err != nil {
					return err
				}
				removedCount++
			}
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to clean posters: %w", err)
	}

	log.Printf("[Posters] Cleanup complete: removed %d expired posters", removedCount)
	return nil
}

// GetPosterPath returns the absolute path to a poster file
// Used by the API endpoint to serve posters
func GetPosterPath(serverHash string, filename string) (string, error) {
	posterPath := filepath.Join(posters_base_path, serverHash, filename)

	// Security check - ensure path is within posters directory
	absPath, err := filepath.Abs(posterPath)
	if err != nil {
		return "", err
	}

	absBase, err := filepath.Abs(posters_base_path)
	if err != nil {
		return "", err
	}

	if !strings.HasPrefix(absPath, absBase) {
		return "", errors.New("invalid path: potential path traversal")
	}

	return absPath, nil
}
