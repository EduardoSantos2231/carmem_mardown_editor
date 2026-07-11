package services

import (
	"os"
	"path/filepath"
	"regexp"
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

	if found := s.searchTreeFuzzy(name); found != "" {
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

// ponytail: fuzzy fallback — busca por substring no nome base (ex: "nota" casa com "nota-antiga.md")
func (s *LinkService) searchTreeFuzzy(target string) string {
	base := strings.TrimSuffix(target, ".md")
	tree, err := s.fileSvc.GetFileTree()
	if err != nil {
		return ""
	}
	return s.findInTreeFuzzy(tree, base)
}

func (s *LinkService) findInTreeFuzzy(nodes []FileNode, base string) string {
	for _, n := range nodes {
		if !n.IsDir && strings.HasSuffix(n.Name, ".md") {
			nb := strings.TrimSuffix(n.Name, ".md")
			if strings.Contains(strings.ToLower(nb), strings.ToLower(base)) {
				return filepath.ToSlash(n.Path)
			}
		}
		if n.IsDir && n.Children != nil {
			if found := s.findInTreeFuzzy(n.Children, base); found != "" {
				return found
			}
		}
	}
	return ""
}

func (s *LinkService) UpdateReferences(oldName, newName string) {
	oldBase := strings.TrimSuffix(oldName, ".md")
	newBase := strings.TrimSuffix(newName, ".md")
	if oldBase == newBase {
		return
	}

	reLink := regexp.MustCompile(`\[\[` + regexp.QuoteMeta(oldBase) + `(\]\]|\|)`)
	replacement := `[[` + newBase + `$1`

	s.updateTreeReferences(reLink, replacement)
}

func (s *LinkService) updateTreeReferences(re *regexp.Regexp, replacement string) {
	tree, err := s.fileSvc.GetFileTree()
	if err != nil {
		return
	}
	s.walkAndReplace(tree, re, replacement)
}

func (s *LinkService) walkAndReplace(nodes []FileNode, re *regexp.Regexp, replacement string) {
	for _, n := range nodes {
		if n.IsDir && n.Children != nil {
			s.walkAndReplace(n.Children, re, replacement)
		} else if strings.HasSuffix(n.Name, ".md") {
			data, err := os.ReadFile(n.Path)
			if err != nil {
				continue
			}
			updated := re.ReplaceAllString(string(data), replacement)
			if updated != string(data) {
				os.WriteFile(n.Path, []byte(updated), 0644)
			}
		}
	}
}
