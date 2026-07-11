package services

import (
	"os"
	"path/filepath"
	"strings"
)

type LinkService struct {
	rootPath string
	fileSvc  *FileService
}

func NewLinkService(rootPath string, fileSvc *FileService) *LinkService {
	return &LinkService{rootPath: rootPath, fileSvc: fileSvc}
}

func (s *LinkService) ResolveLink(linkName, currentPath string) string {
	name := strings.TrimSpace(linkName)
	if name == "" {
		return ""
	}

	if !strings.HasSuffix(name, ".md") {
		name += ".md"
	}

	if found := s.search(name, currentPath); found != "" {
		return found
	}
	return ""
}

// ponytail: busca em cascata — diretório atual, pais, árvore inteira
func (s *LinkService) search(target, currentPath string) string {
	if found := s.tryDir(target, filepath.Dir(currentPath)); found != "" {
		return found
	}

	dir := filepath.Dir(currentPath)
	for dir != s.rootPath && dir != "/" && dir != "." {
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
		if found := s.tryDir(target, dir); found != "" {
			return found
		}
	}

	return s.searchTree(target)
}

func (s *LinkService) tryDir(target, dir string) string {
	candidate := filepath.Join(dir, target)
	if _, err := os.Stat(candidate); err == nil {
		return filepath.ToSlash(candidate)
	}
	return ""
}

func (s *LinkService) searchTree(target string) string {
	tree, err := s.fileSvc.GetFileTree()
	if err != nil {
		return ""
	}
	return s.findInTree(tree, target)
}

func (s *LinkService) findInTree(nodes []FileNode, target string) string {
	for _, n := range nodes {
		if !n.IsDir && strings.EqualFold(n.Name, target) {
			return filepath.ToSlash(n.Path)
		}
		if n.IsDir && n.Children != nil {
			if found := s.findInTree(n.Children, target); found != "" {
				return found
			}
		}
	}
	return ""
}
