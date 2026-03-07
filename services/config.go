package services

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Config struct {
	Theme     string `json:"theme"`
	Documents string `json:"documents"`
}

type ConfigService struct {
	configPath string
	config     Config
}

func NewConfigService() *ConfigService {
	homeDir, _ := os.UserHomeDir()
	appDir := filepath.Join(homeDir, ".carmem")

	return &ConfigService{
		configPath: filepath.Join(appDir, "config.json"),
		config: Config{
			Theme:     "dark",
			Documents: filepath.Join(appDir, "documents"),
		},
	}
}

func (s *ConfigService) Load() error {
	homeDir, _ := os.UserHomeDir()
	appDir := filepath.Join(homeDir, ".carmem")

	if err := os.MkdirAll(appDir, 0755); err != nil {
		return err
	}

	if err := os.MkdirAll(s.config.Documents, 0755); err != nil {
		return err
	}

	if _, err := os.Stat(s.configPath); os.IsNotExist(err) {
		return s.Save()
	}

	data, err := os.ReadFile(s.configPath)
	if err != nil {
		return err
	}

	return json.Unmarshal(data, &s.config)
}

func (s *ConfigService) Save() error {
	data, err := json.MarshalIndent(s.config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.configPath, data, 0644)
}

func (s *ConfigService) GetTheme() string {
	return s.config.Theme
}

func (s *ConfigService) SetTheme(theme string) error {
	s.config.Theme = theme
	return s.Save()
}

func (s *ConfigService) GetDocumentsPath() string {
	return s.config.Documents
}
