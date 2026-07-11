# Arquitetura do Carmem

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|------------|---------|
| Framework | Wails | v2.12.0 |
| Backend | Go | 1.24+ |
| Frontend | React + TypeScript | React 18, TS 5.7 |
| Build Tool | Vite | 6.x |
| Editor | CodeMirror | 6.x |
| Parser Markdown (editor) | @lezer/markdown (via CodeMirror) | — |
| Estilização | Tailwind CSS | 4.x |
| Estado | Zustand | 5.x |
| Ícones | Icon.tsx (SVGs inline próprios) | — |
| Fontes | @fontsource/bricolage-grotesque | — |

## Estrutura de Arquivos

```
carmem/
├── main.go              # Entry point da aplicação
├── app.go               # Bindings Go → JavaScript
├── wails.json           # Configuração do Wails
├── go.mod               # Dependências Go
├── services/
│   ├── config.go        # Gerenciamento de configuração
│   ├── file.go          # Operações de arquivo (CRUD + path traversal protection)
│   ├── update.go        # Update checker (GitHub Releases API + semver compare)
│   ├── link.go          # Resolução de wikilinks [[link]] (busca em cascata)
│   └── graph.go         # Dados do grafo (nós + arestas com cache)
├── assets/icons/         # Ícones da aplicação (PNG + SVG + .desktop)
├── frontend/
│   ├── index.html       # HTML principal (Wails entry point)
│   ├── package.json     # Dependências npm
│   ├── tsconfig.json    # Configuração TypeScript
│   ├── vite.config.ts   # Configuração Vite + Tailwind
│   ├── src/
│   │   ├── main.tsx     # Inicialização React
│   │   ├── App.tsx      # Componente raiz + init + toggle editor/grafo
│   │   ├── index.css    # CSS custom properties + neobrutalist tokens + font-face
│   │   ├── store/
│   │   │   └── useAppStore.ts  # Estado global (Zustand)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Sidebar + FileTree + SidebarActions
│   │   │   ├── Toolbar.tsx        # Barra de ferramentas (zoom, preview, tema, grafo)
│   │   │   ├── EditorContainer.tsx # Container editor (papel com placeholder)
│   │   │   ├── CodeMirrorEditor.tsx # Editor CodeMirror + plugins
│   │   │   ├── FloatingToolbar.tsx  # Toolbar flutuante de formatação
│   │   │   ├── GraphView.tsx       # Canvas/grafo de conexões (SVG + Canvas 2D)
│   │   │   ├── UpdateAlert.tsx     # Modal de update disponível
│   │   │   ├── StatusBar.tsx      # Barra de status (save indicator + path)
│   │   │   ├── Resizer.tsx        # Redimensionador de painéis
│   │   │   └── ui/
│   │   │       ├── Modal.tsx      # Modal reutilizável (prompt + confirm)
│   │   │       └── Icon.tsx       # 24 SVGs inline neobrutalistas
│   │   ├── hooks/
│   │   │   ├── useAutosave.ts       # Lógica de autosave (debounce 2s)
│   │   │   ├── useKeyboardShortcuts.ts # Atalhos de teclado
│   │   │   ├── useZoom.ts          # Controle de zoom (CSS zoom property)
│   │   │   └── usePanelResize.ts   # Redimensionamento de painéis
│   │   ├── lib/
│   │   │   ├── cm-theme.ts           # Temas CodeMirror neobrutalistas (dark/light)
│   │   │   ├── cm-live-preview.ts    # ViewPlugin de live preview inline
│   │   │   ├── live-preview.css      # CSS do live preview
│   │   │   ├── cm-wikilinks.ts       # ViewPlugin de wikilinks [[link]]
│   │   │   ├── wikilink.css          # CSS dos wikilinks
│   │   │   ├── cm-markdown-math.ts   # MarkdownConfig para $...$ (InlineMath)
│   │   │   └── floating-toolbar-plugin.ts  # ViewPlugin da toolbar flutuante
│   │   └── types/
│   │       └── index.ts      # Tipos compartilhados
│   └── wailsjs/               # Bindings auto-gerados Wails (não modificar)
└── .github/workflows/
    └── release.yml            # CI/CD para releases
```

## Decisões Técnicas Importantes

### 1. Zoom via CSS `zoom`

