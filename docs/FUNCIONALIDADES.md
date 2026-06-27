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

### Live Preview Inline

O preview é renderizado **inline** dentro do próprio editor, sem painel HTML separado.
Conforme o usuário digita e sai de uma linha, ela é automaticamente estilizada com
tipografia visual:

- Títulos aparecem grandes e verdes
- Negrito e itálico renderizam inline
- Código inline ganha fundo destacado
- Blocos de código e citações recebem formatação visual
- Links ganham sublinhado e cor

A linha ativa (onde o cursor está) permanece em markdown bruto para edição.

### Modo Preview (Lock)

O botão **Eye** na toolbar (ou `Ctrl+P`) ativa o modo preview lockado:
- Editor fica **readonly** (sem edição)
- Números de linha (gutter) são ocultados
- Ideal para revisar o documento sem risco de alterações acidentais

Para voltar a editar: clique no mesmo botão ou pressione `Ctrl+P` novamente.

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
│     📄 x │◄── Resizer           │                      │
│   ▶ 📄 b │                      │                      │
│          │                      │                      │
├──────────┴──────────────────────────────────────────────┤
│  ● Salvo │                     │ /path/to/file.md      │
└─────────────────────────────────────────────────────────┘
```

### Temas

- **Tema Escuro** (padrão): Fundo escuro, texto claro
- **Tema Claro**: Fundo claro, texto escuro

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
