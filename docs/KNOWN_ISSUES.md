# Known Issues & Resolutions

Registro de bugs, tentativas e soluções. Útil entre sessões de desenvolvimento.

---

## Resolvidos (branch `fix/7-problemas`)

### 1. Grafo não mostra notas sem links

- **Status:** ✅ resolvido
- **Commit:** `14649d8`
- **Causa:** `if (graphData.edges.length === 0 && graphData.nodes.length > 0)` bloqueava renderização quando havia nós mas zero arestas
- **Solução:** removido o check. Nós sem links renderizam como círculos cinza isolados

### 2. Listas sem marcadores (bullet/número)

- **Status:** ✅ resolvido
- **Commit:** (pendente)
- **Causa:** `"ListMark"` estava em `hideMarkTypes` — `Decoration.replace({})` escondia `-`, `*`, `1.` etc. ao sair da linha
- **Solução:** removido `"ListMark"` do Set. Marcadores sempre visíveis, servindo como bullets/números naturais

### 3. Links quebram ao renomear arquivo

- **Status:** ✅ resolvido
- **Commit:** `50b617a`
- **Solução:** `UpdateReferences()` no `services/link.go` — varre todos `.md` com regex e substitui `[[oldBase]]` → `[[newBase]]`. Preserva aliases (`[[old|alias]]` → `[[new|alias]]`)
- **Fallback:** `searchTreeFuzzy()` — busca por substring do nome base caso algum arquivo não tenha sido atualizado

### 4. Blocos de matemática `$$...$$` sem formatação

- **Status:** ✅ resolvido
- **Commit:** `50b617a`

#### Tentativas que FALHARAM

1. **`MarkdownConfig.parseBlock` com `ctx.lineAt()`/`ctx.lineCount` via `as any`** — **FALHOU**. O `BlockContext` do `@lezer/markdown` não expõe `lineAt` nem `lineCount` na API pública — nem nos types, **nem em runtime** (`undefined`). O loop `while (fenceEnd < ctx.lineCount)` nunca executava, o parser nunca criava o nó `MathBlock`, o live preview nunca via o nó na tree.

2. **Regex `/\$\$([^$]+)\$\$/g` sobre `view.visibleRanges`** — **FALHOU**. Blocos multi-linha cruzam fronteiras de viewport. O texto fatiado de cada `visibleRange` não contém o bloco completo, o regex não casa.

#### Solução que FUNCIONOU

- **Inline `$...$`:** `MarkdownConfig.parseInline` (funciona, opera em 1 linha, sem precisar de `lineAt`/`lineCount`). Registra nó `InlineMath` na syntax tree. Handler no `tree.iterate()` aplica `Decoration.mark({ class: "cm-live-math" })`.
- **Bloco `$$...$$`:** Regex `^\$\$` (âncora de linha) sobre o **documento inteiro** (`view.state.doc.toString()`). Algoritmo: busca `$$` sozinho na linha → procura próximo `$$` na linha → decora todas as linhas entre eles como `.cm-live-math-line`. Executa 1x por rebuild, complexidade O(n) em linhas do documento, sem dependência de viewport.

### 5. Matemática inline `$...$` sem formatação

- **Status:** ✅ resolvido (ver #4 — InlineMath via MarkdownConfig)

### 6. Tabelas sem divisão vertical de colunas

- **Status:** ✅ resolvido
- **Commit:** `50b617a`
- **Solução:** `.cm-live-table-cell { border-right: 1px solid var(--color-border); font-family: var(--font-mono); }`

### 7. Contraste do item selecionado no light mode

- **Status:** ✅ resolvido
- **Commit:** `14649d8`
- **Solução:** `--color-selected` opacity `0.1` → `0.18` no light mode, `0.15` → `0.2` no dark mode

### 8. Modal de criação sem indicação do diretório pai

- **Status:** ✅ resolvido
- **Commit:** `14649d8`
- **Solução:** `showModal` ganhou parâmetro `hint?: string`. Sidebar computa path relativo à raiz de documentos e exibe acima do input

---

## Resolvidos (branches anteriores)

### 9. Zoom quebra numeração de linhas (v1.2.0 → v1.3.0)

- **Status:** ✅ resolvido
- **Branch:** `fix/zoom-gutter-relayout`

#### Tentativas que FALHARAM

1. `cmView.requestMeasure()` síncrono — **FALHOU**. CodeMirror mede antes do browser recalcular layout após mudança de `fontSize`.
2. Duplo `requestAnimationFrame` + `requestMeasure()` — **FALHOU**. Com layout recalculado, o gutter não re-mede completamente. Cache interno de métricas do CodeMirror só invalida no focus/blur, não no `requestMeasure()`.

#### Solução que FUNCIONOU

`document.body.style.zoom = String(zoomLevel)` em vez de `body.style.fontSize`. A propriedade CSS `zoom` escala visualmente sem alterar as métricas de layout. CodeMirror não precisa recalcular nada. Suportado em WebKitGTK (Linux) e WebView2 (Windows).

### 10. Tema toggle falhava (v1.2.0 → v1.3.0)

- **Status:** ✅ resolvido
- **Branch:** `fix/zoom-gutter-relayout`

#### Tentativa que FUNCIONAVA mas era frágil

`cmView.destroy()` + `createEditor()` — funcionava mas perdia cursor e undo history a cada toggle.

#### Solução que FUNCIONOU

`Compartment.reconfigure()` — troca atômica de extensão de tema via `cmView.dispatch({ effects: compartment.reconfigure(getTheme(theme)) })`. Sem destroy, sem perder estado.

### 11. Autocomplete de código em editor Markdown (v1.2.0)

- **Status:** ✅ resolvido
- **Solução:** `autocompletion({ override: [() => null] })` — desativa todas as fontes de autocomplete do `basicSetup`

---

## Pendentes

### 12. Grafo não atualiza após operações de arquivo

- **Status:** ⚠️ implementado mas não testado
- **Abordagem:** `graphVersion` no store Zustand, incrementado nos métodos de escrita. `GraphView.tsx` useEffect depende de `graphVersion` — refetch quando incrementa.

---

## Não planejados / Roadmap

| Item | Complexidade |
|------|-------------|
| Personalização de cores accent via config | Baixa |
| Live preview de tabelas GFM com largura uniforme de colunas | Média |
| Suporte a imagens em Markdown | Média |
| Múltiplos arquivos abertos (tabs) | Alta |
| Sincronização em nuvem | Alta |
| Sistema de plugins | Alta |
