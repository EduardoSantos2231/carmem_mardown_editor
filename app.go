package main

import (
	"context"

	"carmem/services"
)

type App struct {
	ctx       context.Context
	configSvc *services.ConfigService
	fileSvc   *services.FileService
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	a.configSvc = services.NewConfigService()
	if err := a.configSvc.Load(); err != nil {
		println("Error loading config:", err.Error())
	}

	a.fileSvc = services.NewFileService(a.configSvc.GetDocumentsPath())
}

func (a *App) GetConfig() map[string]string {
	return map[string]string{
		"theme":     a.configSvc.GetTheme(),
		"documents": a.configSvc.GetDocumentsPath(),
	}
}

func (a *App) SetTheme(theme string) error {
	return a.configSvc.SetTheme(theme)
}

func (a *App) GetFileTree() ([]services.FileNode, error) {
	return a.fileSvc.GetFileTree()
}

func (a *App) CreateFile(name, parentPath string) error {
	return a.fileSvc.CreateFile(name, parentPath)
}

func (a *App) CreateFolder(name, parentPath string) error {
	return a.fileSvc.CreateFolder(name, parentPath)
}

func (a *App) ReadFile(path string) (string, error) {
	return a.fileSvc.ReadFile(path)
}

func (a *App) WriteFile(path, content string) error {
	return a.fileSvc.WriteFile(path, content)
}

func (a *App) Delete(path string) error {
	return a.fileSvc.Delete(path)
}

func (a *App) Rename(oldPath, newName string) error {
	return a.fileSvc.Rename(oldPath, newName)
}

func (a *App) MoveFile(oldPath, newParentPath string) error {
	return a.fileSvc.MoveFile(oldPath, newParentPath)
}

func (a *App) FileExists(path string) bool {
	return a.fileSvc.FileExists(path)
}
