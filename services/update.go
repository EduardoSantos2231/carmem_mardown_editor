package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type UpdateInfo struct {
	HasUpdate   bool   `json:"hasUpdate"`
	Latest      string `json:"latest"`
	Current     string `json:"current"`
	DownloadURL string `json:"downloadUrl"`
	Changelog   string `json:"changelog"`
}

type githubRelease struct {
	TagName string `json:"tag_name"`
	HTMLURL string `json:"html_url"`
	Body    string `json:"body"`
}

type UpdateService struct {
	currentVersion string
	repoOwner      string
	repoName       string
}

func NewUpdateService(version string) *UpdateService {
	return &UpdateService{
		currentVersion: version,
		repoOwner:      "EduardoSantos2231",
		repoName:       "carmem_mardown_editor",
	}
}

func (s *UpdateService) Check() UpdateInfo {
	result := UpdateInfo{Current: s.currentVersion}
	if s.currentVersion == "dev" {
		return result
	}

	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", s.repoOwner, s.repoName)
	client := &http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "carmem")

	resp, err := client.Do(req)
	if err != nil {
		return result
	}
	defer resp.Body.Close()

	var release githubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return result
	}

	latest := strings.TrimPrefix(release.TagName, "v")
	if compareSemver(latest, s.currentVersion) > 0 {
		result.HasUpdate = true
		result.Latest = latest
		result.DownloadURL = release.HTMLURL
		result.Changelog = release.Body
	}

	return result
}

// ponytail: semver compare na mão, importar lib se surgirem edge cases com pre-release
func compareSemver(a, b string) int {
	partsA := strings.Split(a, ".")
	partsB := strings.Split(b, ".")
	for i := 0; i < len(partsA) && i < len(partsB); i++ {
		na, _ := strconv.Atoi(partsA[i])
		nb, _ := strconv.Atoi(partsB[i])
		if na > nb {
			return 1
		}
		if na < nb {
			return -1
		}
	}
	if len(partsA) > len(partsB) {
		return 1
	}
	if len(partsA) < len(partsB) {
		return -1
	}
	return 0
}
