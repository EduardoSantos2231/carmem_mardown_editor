# Carmem

Um editor de Markdown desktop multiplataforma construído com Wails v2, React, TypeScript e Tailwind CSS.

## Instalação

### Windows

1. Baixe `carmem-vX.X.X-windows-amd64.zip` da página de [releases](https://github.com/EduardoSantos2231/carmem_mardown_editor/releases)
2. Extraia o arquivo ZIP
3. Execute `carmem.exe`

### Linux

1. Baixe `carmem-vX.X.X-linux-amd64.tar.gz` da página de [releases](https://github.com/EduardoSantos2231/carmem_mardown_editor/releases)
2. Extraia o arquivo:
   ```bash
   tar -xzf carmem-vX.X.X-linux-amd64.tar.gz
   ```
3. Execute:
   ```bash
   ./carmem
   ```
4. (Opcional) Para ícone no lançador, copie `carmem.desktop` para `~/.local/share/applications/`.

## Requisitos

### Linux

| Distro | Dependências |
|--------|-------------|
| Ubuntu 24.04+ / Debian | `libwebkit2gtk-4.1-dev libgtk-3-dev` |
| Fedora 40+ | `webkit2gtk4.1-devel gtk3-devel` |
| Arch | `webkit2gtk-4.1 gtk3` |

### Windows
- Windows 10/11
- WebView2 Runtime (geralmente já instalado no Windows 10/11)

## Desenvolvimento

```bash
# Requisitos: Go 1.24+, Node.js 20+, Wails CLI v2.12.0

# Instalar Wails CLI
go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0

# Clonar
git clone https://github.com/EduardoSantos2231/carmem_mardown_editor
cd carmem_mardown_editor

# Desenvolvimento (hot reload)
wails dev -tags webkit2_41

# Build
wails build -tags webkit2_41
```
