package services

import (
	"os"
	"path/filepath"
)

type FileNode struct {
	Name     string     `json:"name"`
	Path     string     `json:"path"`
	IsDir    bool       `json:"isDir"`
	Children []FileNode `json:"children,omitempty"`
}

type FileService struct {
	rootPath string
}

func NewFileService(rootPath string) *FileService {
	return &FileService{
		rootPath: rootPath,
	}
}

func (s *FileService) GetFileTree() ([]FileNode, error) {
	return s.readDir(s.rootPath)
}

func (s *FileService) readDir(path string) ([]FileNode, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var nodes []FileNode
	for _, entry := range entries {
		name := entry.Name()
		if name == "." || name == ".." {
			continue
		}

		fullPath := filepath.Join(path, name)
		isDir := entry.IsDir()

		node := FileNode{
			Name:  name,
			Path:  fullPath,
			IsDir: isDir,
		}

		if isDir {
			children, err := s.readDir(fullPath)
			if err != nil {
				return nil, err
			}
			node.Children = children
		}

		nodes = append(nodes, node)
	}

	return nodes, nil
}

func (s *FileService) CreateFile(name, parentPath string) error {
	if parentPath == "" {
		parentPath = s.rootPath
	}

	filePath := filepath.Join(parentPath, name)
	_, err := os.Create(filePath)
	return err
}

func (s *FileService) CreateFolder(name, parentPath string) error {
	if parentPath == "" {
		parentPath = s.rootPath
	}

	folderPath := filepath.Join(parentPath, name)
	return os.MkdirAll(folderPath, 0755)
}

func (s *FileService) ReadFile(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (s *FileService) WriteFile(path, content string) error {
	return os.WriteFile(path, []byte(content), 0644)
}

func (s *FileService) Delete(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		return err
	}

	if info.IsDir() {
		return os.RemoveAll(path)
	}
	return os.Remove(path)
}

func (s *FileService) Rename(oldPath, newName string) error {
	dir := filepath.Dir(oldPath)
	newPath := filepath.Join(dir, newName)
	return os.Rename(oldPath, newPath)
}

func (s *FileService) MoveFile(oldPath, newParentPath string) error {
	fileName := filepath.Base(oldPath)
	newPath := filepath.Join(newParentPath, fileName)
	return os.Rename(oldPath, newPath)
}

func (s *FileService) FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
