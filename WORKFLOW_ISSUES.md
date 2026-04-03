# Relatório: GitHub Actions Release Workflow - Carmem

**Data:** 03/04/2026  
**Projeto:** Carmem - Markdown Editor (Wails v2)  
**Repo:** https://github.com/EduardoSantos2231/carmem_mardown_editor

---

## Objetivo

Criar um workflow do GitHub Actions que:
1. Build automático para Linux (`.tar.gz`)
2. Build automático para Windows (NSIS installer `.exe`)
3. Release automática no GitHub ao fazer push de tag

---

## Problema Principal

**O build para Windows não gera o NSIS installer.** O binário do Windows não é distribuído corretamente aos usuários.

---

## Tentativas Realizadas

### Tentativa 1: Usar `host-uk/build@v4`
**Status:** ❌ FALHOU  
**Erro:** `Unable to resolve action 'host-uk/build@v4', unable to find version 'v4'`

**Motivo:** O repositório `host-uk/build` é um fork e não tem tags release. Apenas o repositório original `dAppCore/build` tem releases (v4.0.0, v2.2, etc).

---

### Tentativa 2: Usar `dAppCore/build@v4.0.0`
**Status:** ⚠️ NÃO TESTADO

**Motivo:** Decidimos usar workflow manual para evitar dependência de actions de terceiros.

---

### Tentativa 3: Workflow Manual com `replace()` 
**Status:** ❌ FALHOU  
**Erro:** `Unrecognized function: 'replace'. Located at position 1 within expression`

**Motivo:** A função `replace()` não existe na sintaxe de expressões do GitHub Actions.

**Solução aplicada:** Adicionar variável `artifact_name` no matrix.

---

### Tentativa 4: Workflow Manual com `shell: bash`
**Status:** ❌ FALHOU  
**Erro:** Shell syntax error no Windows (PowerShell sendo usado por padrão)

**Solução aplicada:** Adicionar `shell: bash` em todos os steps que usam bash.

---

### Tentativa 5: Instalar NSIS via Chocolatey
**Status:** ❌ FALHOU  
**Erro:** `Warning: Cannot create installer: makensis not found`

**O que foi tentado:**
```yaml
- name: Install NSIS
  if: matrix.os == 'windows-latest'
  run: choco install nsis -y
```

**Resultado:** O NSIS foi instalado, mas o installer ainda não foi gerado.

---

## Evidência do Erro (Log do Workflow)

```
2026-04-03T21:15:28.9105857Z Creating NSIS installer
2026-04-03T21:15:28.9106385Z ------------------------------
2026-04-03T21:15:28.9266263Z Warning: Cannot create installer: makensis not found
```

**Runner:** Windows Server 2025 (windows-2025 image)

---

## Estado Atual do Workflow

**Commit:** `125d53f`  
**Arquivo:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: 'linux/amd64'
            os: 'ubuntu-latest'
            artifact_name: 'carmem-linux-amd64'
          - platform: 'windows/amd64'
            os: 'windows-latest'
            artifact_name: 'carmem-windows-amd64'

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Install Linux dependencies
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev build-essential pkg-config

      - uses: actions/setup-go@v5
        with:
          go-version: '1.23'

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Wails
        run: go install github.com/wailsapp/wails/v2/cmd/wails@v2.11.0

      - name: Install NSIS
        if: matrix.os == 'windows-latest'
        run: choco install nsis -y

      - name: Install frontend dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Build frontend
        run: npm run build
        working-directory: ./frontend

      - name: Build with Wails
        shell: bash
        run: |
          if [ "${{ matrix.platform }}" == "linux/amd64" ]; then
            wails build -platform linux/amd64 -tags webkit2_41 -o carmem
          else
            wails build -platform windows/amd64 -nsis -o carmem
          fi
        env:
          CGO_ENABLED: 1

      - name: Rename Linux artifact
        if: matrix.os == 'ubuntu-latest'
        shell: bash
        run: |
          cd build/bin
          tar -czf carmem-${{ github.ref_name }}-linux-amd64.tar.gz carmem
          rm -f carmem

      - name: Rename Windows artifact
        if: matrix.os == 'windows-latest'
        shell: bash
        run: |
          cd build/bin
          for f in carmem-*.exe; do
            if [ -f "$f" ]; then
              mv "$f" "carmem-${{ github.ref_name }}-windows-amd64-installer.exe"
            fi
          done

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.artifact_name }}
          path: |
            build/bin/*.tar.gz
            build/bin/*-installer.exe

  release:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts/

      - name: List artifacts
        run: ls -laR artifacts/

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          name: Carmem ${{ github.ref_name }}
          draft: false
          prerelease: false
          generate_release_notes: true
          files: artifacts/**/*
