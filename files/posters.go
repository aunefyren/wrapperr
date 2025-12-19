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

// PosterReference holds information needed to download a poster
type PosterReference struct {
	ServerHash string
	RatingKey  int
	ThumbPath  string
}

// ExtractUserPosterReferences extracts all unique poster references from user statistics
// Only extracts from user-specific data (not year-wide stats which are cached)
func ExtractUserPosterReferences(reply models.WrapperrStatisticsReply) []PosterReference {
	posterMap := make(map[string]PosterReference) // Use map to deduplicate

	// Extract from user movies - duration list
	if reply.User.UserMovies.Data.MoviesDuration != nil {
		for _, entry := range reply.User.UserMovies.Data.MoviesDuration {
			if entry.Thumb != "" && entry.RatingKey != 0 && entry.TautulliServerHash != "" {
				key := fmt.Sprintf("%s_%d", entry.TautulliServerHash, entry.RatingKey)
				posterMap[key] = PosterReference{
					ServerHash: entry.TautulliServerHash,
					RatingKey:  entry.RatingKey,
					ThumbPath:  entry.Thumb,
				}
			}
		}
	}

	// Extract from user movies - plays list
	if reply.User.UserMovies.Data.MoviesPlays != nil {
		for _, entry := range reply.User.UserMovies.Data.MoviesPlays {
			if entry.Thumb != "" && entry.RatingKey != 0 && entry.TautulliServerHash != "" {
				key := fmt.Sprintf("%s_%d", entry.TautulliServerHash, entry.RatingKey)
				posterMap[key] = PosterReference{
					ServerHash: entry.TautulliServerHash,
					RatingKey:  entry.RatingKey,
					ThumbPath:  entry.Thumb,
				}
			}
		}
	}

	// Extract from user shows - duration list
	if reply.User.UserShows.Data.ShowsDuration != nil {
		for _, entry := range reply.User.UserShows.Data.ShowsDuration {
			if entry.Thumb != "" && entry.RatingKey != 0 && entry.TautulliServerHash != "" {
				key := fmt.Sprintf("%s_%d", entry.TautulliServerHash, entry.RatingKey)
				posterMap[key] = PosterReference{
					ServerHash: entry.TautulliServerHash,
					RatingKey:  entry.RatingKey,
					ThumbPath:  entry.Thumb,
				}
			}
		}
	}

	// Extract from user shows - plays list
	if reply.User.UserShows.Data.ShowsPlays != nil {
		for _, entry := range reply.User.UserShows.Data.ShowsPlays {
			if entry.Thumb != "" && entry.RatingKey != 0 && entry.TautulliServerHash != "" {
				key := fmt.Sprintf("%s_%d", entry.TautulliServerHash, entry.RatingKey)
				posterMap[key] = PosterReference{
					ServerHash: entry.TautulliServerHash,
					RatingKey:  entry.RatingKey,
					ThumbPath:  entry.Thumb,
				}
			}
		}
	}

	// Extract from special cards
	// Oldest Movie
	if reply.User.UserMovies.Data.UserMovieOldest.Thumb != "" &&
		reply.User.UserMovies.Data.UserMovieOldest.RatingKey != 0 &&
		reply.User.UserMovies.Data.UserMovieOldest.TautulliServerHash != "" {
		key := fmt.Sprintf("%s_%d", reply.User.UserMovies.Data.UserMovieOldest.TautulliServerHash,
			reply.User.UserMovies.Data.UserMovieOldest.RatingKey)
		posterMap[key] = PosterReference{
			ServerHash: reply.User.UserMovies.Data.UserMovieOldest.TautulliServerHash,
			RatingKey:  reply.User.UserMovies.Data.UserMovieOldest.RatingKey,
			ThumbPath:  reply.User.UserMovies.Data.UserMovieOldest.Thumb,
		}
	}

	// Most Paused Movie
	if reply.User.UserMovies.Data.UserMovieMostPaused.Thumb != "" &&
		reply.User.UserMovies.Data.UserMovieMostPaused.RatingKey != 0 &&
		reply.User.UserMovies.Data.UserMovieMostPaused.TautulliServerHash != "" {
		key := fmt.Sprintf("%s_%d", reply.User.UserMovies.Data.UserMovieMostPaused.TautulliServerHash,
			reply.User.UserMovies.Data.UserMovieMostPaused.RatingKey)
		posterMap[key] = PosterReference{
			ServerHash: reply.User.UserMovies.Data.UserMovieMostPaused.TautulliServerHash,
			RatingKey:  reply.User.UserMovies.Data.UserMovieMostPaused.RatingKey,
			ThumbPath:  reply.User.UserMovies.Data.UserMovieMostPaused.Thumb,
		}
	}

	// Longest Episode (show poster)
	if reply.User.UserShows.Data.EpisodeDurationLongest.Thumb != "" &&
		reply.User.UserShows.Data.EpisodeDurationLongest.RatingKey != 0 &&
		reply.User.UserShows.Data.EpisodeDurationLongest.TautulliServerHash != "" {
		key := fmt.Sprintf("%s_%d", reply.User.UserShows.Data.EpisodeDurationLongest.TautulliServerHash,
			reply.User.UserShows.Data.EpisodeDurationLongest.RatingKey)
		posterMap[key] = PosterReference{
			ServerHash: reply.User.UserShows.Data.EpisodeDurationLongest.TautulliServerHash,
			RatingKey:  reply.User.UserShows.Data.EpisodeDurationLongest.RatingKey,
			ThumbPath:  reply.User.UserShows.Data.EpisodeDurationLongest.Thumb,
		}
	}

	// Note: Show Buddy uses ShowsDuration[0] which is already extracted in the loop above

	// Convert map to slice
	posters := make([]PosterReference, 0, len(posterMap))
	for _, ref := range posterMap {
		posters = append(posters, ref)
	}

	return posters
}

