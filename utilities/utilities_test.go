package utilities

import "testing"

func TestBuildURLValid(t *testing.T) {
	tests := []struct {
		port     int
		host     string
		https    bool
		urlBase  string
		expected string
	}{
		{8181, "192.168.1.10", false, "", "http://192.168.1.10:8181/"},
		{8181, "http://192.168.1.10", false, "", "http://192.168.1.10:8181/"},
		{80, "tautulli.local", false, "", "http://tautulli.local/"},
		{443, "tautulli.local", true, "", "https://tautulli.local/"},
		{8181, "tautulli.local", true, "tautulli", "https://tautulli.local:8181/tautulli/"},
		{8181, "tautulli.local", true, "/tautulli/", "https://tautulli.local:8181/tautulli/"},
		{8181, "::1", false, "", "http://[::1]:8181/"},
	}

	for _, test := range tests {
		result, err := BuildURL(test.port, test.host, test.https, test.urlBase)
		if err != nil {
			t.Errorf("BuildURL(%d, %q, %t, %q) returned error: %v", test.port, test.host, test.https, test.urlBase, err)
			continue
		}
		if result != test.expected {
			t.Errorf("BuildURL(%d, %q, %t, %q) = %q, expected %q", test.port, test.host, test.https, test.urlBase, result, test.expected)
		}
	}
}

func TestBuildURLRejectsRequestForgery(t *testing.T) {
	// Each of these repointed the request at another host before the host was
	// validated, in some cases leaking the API key appended to the query string.
	hosts := []string{
		"",
		"evil.com?",
		"evil.com#",
		"evil.com/#",
		"user:password@evil.com",
		"tautulli.local/../../evil",
		"evil.com\\path",
		"evil .com",
	}

	for _, host := range hosts {
		result, err := BuildURL(8181, host, false, "")
		if err == nil {
			t.Errorf("BuildURL accepted invalid host %q, returned %q", host, result)
		}
	}
}

func TestBuildURLRejectsInvalidPort(t *testing.T) {
	for _, port := range []int{0, -1, 65536} {
		if _, err := BuildURL(port, "tautulli.local", false, ""); err == nil {
			t.Errorf("BuildURL accepted invalid port %d", port)
		}
	}
}