```

---

## O que Funciona

| Plataforma | Status | Output |
|------------|--------|--------|
| Linux | ✅ OK | `carmem-*.tar.gz` |
| Windows | ❌ FALHOU | Sem output (NSIS não funciona) |

---

## Possíveis Abordagens para Resolver

### 1. Verificar instalação do NSIS
```bash
# Verificar se NSIS foi instalado corretamente
choco list --local-only nsis
# Ou
where makensis
```

### 2. Usar chocolatey com versão específica
```yaml
- name: Install NSIS
  if: matrix.os == 'windows-latest'
  run: choco install nsis --version=3.09 -y
```

### 3. Baixar NSIS manualmente
```yaml
- name: Download NSIS
  if: matrix.os == 'windows-latest'
  run: |
    Invoke-WebRequest -Uri "https://nsis.sourceforge.io/mediawiki/images/a/af/Nsis-3.09.zip" -OutFile "nsis.zip"
    Expand-Archive -Path "nsis.zip" -DestinationPath "$env:TEMP\nsis"
    Add-Content -Path $env:GITHUB_PATH -Value "$env:TEMP\nsis"
```

### 4. Usar Windows runner mais antigo
O Windows Server 2025 pode ter incompatibilidades. Tentar `windows-2022`:
```yaml
- platform: 'windows/amd64'
  os: 'windows-2022'
```

### 5. Distribuir apenas o binário ZIP (sem installer)
Modificar para gerar e distribuir o ZIP em vez do NSIS:
```yaml
- name: Build with Wails
  shell: bash
  run: |
    if [ "${{ matrix.platform }}" == "linux/amd64" ]; then
      wails build -platform linux/amd64 -tags webkit2_41 -o carmem
    else
      wails build -platform windows/amd64 -o carmem
    fi
```

### 6. Usar action `dAppCore/build@v4.0.0` com NSIS
```yaml
- name: Build Wails App
  uses: dAppCore/build@v4.0.0
  with:
    build-name: carmem
    build-platform: ${{ matrix.platform }}
    nsis: 'true'
    package: 'true'
```

### 7. Instalar NSIS via winget (alternativa ao chocolatey)
```yaml
- name: Install NSIS
  if: matrix.os == 'windows-latest'
  run: winget install --id NSIS.NSIS -e --source winget
```

### 8. Adicionar PATH manualmente após chocolatey
```yaml
- name: Install NSIS
  if: matrix.os == 'windows-latest'
  run: |
    choco install nsis -y
    Add-Content -Path $env:GITHUB_PATH -Value "C:\Program Files (x86)\NSIS"
```

---

## Links Úteis

- [NSIS Download](https://nsis.sourceforge.io/Download)
- [NSIS Chocolatey Package](https://community.chocolatey.org/packages/nsis)
- [Wails v2 Cross-platform Build](https://wails.io/docs/guides/crossplatform-build/)
- [dAppCore/build GitHub Action](https://github.com/dAppCore/build)
- [Wails NSIS Issues](https://github.com/wailsapp/wails/issues?q=nsis)

---

## Conclusão

O workflow para **Linux funciona corretamente**. O problema está exclusivamente no **build do Windows**, onde o NSIS não está gerando o installer mesmo após instalação via Chocolatey.

**Recomendação imediata:** Distribuir apenas o binário do Windows (sem installer) ou usar o action `dAppCore/build` que pode ter inteligência adicional para lidar com NSIS.

---

## Comandos Úteis

```bash
# Testar workflow com tag dummy
git tag v0.0.1-test
git push origin v0.0.1-test

# Ver logs do workflow
gh run view --log

# Listar artifacts
gh run list --workflow=release.yml

# Ver release
gh release list
```
