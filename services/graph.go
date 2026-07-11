package services

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type GraphNode struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Path      string `json:"path"`
	LinkCount int    `json:"linkCount"`
}

type GraphEdge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

type GraphData struct {
	Nodes []GraphNode `json:"nodes"`
	Edges []GraphEdge `json:"edges"`
}

type GraphService struct {
	fileSvc *FileService
	linkSvc *LinkService
	cache   *GraphData
	dirty   bool
}

var wikiRegex = regexp.MustCompile(`\[\[([^\]]+)\]\]`)

func NewGraphService(fileSvc *FileService, linkSvc *LinkService) *GraphService {
	return &GraphService{fileSvc: fileSvc, linkSvc: linkSvc, dirty: true}
}

func (s *GraphService) Invalidate() {
	s.dirty = true
}

func (s *GraphService) GetGraphData() GraphData {
	if !s.dirty && s.cache != nil {
		return *s.cache
	}

	tree, err := s.fileSvc.GetFileTree()
	if err != nil {
		return GraphData{}
	}

	nodes := []GraphNode{}
	edgesMap := map[string]bool{}
	edgeList := []GraphEdge{}

	s.collectNodes(tree, &nodes)

	for i := range nodes {
		data, err := os.ReadFile(nodes[i].Path)
		if err != nil {
			continue
		}
		matches := wikiRegex.FindAllStringSubmatch(string(data), -1)
		linkCount := 0
		for _, m := range matches {
			target := s.linkSvc.ResolveLink(m[1], nodes[i].Path)
			if target == "" || target == nodes[i].Path {
				continue
			}
			key := edgeKey(nodes[i].Path, target)
			if !edgesMap[key] {
				edgesMap[key] = true
				edgeList = append(edgeList, GraphEdge{Source: nodes[i].Path, Target: target})
			}
			linkCount++
		}
		nodes[i].LinkCount = linkCount
	}

	s.cache = &GraphData{Nodes: nodes, Edges: edgeList}
	s.dirty = false
	return *s.cache
}

func (s *GraphService) collectNodes(nodes []FileNode, out *[]GraphNode) {
	for _, n := range nodes {
		if n.IsDir && n.Children != nil {
			s.collectNodes(n.Children, out)
		} else if !n.IsDir && strings.HasSuffix(n.Name, ".md") {
			*out = append(*out, GraphNode{
				ID:   filepath.ToSlash(n.Path),
				Name: strings.TrimSuffix(n.Name, ".md"),
				Path: filepath.ToSlash(n.Path),
			})
		}
	}
}

func edgeKey(a, b string) string {
	if a < b {
		return a + "|||" + b
	}
	return b + "|||" + a
}
