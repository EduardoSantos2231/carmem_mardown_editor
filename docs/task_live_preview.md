# Task: Live Preview Inline

## Objetivo

Unificar editor e preview numa única sessão. Ao digitar uma linha markdown e sair dela, ela renderiza inline com tipografia visual (headings grandes, bold, itálico, code, blockquote), igual ao preview HTML antigo.

Preview toggle (`Ctrl+P` / botão Eye) trava edição (readonly) e esconde números de linha.

## Implementado

### Arquitetura
- `cm-live-preview.ts`: ViewPlugin que anda na syntax tree do `@lezer/markdown` e cria `Decoration.mark` para cada nó (headings, strong, emphasis, strikethrough, inline-code, link, blockquote, code-block, hr)
- CSS injetado no `document.head` com `!important` (não via `EditorView.theme()` — este não alcança elementos de decoração)
- Painel HTML de preview removido (`MarkdownPreview`, resizer, estilos `#preview`)
- `EditorContainer.tsx` simplificado: só editor

### Diagnóstico validado
- `Decoration.mark` + CSS no `<head>` → funciona visualmente (testado com `cm-test-red` e sandbox CodeMirror)
- `Decoration.line` → NÃO aplica CSS visível (testado no sandbox: `.cm-live-line-head` não renderiza)

### Estado atual
- Build compila e roda sem erros
- Headings ficam grandes/verdes, bold/italic renderizam, code inline com fundo, blockquote com borda verde
- `#` do heading continua visível (sem `hideMarks` — não existe na versão estável do `@codemirror/lang-markdown` 6.5.0)

## Pendente

1. **Visual não atende à expectativa do usuário**: o efeito não está "pomposo" como o preview HTML anterior. Headings renderizam inline mas o `#` aparece. Espaçamento entre linhas com tamanhos diferentes pode quebrar o layout.

2. **Alternativa a explorar**: `Decoration.replace` — substitui o texto original por um widget renderizado (HTML real do `marked`), escondendo a sintaxe. Isso daria um visual 100% igual ao preview antigo, porém dentro do editor. Mais complexo, mas resultado superior.

3. **hideMarks**: quando `@codemirror/lang-markdown` lançar versão com suporte a `hideMarks`, adicionar para esconder `#`, `*`, `_` etc. nas linhas sem cursor.

## Branch

`feature/live-preview` (commit `9bff083`, pushado no GitHub)

## Referências

- Sandbox validado: `Decoration.mark` renderiza CSS visível; `Decoration.line` não
- Documentação CodeMirror decorations: https://codemirror.net/examples/decoration/
- SilverBullet (live preview via widgets): https://github.com/silverbulletmd/silverbullet