// PreloadUserPosters downloads posters for user-specific statistics in parallel
// Returns counts of successful, skipped (already cached), and failed downloads
func PreloadUserPosters(
	posterRefs []PosterReference,
	tautulliConfigs []models.TautulliConfig,
	maxAgeDays int,
	maxConcurrency int,
) (successCount int, skippedCount int, errorCount int) {
	if len(posterRefs) == 0 {
		return 0, 0, 0
	}

	// Build server config lookup map
	serverConfigMap := make(map[string]models.TautulliConfig)
	for _, config := range tautulliConfigs {
		hash := GetTautulliServerHash(config)
		serverConfigMap[hash] = config
	}

	// Create channels for work distribution and results
	type downloadResult struct {
		success bool
		skipped bool
		error   error
	}

	jobs := make(chan PosterReference, len(posterRefs))
	results := make(chan downloadResult, len(posterRefs))

	// Start worker goroutines
	for w := 0; w < maxConcurrency; w++ {
		go func() {
			for ref := range jobs {
				// Find the correct Tautulli config
				tautulliConfig, found := serverConfigMap[ref.ServerHash]
				if !found {
					log.Printf("[Posters] Warning: Could not find Tautulli config for hash %s", ref.ServerHash)
					results <- downloadResult{success: false, skipped: false, error: errors.New("server config not found")}
					continue
				}

				// Check if poster already exists
				exists, _ := PosterExists(tautulliConfig, ref.RatingKey, maxAgeDays)
				if exists {
					results <- downloadResult{success: false, skipped: true, error: nil}
					continue
				}

				// Download poster
				_, err := DownloadPoster(tautulliConfig, ref.ThumbPath, ref.RatingKey)
				if err != nil {
					log.Printf("[Posters] Failed to preload poster for rating_key %d: %v", ref.RatingKey, err)
					results <- downloadResult{success: false, skipped: false, error: err}
					continue
				}

				results <- downloadResult{success: true, skipped: false, error: nil}

				// Rate limiting between successful downloads
				time.Sleep(100 * time.Millisecond)
			}
		}()
	}

	// Send jobs to workers
	for _, ref := range posterRefs {
		jobs <- ref
	}
	close(jobs)

	// Collect results
	successCount = 0
	skippedCount = 0
	errorCount = 0

	for i := 0; i < len(posterRefs); i++ {
		result := <-results
		if result.success {
			successCount++
		} else if result.skipped {
			skippedCount++
		} else {
			errorCount++
		}
	}

	log.Printf("[Posters] Preload complete: %d successful, %d skipped (cached), %d errors",
		successCount, skippedCount, errorCount)

	return successCount, skippedCount, errorCount
}
