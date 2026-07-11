# Funcionalidades do Carmem

## Editor de Markdown

### Syntax Highlighting

O editor utiliza **CodeMirror 6** com suporte nativo a Markdown. Elementos destacados:
- Títulos (#, ##, ###, etc.)
- Negrito e itálico
- Links e URLs
- Código inline e blocos de código (com syntax highlighting via @codemirror/lang-*)
- Listas (ordenadas e não ordenadas)
- Citações (blockquote)
- Tabelas
- Listas de tarefas (`- [ ]`)
- Texto riscado (`~~texto~~`)
- Linha horizontal (`---`)

A label de linguagem nos blocos de código (ex: `js`, `ts`, `python`) aparece esmaecida
para não competir visualmente com o conteúdo.

## Preview

### Live Preview Inline

O preview é renderizado **inline** dentro do próprio editor, sem painel HTML separado.
Conforme o usuário digita e sai de uma linha, ela é automaticamente estilizada com
tipografia visual:

- Títulos aparecem grandes e com cor de destaque
- Negrito e itálico renderizam inline
- Código inline ganha fundo destacado
- Blocos de código recebem fundo sutil com borda lateral accent
- Citações ganham borda lateral grossa
- Links ganham sublinhado e cor
- Listas mostram marcadores (`-`, `*`, `1.`) sempre visíveis
- Blocos de matemática (`$$...$$`) ganham fundo accent e fonte monospace
- Matemática inline (`$...$`) renderiza em azul monospace
- Tabelas GFM exibem colunas com bordas verticais e fonte monoespaçada

A linha ativa (onde o cursor está) permanece em markdown bruto para edição.

### Modo Preview (Lock)

O botão **Eye** na toolbar (ou `Ctrl+P`) ativa o modo preview lockado:
- Editor fica **readonly** (sem edição)
- Números de linha (gutter) são ocultados
- Ideal para revisar o documento sem risco de alterações acidentais

Para voltar a editar: clique no mesmo botão ou pressione `Ctrl+P` novamente.

### Floating Formatting Toolbar

Ao selecionar texto no editor, uma **toolbar flutuante** aparece com botões de formatação:
- **B** (Negrito), *I* (Itálico), H (Título), Link, Lista, Código inline
- Cada botão aplica/remove a marcação markdown no texto selecionado
- Estilo neobrutalista: fundo accent (`#0055ff`), borda 3px, sombra dura
- Desaparece ao pressionar Escape, perder foco, ou limpar a seleção

## Autosave

O editor salva automaticamente após 2 segundos de inatividade:

- **Indicador visual**: Exibe status na barra de status
  - **Não salvo**: Há alterações pendentes
  - **Salvando...**: Salvando automaticamente
  - **Salvo**: Arquivo salvo com sucesso
- **Salvamento manual**: Ctrl+S continua funcionando
- **Timeout**: 2 segundos de debounce

## Wikilinks `[[link]]`

Conexões entre notas no estilo Obsidian. Basta digitar `[[nome-da-nota]]` para criar
um link clicável:

- **Navegação**: Clique no link para abrir o arquivo referenciado
- **Busca inteligente**: Procura no mesmo diretório → diretórios pais → árvore inteira
- **Criação automática**: Se o arquivo não existir, o Carmem pergunta se deseja criá-lo
- **Alias**: Use `[[nota|texto amigável]]` para exibir um texto diferente do nome do arquivo
- **Estilo**: Sublinhado pontilhado na cor accent, igual a links da web

## Canvas / Grafo

Visualização interativa das conexões entre suas notas:

- **Acesso**: Botão "Graph" na toolbar (ícone de rede)
- **Nós**: Cada arquivo `.md` é um círculo. Azul = tem links, cinza = sem links
- **Arestas**: Linhas conectam notas que possuem `[[links]]` entre si
- **Interação**: Pan (arrastar), zoom (scroll), clique no nó para abrir o arquivo
- **Força simulada**: Algoritmo de física posiciona os nós organicamente (spatial grid para performance)
- **Renderização**: SVG para até 800 nós, Canvas 2D para grafos maiores
- **Estados vazios**:
  - Sem notas: mensagem + botão "Criar primeira nota"
  - Notas sem links: mensagem instruindo uso de `[[links]]`

## Update Checker

O Carmem verifica automaticamente se há uma nova versão disponível via
[GitHub Releases API](https://api.github.com/repos/EduardoSantos2231/carmem_mardown_editor/releases/latest):

- **Ao iniciar**: Consulta silenciosa à API do GitHub
- **Nova versão**: Modal com changelog da release + botão "Baixar" (abre a página de download)
- **Sem rede**: A verificação falha silenciosamente — não bloqueia o app
- **Dev mode**: Versão `dev` (sem tag) não consulta atualizações

## Gerenciamento de Arquivos

### Árvore de Arquivos

A sidebar exibe a estrutura de pastas e arquivos:
- Pastas com seta de expansão/collapse
- Arquivos com ícone diferenciado
- Identação visual para subpastas

### Operações CRUD

| Operação | Como fazer |
|----------|------------|
| **Criar arquivo** | Botão "+" na sidebar |
| **Criar pasta** | Botão "pasta+" na sidebar |
| **Renomear** | Selecionar item + botão "lápis" — nome atual pré-preenchido |
| **Excluir** | Selecionar item + botão "lixeira" |
| **Mover** | Arrastar e soltar em outra pasta |

### Drag & Drop

Arquivos e pastas podem ser movidos via drag and drop:
1. Clique e segure no item
2. Arraste para a pasta de destino
3. Solte para mover

**Validações:**
- Impossível mover pasta para dentro de si mesma
- Arquivo movido é atualizado na árvore automaticamente
- Se o arquivo aberto for movido, o editor bloqueia

## Interface

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Carmem]           [+][📁][🗑][✏️]                    │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  📁 pasta│         ╔══ papel ═══════════════════╗      │
│   ▶ 📄 a │         ║  Editor de Markdown       ║      │
│     📄 x │◄ resizer║  (CodeMirror + live prev) ║      │
│   ▶ 📄 b │         ║                           ║      │
│          │         ╚═══════════════════════════╝      │
├──────────┴──────────────────────────────────────────────┤
│  ■ Salvo │                     │ /path/to/file.md      │
└─────────────────────────────────────────────────────────┘
```

### Tema — Neobrutalismo "Papel & Tinta"

- **Tema Escuro** (padrão): Papel escuro (`#2a2a2a`), tinta clara (`#e8dcc8`), accent azul royal (`#0055ff`)
- **Tema Claro**: Papel creme (`#fafaf5`), tinta preta (`#1a1a1a`), accent azul royal (`#0055ff`)
- **Bordas grossas**: 3px sólidas
- **Sombras duras**: `4px 4px 0` — estilo neobrutalista inspirado em RetroUI
- **Tipografia**: Bricolage Grotesque (carregada localmente, funciona offline)
- **Ícones**: SVGs próprios com traço 1.5px, sem dependência de biblioteca externa

### Painéis Redimensionáveis

- **Sidebar**: Arrastar borda direita
  - Largura mínima: 200px
  - Largura máxima: 500px
  - Persistido em localStorage

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| Ctrl+S | Salvar arquivo |
| Ctrl+P | Modo preview lockado (readonly + sem gutter) |
| Ctrl++ | Aumentar zoom |
| Ctrl+- | Diminuir zoom |
| Ctrl+0 | Resetar zoom |

## Zoom

O zoom usa a propriedade CSS `zoom` — escala visualmente toda a interface sem
recalcular layout. Sem flicker, sem salto no gutter, funciona de 50% a 200%.

## Configuração

### Arquivo de Configuração

Local: `~/.carmem/config.json`

```json
{
  "theme": "dark",
  "documents": "/home/user/.carmem/documents"
}
```

### Pasta de Documentos

Local padrão: `~/.carmem/documents`

Criada automaticamente na primeira execução se não existir.

## Estado Inicial

Ao iniciar a aplicação, o editor inicia **bloqueado** (não é possível digitar):

1. **Mensagem informativa**: "Selecione ou crie um arquivo na barra lateral para começar a editar."
2. **Editor placeholder**: Mensagem cobre o editor
3. **Desbloqueio**: Ao selecionar um arquivo, o editor é desbloqueado automaticamente

## Limitações

1. **Imagens**: Não há suporte a imagens em arquivos Markdown
2. **Múltiplos arquivos**: Apenas um arquivo aberto por vez
3. **Sync**: Sem sincronização em nuvem
4. **Plugins**: Sem sistema de plugins

## Roadmap

- **Personalização de cores accent**: Trocar azul royal por qualquer cor via config
- **Live preview de tabelas GFM**: Colunas com largura uniforme e alinhamento automático
- **Suporte a imagens**: Renderização inline de imagens em Markdown
- **Múltiplos arquivos**: Sistema de abas para editar vários arquivos simultaneamente
- **Sincronização em nuvem**: Backup e sync entre dispositivos

Para issues conhecidas e histórico de bugs, veja [KNOWN_ISSUES.md](KNOWN_ISSUES.md).
