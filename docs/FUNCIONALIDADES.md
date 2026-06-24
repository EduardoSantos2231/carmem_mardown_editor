# Funcionalidades do Carmem

## Editor de Markdown

### Syntax Highlighting

O editor utiliza **CodeMirror 6** com suporte nativo a Markdown. Elementos destacados:
- Títulos (#, ##, ###, etc.)
- Negrito e itálico
- Links e URLs
- Código inline e blocos de código (com syntax highlighting via highlight.js)
- Listas (ordenadas e não ordenadas)
- Citações (blockquote)
- Tabelas
- Listas de tarefas (`- [ ]`)
- Texto riscado (`~~texto~~`)
- Linha horizontal (`---`)
- KaTeX para fórmulas matemáticas (`$E=mc^2$`)

## Preview

### Renderização em Tempo Real

O preview atualiza automaticamente enquanto o usuário digita:
- Markdown convertido para HTML
- Syntax highlighting em blocos de código
- Tabelas renderizadas
- Links clicáveis
- Suporte a KaTeX para fórmulas matemáticas

### Toggle Preview

O preview pode ser exibido/ocultado de duas formas:
1. **Botão na toolbar**: Clique para alternar
2. **Atalho de teclado**: Ctrl+P

**Layout:** O preview aparece ao lado do editor, com redimensionamento disponível.

### Modo Leitura

O modo leitura oculta o editor e exibe apenas o preview em tela cheia,
ideal para revisar o texto finalizado sem distrações:

- **Ativar**: Botão na toolbar ou `Ctrl+Shift+P`
- **Desativar**: Mesmo botão/atalho — volta ao layout anterior
- Salva automaticamente antes de ativar
- Só funciona com arquivo aberto
- O editor permanece montado (CSS hidden), evitando perda de estado

## Autosave

O editor salva automaticamente após 2 segundos de inatividade:

- **Indicador visual**: Exibe status na barra de status
  - **Não salvo**: Há alterações pendentes
  - **Salvando...**: Salvando automaticamente
  - **Salvo**: Arquivo salvo com sucesso
- **Salvamento manual**: Ctrl+S continua funcionando
- **Timeout**: 2 segundos de debounce

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
| **Renomear** | Selecionar item + botão "lápis" |
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

## Interface

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Carmem]           [+][📁][🗑][✏️]                    │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  📁 pasta│           Editor de Markdown                 │
│   ▶ 📄 a │           (CodeMirror)                      │
│     📄 x │◄────── Resizer ──────►│  Preview          │
│   ▶ 📄 b │                         │  (Markdown        │
│          │                         │   renderizado)    │
├──────────┴─────────────────────────┴──────────────────┤
│  ● Salvo │ Modo Vim: ATIVADO    │ /path/to/file.md   │
└─────────────────────────────────────────────────────────┘
```

### Temas

- **Tema Escuro** (padrão): Fundo escuro, texto claro
- **Tema Claro**: Fundo claro, texto escuro

### Painéis Redimensionáveis

1. **Sidebar**: Arrastar borda direita
   - Largura mínima: 200px
   - Largura máxima: 500px
   - Persistido em localStorage

2. **Editor/Preview**: Arrastar divisor quando preview visível
   - Proporção mínima: 20%
   - Proporção máxima: 80%
   - Persistido em localStorage

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| Ctrl+S | Salvar arquivo |
| Ctrl+P | Toggle preview |
| Ctrl++ | Aumentar zoom |
| Ctrl+- | Diminuir zoom |
| Ctrl+0 | Resetar zoom |
| Ctrl+Shift+P | Modo leitura |

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

- **Canvas**: Tela infinita para notas visuais, semelhante ao Obsidian Canvas