O zoom usa `document.body.style.zoom` em vez de alterar `fontSize`:

```typescript
export function zoomIn() {
  const newZoom = Math.min(2, store.zoomLevel + 0.05);
  document.body.style.zoom = String(newZoom);
}
```

**Por quê?** A propriedade `zoom` escala visualmente sem alterar o layout real.
CodeMirror não precisa recalcular gutter, sem salto nos números de linha.
Funciona de 50% a 200%. Suportado em WebKitGTK (Linux) e WebView2 (Windows).

### 2. Tema via CodeMirror Compartment

A troca de tema usa `Compartment.reconfigure()` em vez de destruir/recriar o editor:

```typescript
const themeCompartment = new Compartment();

// Na criação do editor:
themeCompartment.of(getTheme(theme))

// Na troca de tema:
cmView.dispatch({ effects: themeCompartment.reconfigure(getTheme(theme)) })
```

**Por quê?** Troca atômica de tema sem perder cursor, undo history ou causar flicker.
Elimina race conditions com `document.body.className`.

### 3. Autosave com Debounce

O sistema de autosave usa debounce de 2 segundos, gerenciado via hook `useAutosave.ts`:

```typescript
const AUTOSAVE_DELAY = 2000;

function debouncedSave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(performSave, AUTOSAVE_DELAY);
}
```

**Por quê?** Evita múltiplos salvamentos durante digitação contínua.

### 4. Estado Global com Zustand

Estado gerenciado em `store/useAppStore.ts` com Zustand:

```typescript
export const useAppStore = create<AppState>((set) => ({
    editor: null,
    currentFilePath: null,
    theme: "dark",
    showGraph: false,
    // ... ações ...
    setTheme: (theme) => set({ theme }),
    setShowGraph: (show) => set({ showGraph: show }),
}));
```

### 5. Fluxo de Dados

```
Usuário digita
    ↓
CodeMirror dispara 'docChanged'
    ↓
markUnsaved() → atualiza UI + debounce 2s
    ↓
performSave() → go.WriteFile() → atualiza status + invalida cache do grafo
    ↓
(em paralelo)
livePreviewPlugin → re-decora syntax tree → renderiza inline
wikiLinkPlugin → detecta [[...]] → decora como link clicável
```

### 6. Segurança de Path Traversal

Todas as operações de arquivo passam por `safePath()` que valida que o caminho está dentro de `rootPath`:

```go
func (s *FileService) safePath(path string) (string, error) {
    clean := filepath.Clean(path)
    if !strings.HasPrefix(clean, s.rootPath) {
        return "", errors.New("path traversal not allowed")
    }
    return clean, nil
}
```

### 7. Guarda de Fechamento

O backend emite `before-close` via Wails Runtime. O frontend intercepta `beforeunload` para alertar sobre alterações não salvas.

### 8. Live Preview Inline

Implementado via **ViewPlugin** do CodeMirror (`cm-live-preview.ts`) que percorre a syntax tree do `@lezer/markdown`:

- **`Decoration.line`** para elementos de bloco: headings, blockquote, code blocks, horizontal rules
- **`Decoration.mark`** para elementos inline: negrito, itálico, riscado, código inline, links, wikilinks
- **`Decoration.replace({})`** para esconder caracteres de formatação (`#`, `**`, `~~`, etc.)
- **`CodeInfo` handler**: texto de linguagem (`ts`, `js`, `python`) renderizado esmaecido

O plugin re-decora via `docChanged` ou `viewportChanged`, com `visibleRanges` para performance.

### 9. Wikilinks

ViewPlugin dedicado (`cm-wikilinks.ts`) com regex `\[\[([^\]]+)\]\]`:

- Decora matches como links clicáveis (accent, sublinhado pontilhado)
- Click handler: `go.ResolveLink(linkName, currentPath)` → busca em cascata
- Se não encontrado: modal de confirmação para criar o arquivo
- Backend: `services/link.go` — busca no dir atual → pais → árvore inteira

### 10. Canvas / Grafo

Componente `GraphView.tsx` renderizado no lugar do editor quando `showGraph = true`:

- **Força simulada**: Repulsão Coulomb + atração mola, damping 0.82, ~350 iterações
- **Spatial grid**: O(n×k) em vez de O(n²) — células de 120px, vizinhança 3×3
- **Renderização**: SVG para ≤800 nós, Canvas 2D para >800
- **Interação**: Pan (arrastar), zoom (scroll), clique no nó abre arquivo
- **Cache de grafo**: `services/graph.go` — varre `.md`, extrai `[[...]]`, invalida em writes
- **Estados vazios**: 0 arquivos (mensagem + botão), arquivos sem links (mensagem)

### 11. Update Checker

`services/update.go` — `GET api.github.com/repos/.../releases/latest`:

- `semver.Compare()` implementado na mão (sem dependência externa)
- `version == "dev"` → skip (ambiente de desenvolvimento)
- Resultado exibido via `UpdateAlert.tsx` (modal com changelog + link)
- Version embedding via `-ldflags "-X main.version=vX.X.X"`

### 12. CSS Token System

Temas dark e light definidos via CSS custom properties em `:root/.dark` e `.light`:

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--color-bg` | `#1a1a1a` | `#f0e8d8` | Fundo da mesa |
| `--color-paper` | `#2a2a2a` | `#fafaf5` | Fundo do editor |
| `--color-ink` | `#e8dcc8` | `#1a1a1a` | Texto principal |
| `--color-accent` | `#0055ff` | `#0055ff` | Cor de destaque |
| `--color-border` | `#000000` | `#1a1a1a` | Cor da borda |
| `--border-width` | `3px` | `3px` | Espessura da borda |
| `--shadow` | `4px 4px 0 #000` | `4px 4px 0 #1a1a1a` | Sombra dura |

### 13. Matemática `$...$` e `$$...$$`

**Inline (`$...$`):** `MarkdownConfig.parseInline` registra nó `InlineMath` na syntax tree do `@lezer/markdown`. O `cm-live-preview.ts` detecta via `tree.iterate()` e aplica `Decoration.mark({ class: "cm-live-math" })`. Funciona porque `parseInline` opera em uma linha — não precisa de APIs de lookahead (`lineAt`/`lineCount`) que não existem na API pública.

**Bloco (`$$...$$`):** `MarkdownConfig.parseBlock` foi tentado e **falhou** porque `BlockContext` não expõe `lineAt`/`lineCount` (nem em runtime, nem nos tipos). Solução adotada: regex `^\$\$` (âncora de linha) sobre o documento inteiro (`view.state.doc.toString()`), executado 1x por rebuild no `cm-live-preview.ts`. Busca abertura `$$` sozinho na linha → fecha no próximo `$$` na linha → decora linhas intermediárias como `.cm-live-math-line`.

Ambos os estilos usam `font-family: var(--font-mono)`, `color: var(--color-accent)`. Blocos adicionam `background: var(--color-accent-bg)` por linha.

## Limitações Conhecidas

### Ícone no Linux

O ícone aparece na janela via PNG embedado no binário (gerado pelo Wails). Para aparecer no lançador, é necessário instalar o arquivo `.desktop` e copiar `icon.png` para `~/.local/share/icons/hicolor/256x256/apps/carmem.png`.

### WebKit no Linux

| Distro | Pacote |
|--------|--------|
| Ubuntu/Debian | `libwebkit2gtk-4.1-dev libgtk-3-dev build-essential pkg-config` |
| Fedora | `webkit2gtk4.1-devel gtk3-devel gcc-c++ pkgconf-pkg-config` |
| Arch | `webkit2gtk-4.1 gtk3 base-devel pkgconf` |

Build tag: `-tags webkit2_41` (GTK3 + libsoup3, API atual).

## Glossário

| Termo | Significado |
|--------|-------------|
| Compartment | Recurso do CodeMirror para reconfigurar extensões dinamicamente |
| Debounce | Técnica para atrasar execução até após período de inatividade |
| Bindings | Funções Go disponíveis no JavaScript |
| WebView | Componente que renderiza HTML/JS no desktop |
| Zustand | Biblioteca de estado global para React (mínima, ~1KB) |
| Path Traversal | Ataque que tenta acessar arquivos fora do diretório permitido |
| Wikilink | Sintaxe `[[link]]` para conectar notas entre si |
| Spatial Grid | Estrutura de dados que particiona o espaço 2D para busca O(n×k) |
| Neobrutalismo | Estilo visual com bordas grossas, sombras duras, cores sólidas, sem gradientes |
