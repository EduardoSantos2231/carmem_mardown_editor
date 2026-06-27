# Arquitetura do Carmem

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|------------|---------|
| Framework | Wails | v2.12.0 |
| Backend | Go | 1.24+ |
| Frontend | React + TypeScript | React 18, TS 5.7 |
| Build Tool | Vite | 6.x |
| Editor | CodeMirror | 6.x |
| Parser Markdown | marked | 15.x |
| Parser Markdown (editor) | @lezer/markdown (via CodeMirror) | — |
| Estilização | Tailwind CSS | 4.x |
| Estado | Zustand | 5.x |
| Ícones | lucide-react | 0.577.x |
| Matemática | KaTeX | 0.16.x |

## Estrutura de Arquivos

```
carmem/
├── main.go              # Entry point da aplicação
├── app.go               # Bindings Go → JavaScript
├── wails.json           # Configuração do Wails
├── go.mod               # Dependências Go
├── services/
│   ├── file.go          # Operações de arquivo (CRUD + path traversal protection)
│   └── config.go        # Gerenciamento de configuração
├── assets/icons/         # Ícones da aplicação (PNG + SVG + .desktop)
├── frontend/
│   ├── index.html       # HTML principal (Wails entry point)
│   ├── package.json     # Dependências npm
│   ├── tsconfig.json    # Configuração TypeScript
│   ├── vite.config.ts   # Configuração Vite + Tailwind
│   ├── src/
│   │   ├── main.tsx     # Inicialização React
│   │   ├── App.tsx      # Componente raiz + init
│   │   ├── index.css    # Tailwind directives + CSS custom properties
│   │   ├── store/
│   │   │   └── useAppStore.ts  # Estado global (Zustand)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Sidebar + FileTree + SidebarActions
│   │   │   ├── Toolbar.tsx        # Barra de ferramentas
│   │   │   ├── EditorContainer.tsx # Container editor (sem preview separado)
│   │   │   ├── CodeMirrorEditor.tsx # Editor CodeMirror
│   │   │   ├── MarkdownPreview.tsx  # Funções de compatibilidade (no-op)
│   │   │   ├── StatusBar.tsx      # Barra de status
│   │   │   ├── Resizer.tsx        # Redimensionador de painéis
│   │   │   └── ui/
│   │   │       └── Modal.tsx      # Modal reutilizável
│   │   ├── hooks/
│   │   │   ├── useAutosave.ts       # Lógica de autosave (debounce 2s)
│   │   │   ├── useKeyboardShortcuts.ts # Atalhos de teclado
│   │   │   ├── useZoom.ts          # Controle de zoom
│   │   │   └── usePanelResize.ts   # Redimensionamento de painéis
│   │   ├── lib/
│   │   │   ├── cm-theme.ts        # Temas CodeMirror (dark/light + live preview CSS)
│   │   │   ├── cm-live-preview.ts # ViewPlugin de live preview inline
│   │   │   └── marked.ts          # Configuração marked + KaTeX (legacy)
│   │   └── types/
│   │       └── index.ts      # Tipos compartilhados
│   └── wailsjs/               # Bindings auto-gerados Wails (não modificar)
└── .github/workflows/
    └── release.yml            # CI/CD para releases
```

## Decisões Técnicas Importantes

### 2. Autosave com Debounce

O sistema de autosave usa debounce de 2 segundos, gerenciado via hook `useAutosave.ts`:

```typescript
const AUTOSAVE_DELAY = 2000;

function debouncedSave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(performSave, AUTOSAVE_DELAY);
}

export function markUnsaved() {
    // ... atualiza estado via Zustand ...
    debouncedSave();  // Só dispara após 2s de inatividade
}
```

**Por quê?** Evita múltiplos salvamentos durante digitação contínua. O save só acontece quando o usuário para de digitar.

### 3. Estado Global com Zustand

O estado da aplicação é gerenciado em `store/useAppStore.ts` usando Zustand — substituindo o padrão singleton de `state.js`:

```typescript
export const useAppStore = create<AppState>((set) => ({
    editor: null,
    currentFilePath: null,
    theme: "dark",
    // ... ações ...
    setEditor: (editor) => set({ editor }),
    setTheme: (theme) => set({ theme }),
}));
```

Acesso via hook em componentes (`useAppStore(s => s.theme)`) ou via `useAppStore.getState()` em funções utilitárias.

### 4. Fluxo de Dados

```
Usuário digita
    ↓
CodeMirror dispara 'docChanged'
    ↓
markUnsaved() → atualiza UI + debounce 2s
    ↓
performSave() → go.WriteFile() → atualiza status
    ↓
(em paralelo)
livePreviewPlugin → re-decora syntax tree → renderiza inline
```

### 5. Segurança de Path Traversal

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

### 6. Guarda de Fechamento

O backend emite um evento `before-close` via Wails Runtime quando o usuário fecha a janela. O frontend intercepta `beforeunload` para alertar sobre alterações não salvas.

### 7. Live Preview Inline

O live preview é implementado via um **ViewPlugin** do CodeMirror (`cm-live-preview.ts`)
que percorre a syntax tree do parser `@lezer/markdown` e aplica decorações CSS:

- **`Decoration.line`** para elementos de bloco: headings (h1–h6), blockquote, blocos de código
- **`Decoration.mark`** para elementos inline: negrito, itálico, riscado, código inline, links

O plugin re-decora no evento `docChanged` ou `viewportChanged`, mantendo performance
via `visibleRanges` (só decora o que está visível na viewport).

O modo preview lockado (`Ctrl+P` / botão Eye) usa `EditorView.editable` facet para
alternar readonly e oculta `.cm-gutters` via classe CSS `.cm-preview-mode`.

## Limitações Conhecidas

### Ícone no Linux

O ícone aparece na janela via PNG embedado no binário (gerado pelo Wails). Para aparecer no lançador, é necessário instalar o arquivo `.desktop` fornecido em `assets/icons/carmem.desktop`.

### WebKit no Linux

O Wails usa WebKit2GTK. Dependências:

| Distro | Pacote |
|--------|--------|
| Ubuntu/Debian | `libwebkit2gtk-4.1-dev libgtk-3-dev build-essential pkg-config` |
| Fedora | `webkit2gtk4.1-devel gtk3-devel gcc-c++ pkgconf-pkg-config` |
| Arch | `webkit2gtk-4.1 gtk3 base-devel pkgconf` |

A partir de 2024, a API `webkit2gtk-4.0` (GTK3 + libsoup2) foi descontinuada. O projeto usa `webkit2gtk-4.1` (GTK3 + libsoup3) via build tag `-tags webkit2_41`.

## Glossário

| Termo | Significado |
|--------|-------------|
| Compartment | Recurso do CodeMirror para reconfigurar extensões dinamicamente |
| Debounce | Técnica para atrasar execução até após período de inatividade |
| Bindings | Funções Go disponíveis no JavaScript |
| WebView | Componente que renderiza HTML/JS no desktop |
| Zustand | Biblioteca de estado global para React (mínima, ~1KB) |
| Path Traversal | Ataque que tenta acessar arquivos fora do diretório permitido |
