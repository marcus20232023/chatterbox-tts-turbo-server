<p align="center">
  <img src="https://lm17s1uz51.ufs.sh/f/EsgO8cDHBTOU5bjcd6giJaPhnlpTZysr24u6k9WGqwIjNgQo" alt="Chatterbox Turbo TTS Server header">
</p>

# Chatterbox TTS Turbo Server

<p align="center">
  <a href="https://github.com/marcus20232023/chatterbox-tts-turbo-server">
    <img src="https://img.shields.io/github/stars/marcus20232023/chatterbox-tts-turbo-server?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/marcus20232023/chatterbox-tts-turbo-server">
    <img alt="GitHub forks" src="https://img.shields.io/github/forks/marcus20232023/chatterbox-tts-turbo-server"></a>
  <a href="https://github.com/marcus20232023/chatterbox-tts-turbo-server/issues">
    <img src="https://img.shields.io/github/issues/marcus20232023/chatterbox-tts-turbo-server" alt="GitHub issues"></a>
  <img src="https://img.shields.io/github/last-commit/marcus20232023/chatterbox-tts-turbo-server?color=red" alt="GitHub last commit">
  <a href="http://chatterboxtts.com/discord">
    <img src="https://img.shields.io/badge/Discord-Voice_AI_%26_TTS_Tools-blue?logo=discord&logoColor=white" alt="Discord">
  </a>
</p>

**Node/Express** web UI + reverse proxy for **ChatterTTS Turbo**. This lightweight server provides a clean web interface for text‑to‑speech generation and proxies requests to a running Turbo backend (no CORS issues, no extra setup).

## Features

🚀 **Turbo‑focused UI** — Fast, minimal web interface for ChatterTTS Turbo  
⚡ **Reverse Proxy** — `/api/*` proxy avoids browser CORS issues  
🎭 **Voice Selection** — Dropdown from `/voices`  
📤 **Voice Upload** — Optional voice file for cloning  
🎛️ **Live Controls** — Exaggeration slider + character counter  
🔊 **Playback + Download** — Listen or save audio instantly  
🧱 **Simple Stack** — Express + static frontend, easy to deploy

## ⚡️ Quick Start (Linux/macOS)

```bash
chmod +x start.sh
./start.sh
```

The UI will be available at:
```
http://0.0.0.0:5432
```

> [!TIP]
> Ensure **ChatterTTS Turbo** is running at `http://localhost:4324` (or set `API_TARGET`).

## Local Installation

```bash
# Clone the repository
git clone https://github.com/marcus20232023/chatterbox-tts-turbo-server.git
cd chatterbox-tts-turbo-server

# Install dependencies
npm install

# Start the server
npm start
```

## ⚙️ Configuration

You can override the API target or UI port with environment variables:

```bash
API_TARGET=http://localhost:4324 PORT=5432 npm start
```

Defaults:

- **PORT:** `5432`
- **API_TARGET:** `http://localhost:4324`

## 🔁 Proxy Behavior

All requests are proxied through `/api`:

- `/api/voices` → `${API_TARGET}/voices`
- `/api/generate` → `${API_TARGET}/generate`

This keeps the UI self‑contained and prevents browser CORS errors.

## 🧪 Expected Form Fields

The UI sends the following fields when generating audio:

- `text`
- `exaggeration`
- `voice` or `voice_name`
- `voice_file` (optional upload)

If your backend expects different field names, update `public/app.js`.

## 🛠 Troubleshooting

**UI loads but generation fails**

- Verify Turbo backend is running and reachable at `API_TARGET`

**CORS errors**

- Ensure requests go through `/api`, not directly to the backend

**Port already in use**

```bash
echo "PORT=5444" >> .env
```

## 📁 Project Structure

```
public/          # Static frontend (HTML/JS/CSS)
server.js        # Express server + proxy
start.sh         # One‑shot install + run (Linux/macOS)
package.json     # Dependencies and scripts
```

## Support

- 🐛 **Issues**: Open a GitHub issue
- 💬 **Discord**: [Join the community](http://chatterboxtts.com/discord)

---

## 📄 License

MIT © 2026 Chatterbox‑TTS‑Turbo‑Server Contributors

## 🙏 Credits

- [Resemble AI – Chatterbox](https://github.com/resemble-ai/chatterbox)
- Inspired by [devnen/Chatterbox‑TTS‑Server](https://github.com/devnen/Chatterbox-TTS-Server)
