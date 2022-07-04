package main

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"path/filepath"
)

var cache_path, _ = filepath.Abs("./config/cache.json")

// Saves the given config struct as cache.json
func SaveCache(cache *[]WrapperrDay) error {

	file, err := json.MarshalIndent(cache, "", "	")
	if err != nil {
		return err
	}

	err = os.WriteFile(cache_path, file, 0644)
	if err != nil {
		return err
	}

	return nil
}

// Saves an empty cache, clearing any data present
func ClearCache() error {
	cache := []WrapperrDay{}

	err := SaveCache(&cache)
	if err != nil {
		return err
	}

	return nil
}

// Creates empty cache.json
func CreateCacheFile() error {

	var cache []WrapperrDay

	err := SaveCache(&cache)
	if err != nil {
		return err
	}

	return nil
}

// Read the cache file and return the file as an object
func GetCache() ([]WrapperrDay, error) {
	// Create cache.json if it doesn't exist
	if _, err := os.Stat(cache_path); errors.Is(err, os.ErrNotExist) {

		log.Println("Failed to load cache file.")

		err = CreateCacheFile()
		if err != nil {
			log.Println("Failed to create new cache file. Restarting Wrapperr.")
			err = RestartSelf()
			if err != nil {
				return nil, err
			}
		}
	}

	// Load cache file for alterations, information
	var cache []WrapperrDay
	file, err := os.Open(cache_path)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&cache)
	if err != nil {
		return nil, err
	}

	// Return cache object
	return cache, nil
}
