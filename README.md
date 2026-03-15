# Chatterbox‑TTS‑Turbo‑Server

**A lightweight web UI and reverse proxy for the ChatterTTS Turbo engine.**

This project provides a clean web interface for text‑to‑speech generation and proxies requests to a running ChatterTTS Turbo backend. It mirrors the structure and usage style of the reference Chatterbox TTS Server, but is purpose‑built for the Turbo endpoint.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

---

## ✨ Features

- Modern, minimal web UI for ChatterTTS Turbo
- Text input with live character counter
- Voice library dropdown (`GET /voices`)
- Optional voice file upload for cloning
- Exaggeration control slider (0.25 – 2.0)
- Audio playback + download
- Built‑in reverse proxy to avoid CORS issues

---

## ✅ Requirements

- **Node.js 18+** (Node 20+ recommended)
- **ChatterTTS Turbo** running at **http://localhost:4324** (or your LAN IP)

---

## 🚀 Quick Start (Linux/macOS)

```bash
chmod +x start.sh
./start.sh
```

The UI will be available at:
```
http://0.0.0.0:5432
```

---

## 🔧 Manual Setup

```bash
npm install
npm start
```

---

## ⚙️ Configuration

You can override the API target or UI port with environment variables:

```bash
API_TARGET=http://localhost:4324 PORT=5432 npm start
```

Defaults:
- **PORT:** 5432
- **API_TARGET:** http://192.168.1.3:4324

---

## 🔁 Proxy Behavior

All API calls are proxied through `/api`:

- `/api/voices` → `${API_TARGET}/voices`
- `/api/generate` → `${API_TARGET}/generate`

This avoids browser CORS issues and keeps the UI self‑contained.

---

## 🧪 Expected Form Fields

The UI sends the following fields when generating audio:

- `text`
- `exaggeration`
- `voice` or `voice_name`
- `voice_file` (optional upload)

If your backend expects different field names, update `public/app.js` accordingly.

---

## 🛠 Troubleshooting

- **UI loads but generation fails:** Verify the Turbo backend is running and reachable at `API_TARGET`.
- **CORS errors:** Ensure requests are made through `/api`, not directly to the backend.
- **Port already in use:** Set `PORT=xxxx` before running.

---

## 📄 License

MIT © 2026 Chatterbox‑TTS‑Turbo‑Server Contributors

---

## 🙏 Credits

- [Resemble AI – Chatterbox](https://github.com/resemble-ai/chatterbox)
- Inspired by [devnen/Chatterbox‑TTS‑Server](https://github.com/devnen/Chatterbox-TTS-Server)
