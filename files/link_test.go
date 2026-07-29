package files

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestBuildLinkPathValid(t *testing.T) {
	// The only file names ever written are a user ID or a UUID.
	names := []string{
		"0",
		"12345",
		"1b4e28ba-2fa1-11d2-883f-0016d3cca427",
	}

	for _, name := range names {
		result, err := buildLinkPath(name)
		if err != nil {
			t.Errorf("buildLinkPath(%q) returned error: %v", name, err)
			continue
		}

		expected := filepath.Join(link_path, name+".json")
		if result != expected {
			t.Errorf("buildLinkPath(%q) = %q, expected %q", name, result, expected)
		}
	}
}

func TestBuildLinkPathRejectsTraversal(t *testing.T) {
	// Each of these escaped ./config/links when the path was built by string
	// concatenation, because filepath.Abs resolves "../" instead of rejecting it.
	names := []string{
		"",
		"..",
		"../admin",
		"../../etc/passwd",
		"..\\admin",
		"/etc/passwd",
		"12345/../../admin",
		"foo/bar",
		".../...//admin",
	}

	for _, name := range names {
		result, err := buildLinkPath(name)
		if err == nil {
			t.Errorf("buildLinkPath(%q) = %q, expected an error", name, result)
		}
	}
}

func TestBuildLinkPathStaysInLinkDir(t *testing.T) {
	// A prefix check without a trailing separator would accept a sibling
	// directory such as "./config/linksevil".
	names := []string{"12345", "1b4e28ba-2fa1-11d2-883f-0016d3cca427"}

	for _, name := range names {
		result, err := buildLinkPath(name)
		if err != nil {
			t.Errorf("buildLinkPath(%q) returned error: %v", name, err)
			continue
		}

		if !strings.HasPrefix(result, link_path+string(os.PathSeparator)) {
			t.Errorf("buildLinkPath(%q) = %q, which is outside %q", name, result, link_path)
		}
	}
}
