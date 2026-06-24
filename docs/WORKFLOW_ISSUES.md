# Relatório: GitHub Actions Release Workflow - Carmem

**Data:** 24/06/2026 (atualizado)  
**Projeto:** Carmem - Markdown Editor (Wails v2)  
**Repo:** https://github.com/EduardoSantos2231/carmem_mardown_editor

---

## Estado Atual

O workflow atual funciona para **Linux e Windows**, distribuindo binários empacotados (`.tar.gz` e `.zip` respectivamente).

**Versões no CI:**
| Ferramenta | Versão |
|-----------|--------|
| Go | 1.24 |
| Node.js | 20 LTS |
| Wails CLI | v2.12.0 |

**Build flags:**
- Linux: `wails build -platform linux/amd64 -tags webkit2_41 -o carmem`
- Windows: `wails build -platform windows/amd64 -o carmem.exe`

---

## Histórico de Problemas (03/04/2026)

Documenta 5 tentativas falhas de implementar o CI/CD:

### Tentativa 1: Usar `host-uk/build@v4`
**Status:** FALHOU  
**Erro:** `Unable to resolve action 'host-uk/build@v4'`  
**Motivo:** O repositório é um fork sem tags release.

### Tentativa 2: Usar `dAppCore/build@v4.0.0`
**Status:** NÃO TESTADO  
**Motivo:** Decidimos usar workflow manual.

### Tentativa 3: Workflow Manual com `replace()`
**Status:** FALHOU  
**Erro:** `replace()` não existe na sintaxe de expressões do GitHub Actions.

### Tentativa 4: Workflow Manual com `shell: bash`
**Status:** FALHOU  
**Erro:** Shell syntax error no Windows runner (PowerShell padrão).
**Solução:** Adicionar `shell: bash` em todos os steps.

### Tentativa 5: Instalar NSIS via Chocolatey
**Status:** FALHOU  
**Erro:** `makensis not found` mesmo após instalação.
**Solução atual:** Distribuir binário ZIP em vez de NSIS installer.

---

## Build do Windows sem extensão .exe

### Problema (corrigido no commit `f711e11`)
O comando `wails build -platform windows/amd64 -o carmem` não adicionava extensão `.exe`.

### Solução
Especificar `-o carmem.exe` no comando de build.

---

## Decisão: ZIP vs NSIS Installer

Após múltiplas tentativas com NSIS (que falhou no Windows Server 2025), optamos por distribuir apenas o binário ZIP. O NSIS pode ser reavaliado quando:
- O Windows runner tiver `makensis` disponível no PATH
- Ou o Wails tiver um método alternativo de empacotamento Windows

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
