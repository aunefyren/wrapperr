package files

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"testing"

	"github.com/aunefyren/wrapperr/models"
)

// TestConfigConcurrentReadWrite hammers GetConfig and SaveConfig from many
// goroutines at once — the exact pattern (parallel HTTP handlers all touching
// config.json) that previously truncated the file mid-write and wiped the
// Tautulli config. With the in-memory cache + atomic write-through it must never
// corrupt the file or lose the Tautulli API key. Run with -race.
func TestConfigConcurrentReadWrite(t *testing.T) {
	dir := t.TempDir()

	// Point the package paths at temp files for the duration of the test.
	origConfig, origDefault := config_path, default_config_path
	origCache := configCache
	t.Cleanup(func() {
		config_path, default_config_path = origConfig, origDefault
		configCache = origCache
	})

	config_path = filepath.Join(dir, "config.json")
	default_config_path, _ = filepath.Abs("./configDefault.json")
	configCache = nil

	// Seed a configured config with a Tautulli API key that must survive.
	seed := models.WrapperrConfig{
		WrapperrVersion: "{{RELEASE_TAG}}",
		Timezone:        "Europe/Paris",
		WrappedStart:    1,
		WrappedEnd:      2,
		PrivateKey:      "0123456789012345678901234567890123456789",
		TautulliConfig: []models.TautulliConfig{{
			TautulliApiKey: "SECRET_KEY",
			TautulliIP:     "10.0.0.1",
			TautulliLength: 5000,
			TautulliPort:   80,
		}},
	}
	if err := SaveConfig(seed); err != nil {
		t.Fatalf("seed save failed: %v", err)
	}

	var wg sync.WaitGroup
	const goroutines = 32
	const iterations = 50

	for g := 0; g < goroutines; g++ {
		wg.Add(1)
		go func(g int) {
			defer wg.Done()
			for i := 0; i < iterations; i++ {
				cfg, err := GetConfig()
				if err != nil {
					t.Errorf("GetConfig failed: %v", err)
					return
				}
				if cfg.TautulliConfig[0].TautulliApiKey != "SECRET_KEY" {
					t.Errorf("Tautulli API key lost: %q", cfg.TautulliConfig[0].TautulliApiKey)
					return
				}
				// A subset of goroutines also write, like the admin save path.
				if g%4 == 0 {
					if err := SaveConfig(cfg); err != nil {
						t.Errorf("SaveConfig failed: %v", err)
						return
					}
				}
			}
		}(g)
	}
	wg.Wait()

	// The on-disk file must still be valid JSON with the key intact.
	raw, err := os.ReadFile(config_path)
	if err != nil {
		t.Fatalf("read final config: %v", err)
	}
	var final models.WrapperrConfig
	if err := json.Unmarshal(raw, &final); err != nil {
		t.Fatalf("final config is not valid JSON (corrupted): %v", err)
	}
	if final.TautulliConfig[0].TautulliApiKey != "SECRET_KEY" {
		t.Fatalf("final on-disk Tautulli API key lost: %q", final.TautulliConfig[0].TautulliApiKey)
	}

	// No stray temp files should be left behind in the config directory.
	entries, _ := os.ReadDir(dir)
	for _, e := range entries {
		if filepath.Ext(e.Name()) == ".tmp" || filepath.Base(e.Name()) != "config.json" {
			t.Errorf("unexpected leftover file in config dir: %s", e.Name())
		}
	}
}
