# TorBox Cleaner

Script Docker que **deleta automaticamente** downloads travados em 0% ou verificação no TorBox. [1]



## 🎯 Funcionalidades

- ✅ Deleta torrents em `stalled (no seeds)`, `checkingResumeData`, `metaDL`
- ✅ Filtra apenas downloads com **progresso < 1%**
- ✅ Configurável (tempo mínimo parado, intervalo)
- ✅ Logs detalhados + estados debug
- ✅ Cron job nativo (roda a cada 30min)

## 🚀 Instalação rápida

```bash
git clone https://github.com/vinip1250-art/tbdel.git
cd tbdel
cp .env.example .env
nano .env  # edite TORBOX_API_KEY
docker compose up -d --build
```

## 📋 Pré-requisitos

- **Docker** + **Docker Compose**
- **Token API do TorBox** → [torbox.app/settings](https://torbox.app/settings)

***

## ⚙️ Configuração

| Variável | Descrição | Padrão |
|---|---|---|
| `TORBOX_API_KEY` | **Obrigatório** — Token da API | — |
| `STALL_MINUTES` | Tempo mínimo parado | `30` min |

**Exemplo `.env`:**
```env
TORBOX_API_KEY=abc123xyz789
STALL_MINUTES=15
```

***

## 🧪 Teste imediato

```bash
docker compose exec torbox-cleaner \
  node /app/node_modules/.bin/ts-node /app/src/cleaner.ts
```

**Saída esperada:**
```
Estados encontrados: stalled (no seeds), checkingResumeData, downloading...
Total: 1000 | Travados: 3
[✓] Deletado: Filme XYZ (id: 12345)
```

***

## 📊 Logs

```
# Logs do container
docker compose logs -f

# Logs do cleaner
tail -f logs/torbox-cleaner.log
```

***

## 🔄 Atualizar

```bash
cd tbdel
git pull
docker compose up -d --build
```

***

## 🛠️ Personalizar

### Intervalo do cron (Dockerfile)
```dockerfile
# A cada 15 minutos
*/15 * * * * node /app/node_modules/.bin/ts-node /app/src/cleaner.ts
```

### Estados detectados (src/cleaner.ts)
```typescript
const STUCK_STATES = [
  "stalled (no seeds)",
  "checkingResumeData",
  "metaDL",
  // adicione outros aqui
];
```

***

## 📱 Statuses detectados pelo TorBox

| Status | Detectado? |
|---|---|
| `stalled (no seeds)` | ✅ |
| `checkingResumeData` | ✅ |
| `metaDL` | ✅ |
| `progress < 1%` | ✅ |
| `> 30min parado` | ✅ |

***

## 🤖 Automação avançada

- **n8n** → [n8n-nodes-torbox](https://www.npmjs.com/package/n8n-nodes-torbox)
- **Cloudflare Workers** → API calls diretas
- **GitHub Actions** → Deploy automático

***

## 📈 Exemplo de saída

```
[2026-03-02T20:30:49Z] Iniciando verificação...
Estados encontrados: stalled (no seeds), checkingResumeData, downloading...
Total: 1000 | Travados: 3
  → stalled (no seeds) | 0.0% | Filme XYZ
[✓] Deletado: Filme XYZ (id: 12345)
```

***

## ⚠️ Aviso

- **Backup**: Teste com `STALL_MINUTES=9999` primeiro
- **Rate limit**: API tem limite de ~1000 requisições/hora
- **Logs**: Volume `./logs` persiste logs

## ⭐ Contribua

1. Fork → Clone → PR
2. Adicione novos estados no `STUCK_STATES`
3. Teste com `docker compose exec ...`

***

**Criado por [@vinip1250-art](https://github.com/vinip1250-art)**  
**Licença: MIT** | **Docker Pulls: 📈**

***

Citações:
[1] torbox-sdk-dotnet/documentation/services/TorrentsService.md at main https://github.com/TorBox-App/torbox-sdk-dotnet/blob/main/documentation/services/TorrentsService.md
[2] image.jpg https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/158879466/96aa4a22-cfa8-4066-be23-377d3a22f6b1/image.jpg
