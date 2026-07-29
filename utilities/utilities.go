package utilities

import (
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"math/big"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"syscall"

	"github.com/aunefyren/wrapperr/models"

	"github.com/gin-gonic/gin"
	"github.com/kardianos/osext"
	"golang.org/x/crypto/bcrypt"
)

func decodeBase64BigInt(s string) *big.Int {
	buffer, err := base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(s)
	if err != nil {
		log.Fatalf("failed to decode base64: %v", err)
	}

	return big.NewInt(0).SetBytes(buffer)
}

func checkScopes(requiredScopes []string, providedScopes string) bool {

	for _, value := range requiredScopes {
		if !strings.Contains(providedScopes, value) {
			return false
		}
	}

	return true
}

func HashAndSalt(pwd_string string) (string, error) {

	pwd := []byte(pwd_string)

	// Use GenerateFromPassword to hash & salt pwd.
	// MinCost is just an integer constant provided by the bcrypt
	// package along with DefaultCost & MaxCost.
	// The cost can be any value you want provided it isn't lower
	// than the MinCost (4)
	hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)
	if err != nil {
		return "", err
	}
	// GenerateFromPassword returns a byte slice so we need to
	// convert the bytes to a string and return it
	return string(hash), nil
}

func ComparePasswords(hashedPwd string, pwd string) bool {
	// Since we'll be getting the hashed password from the DB it
	// will be a string so we'll need to convert it to a byte slice
	plainPwd := []byte(pwd)

	byteHash := []byte(hashedPwd)
	err := bcrypt.CompareHashAndPassword(byteHash, plainPwd)
	if err != nil {
		return false
	}

	return true
}

func RestartSelf() error {
	self, err := osext.Executable()
	if err != nil {
		return err
	}
	args := os.Args
	env := os.Environ()
	// Windows does not support exec syscall.
	if runtime.GOOS == "windows" {
		cmd := exec.Command(self, args[1:]...)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Stdin = os.Stdin
		cmd.Env = env
		err := cmd.Run()
		if err == nil {
			os.Exit(0)
		}
		return err
	}
	return syscall.Exec(self, args, env)
}

func GetOriginIPString(context *gin.Context) (stringReply string) {
	ip := context.ClientIP()
	stringReply = " - Origin: " + string(ip) + " "
	return
}

func BuildURL(port int, domain_ip string, https bool, url_base string) (string, error) {

	host := strings.TrimSpace(domain_ip)
	host = strings.TrimPrefix(host, "http://")
	host = strings.TrimPrefix(host, "https://")
	host = strings.Trim(host, "/")

	// The host must be a bare host name or IP literal. Without this check a value
	// such as "example.com?" or "example.com#" re-points the request at another
	// server, and any credential appended to the query string later would be sent
	// along to it.
	if host == "" || strings.ContainsAny(host, "/?#@\\ \t") {
		return "", errors.New("Invalid host.")
	}

	if port < 1 || port > 65535 {
		return "", errors.New("Invalid port.")
	}

	scheme := "http"
	if https {
		scheme = "https"
	}

	// net.JoinHostPort brackets IPv6 literals for us.
	urlObject := url.URL{
		Scheme: scheme,
		Host:   net.JoinHostPort(host, strconv.Itoa(port)),
	}

	// Omit the port when it is the default one for the scheme
	if (https && port == 443) || (!https && port == 80) {
		urlObject.Host = host
	}

	if url_base != "" {
		urlObject = *urlObject.JoinPath(strings.Trim(url_base, "/"))
	}

	urlString := urlObject.String() + "/"

	// Re-parse as a final guard against anything that is still malformed
	parsedURL, err := url.Parse(urlString)
	if err != nil || parsedURL.Hostname() == "" || parsedURL.User != nil ||
		parsedURL.RawQuery != "" || parsedURL.Fragment != "" {
		return "", errors.New("Invalid URL.")
	}

	return urlString, nil
}

func PrintASCII() {
	fmt.Println(``)
	fmt.Println(` ___       __    ________   ________   ________   ________   _______    ________   ________     `)
	fmt.Println(`|\  \     |\  \ |\   __  \ |\   __  \ |\   __  \ |\   __  \ |\  ___ \  |\   __  \ |\   __  \    `)
	fmt.Println(`\ \  \    \ \  \\ \  \|\  \\ \  \|\  \\ \  \|\  \\ \  \|\  \\ \   __/| \ \  \|\  \\ \  \|\  \   `)
	fmt.Println(` \ \  \  __\ \  \\ \   _  _\\ \   __  \\ \   ____\\ \   ____\\ \  \_|/__\ \   _  _\\ \   _  _\  `)
	fmt.Println(`  \ \  \|\__\_\  \\ \  \\  \|\ \  \ \  \\ \  \___| \ \  \___| \ \  \_|\ \\ \  \\  \|\ \  \\  \| `)
	fmt.Println(`   \ \____________\\ \__\\ _\ \ \__\ \__\\ \__\     \ \__\     \ \_______\\ \__\\ _\ \ \__\\ _\ `)
	fmt.Println(`    \|____________| \|__|\|__| \|__|\|__| \|__|      \|__|      \|_______| \|__|\|__| \|__|\|__|`)
	fmt.Println(` ____________   ____________   ____________   ____________   ____________   ____________   ____________  `)
	fmt.Println(`|\____________\|\____________\|\____________\|\____________\|\____________\|\____________\|\____________\`)
	fmt.Println(`\|____________|\|____________|\|____________|\|____________|\|____________|\|____________|\|____________|`)
	fmt.Println(``)
}

func ValidateBasicAuth(context *gin.Context, adminConfig models.AdminConfig) (err error) {
	err = nil

	username, password, okay := context.Request.BasicAuth()
	if !okay {
		context.Writer.Header().Add("WWW-Authenticate", `Basic realm="Give username and password"`)
		context.JSON(http.StatusUnauthorized, gin.H{"error": "No basic auth present."})
		context.Abort()
		return
	}

	// Hash new password
	passwordValidity := ComparePasswords(adminConfig.AdminPassword, password)

	// Validate admin username and password
	if !passwordValidity || adminConfig.AdminUsername != username {
		return errors.New("Invalid username or password.")
	}

	return
}
