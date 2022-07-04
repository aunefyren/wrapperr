package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"syscall"

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

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		log.Println(err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
	return
}

func respond_default_error(writer http.ResponseWriter, request *http.Request, error_reply error, http_code int) {

	ip_string := GetOriginIPString(writer, request)

	log.Println("Returned error: '" + error_reply.Error() + "'" + ip_string)

	reply := Default_Reply{
		Message: error_reply.Error(),
		Error:   true,
	}

	respondWithJSON(writer, http_code, reply)
	return
}

func respond_default_okay(writer http.ResponseWriter, request *http.Request, reply_string string) {

	ip_string := GetOriginIPString(writer, request)

	log.Println("Returned reply: '" + reply_string + "'" + ip_string)

	reply := Default_Reply{
		Message: reply_string,
		Error:   false,
	}

	respondWithJSON(writer, http.StatusOK, reply)
	return
}

func hashAndSalt(pwd_string string) (string, error) {

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

func comparePasswords(hashedPwd string, pwd string) bool {
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

func GetOriginIPString(writer http.ResponseWriter, request *http.Request) string {
	ip := request.RemoteAddr
	xforward := request.Header.Get("X-Forwarded-For")
	real_ip := request.Header.Get("X-Real-Ip")

	string_reply := " - Origin: " + string(ip) + " "

	if xforward != "" {
		string_reply = string_reply + "(Forwarded for: " + string(xforward) + ") "
	}

	if real_ip != "" {
		string_reply = string_reply + "(Real IP: " + string(real_ip) + ") "
	}

	return string_reply
}

func BuildURL(port int, domain_ip string, https bool, url_base string) (string, error) {

	var url string = ""

	if https {
		url = url + "https://"
	} else {
		url = url + "http://"
	}

	domain_ip = strings.TrimPrefix(domain_ip, "http://")
	domain_ip = strings.TrimPrefix(domain_ip, "https://")

	url = url + domain_ip

	if !(https && port == 443) && !(!https && port == 80) {
		url = url + ":" + strconv.Itoa(port)
	}

	if url_base != "" {

		url_base = strings.TrimPrefix(url_base, "/")
		url_base = strings.TrimSuffix(url_base, "/")

		url = url + "/" + url_base + "/"

	} else {

		url = strings.TrimPrefix(url, "/")
		url = url + "/"

	}

	return url, nil
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
