# Como Fazer Releases

## Visão Geral

O Carmem usa GitHub Actions para automatizar builds e releases. O workflow:
1. Dispara em push de tags no formato `v*.*.*`
2. Executa build manual com Wails CLI para Linux e Windows
3. Gera binários para Linux (`.tar.gz`) e Windows (`.zip`)
4. Cria release automaticamente no GitHub

## Processo Completo

### 1. Preparar o Código

Faça as alterações necessárias no código:
- Bug fixes
- Novas funcionalidades
- Atualizações de dependências

### 2. Commitar as Alterações

```bash
git add .
git commit -m "Descrição das alterações"
git push
```

### 3. Criar a Tag

Use versionamento semântico (MAJOR.MINOR.PATCH):

```bash
# Criar tag
git tag -a v1.1.0 -m "Descrição da versão"

# Push da tag (aciona o workflow)
git push origin v1.1.0
```

### 4. Acompanhar o Build

1. Vá até a aba **Actions** no GitHub
2. Verifique se o workflow foi acionado
3. Aguarde o build completar (~3-5 minutos)
4. Verifique os artefatos gerados

### 5. Verificar o Release

O release é criado automaticamente com:
- Binário para Linux (`carmem-vX.X.X-linux-amd64.tar.gz`)
- Binário para Windows (`carmem-vX.X.X-windows-amd64.zip`)

## Versões

### Formato de Tags

| Tipo | Exemplo | Quando usar |
|------|---------|-------------|
| Patch | v1.1.1 | Bug fixes |
| Minor | v1.2.0 | Novas funcionalidades |
| Major | v2.0.0 | Mudanças incompatíveis |

### Tags de Teste

Para testar o workflow, use tags temporárias:
- `v0.1.0-test`
- `v1.0.0-rc1`

## Workflow Detalhado

### Arquivo: `.github/workflows/release.yml`

O workflow atual usa build manual com Wails CLI, executando builds em paralelo para Linux e Windows.

**Versões:**
| Ferramenta | Versão |
|-----------|--------|
| Go | 1.24 |
| Node.js | 20 LTS |
| Wails CLI | v2.12.0 |

**Matriz de Build:**
| Plataforma | OS | Output |
|------------|-----|--------|
| linux/amd64 | ubuntu-latest | `carmem-vX.X.X-linux-amd64.tar.gz` |
| windows/amd64 | windows-latest | `carmem-vX.X.X-windows-amd64.zip` |

**Passos do Workflow:**
1. **Checkout**: Clona o repositório com submodules
2. **Setup**: Instala Go 1.24, Node.js 20, e Wails CLI v2.12.0
3. **Frontend**: Instala dependências e faz build do frontend (Vite)
4. **Build**: Compila o app com Wails para a plataforma alvo, usando `-tags webkit2_41` no Linux
5. **Package**: Cria arquivo compactado (tar.gz para Linux, zip para Windows)
6. **Release**: Upload dos artefatos e criação automática da release

**Nota:** O build do Linux usa a build tag `webkit2_41` para compatibilidade com webkit2gtk-4.1 (API atual). O build do Windows especifica `-o carmem.exe` para garantir a extensão correta.

## Troubleshooting

### Build Falha

1. Verifique os logs na aba Actions
2. Common issues:
   - Dependências faltando (WebKit no Linux)
   - Timeout de rede
   - Versão incompatível de Go/Node

### Release Não Criado

1. Verifique se a tag foi pushada corretamente
2. Confirme que tem permissão `contents: write`
3. Verifique se não há erro no step de build

## Distribuição Manual

Se precisar distribuir manualmente (sem GitHub):

```bash
# Build local
wails build -tags webkit2_41

# Os binários ficam em:
# build/bin/carmem (Linux)
# build/bin/carmem.exe (Windows)
```

### Instalação do Ícone no Linux

Para que o ícone apareça no lançador de aplicativos:
1. Copie o binário para `/usr/local/bin/carmem`
2. Copie `assets/icons/carmem.desktop` para `~/.local/share/applications/`
3. Copie `assets/icons/icon.png` para `~/.local/share/icons/hicolor/256x256/apps/carmem.png`

## Estratégia de Branches

| Tipo | Branch | Exemplo |
|------|--------|---------|
| Feature | `feature/nome-da-feature` | `feature/read-mode` |
| Bug fix | `fix/nome-do-bug` | `fix/path-traversal` |
| Release | `main` (tag `v*`) | `v1.1.0` |

Fluxo:

```bash
# Criar branch para feature ou bug fix
git checkout -b feature/nome-da-feature
# ... commits ...
git push origin feature/nome-da-feature

# Depois de revisado, merge na main
git checkout main
git merge feature/nome-da-feature
git push origin main

# Criar tag para release (dispara CI/CD)
git tag -a v1.1.0 -m "Descrição da versão"
git push origin v1.1.0
```
