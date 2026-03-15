const apiBaseUrlInput = document.getElementById("apiBaseUrl");
const apiResetBtn = document.getElementById("apiReset");
const textEl = document.getElementById("text");
const charCountEl = document.getElementById("charCount");
const clearTextBtn = document.getElementById("clearText");
const longTextNotice = document.getElementById("longTextNotice");
const voiceSelect = document.getElementById("voiceSelect");
const voiceFile = document.getElementById("voiceFile");
const voiceName = document.getElementById("voiceName");
const voiceLanguage = document.getElementById("voiceLanguage");
const refreshVoicesBtn = document.getElementById("refreshVoices");
const setDefaultVoiceBtn = document.getElementById("setDefaultVoice");
const clearDefaultVoiceBtn = document.getElementById("clearDefaultVoice");
const defaultVoiceBadge = document.getElementById("defaultVoiceBadge");
const uploadVoiceBtn = document.getElementById("uploadVoice");
const playVoiceBtn = document.getElementById("playVoice");
const downloadVoiceBtn = document.getElementById("downloadVoice");
const renameVoiceBtn = document.getElementById("renameVoice");
const deleteVoiceBtn = document.getElementById("deleteVoice");
const aliasInput = document.getElementById("aliasInput");
const addAliasBtn = document.getElementById("addAlias");
const aliasList = document.getElementById("aliasList");

const streamingToggle = document.getElementById("streamingToggle");
const streamingStatus = document.getElementById("streamingStatus");
const streamingFormat = document.getElementById("streamingFormat");
const streamingChunkSize = document.getElementById("streamingChunkSize");
const streamingStrategy = document.getElementById("streamingStrategy");
const streamingQuality = document.getElementById("streamingQuality");
const outputFormat = document.getElementById("outputFormat");

const exaggeration = document.getElementById("exaggeration");
const exaggerationValue = document.getElementById("exaggerationValue");
const cfgWeight = document.getElementById("cfgWeight");
const cfgWeightValue = document.getElementById("cfgWeightValue");
const temperature = document.getElementById("temperature");
const temperatureValue = document.getElementById("temperatureValue");
const resetAdvancedBtn = document.getElementById("resetAdvanced");

const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");
const downloadBtn = document.getElementById("downloadBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

const API_STORAGE_KEY = "chatterbox-api-endpoint";
const HISTORY_KEY = "chatterbox-tts-history";
const ADVANCED_KEY = "chatterbox-advanced-settings";
const DEFAULT_VOICE_KEY = "chatterbox-default-voice";

let currentAudioUrl = null;
let historyItems = [];
let defaultVoice = null;

const defaultAdvanced = {
  exaggeration: 0.5,
  cfgWeight: 0.5,
  temperature: 0.8,
};

function normalizeBaseUrl(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "/api";
  return trimmed.replace(/\/$/, "");
}

function getApiBaseUrl() {
  return normalizeBaseUrl(apiBaseUrlInput.value || localStorage.getItem(API_STORAGE_KEY) || "/api");
}

function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  return fetch(url, options);
}

function setStatus(message) {
  statusEl.textContent = message || "";
}

function updateCharCount() {
  const count = textEl.value.length;
  charCountEl.textContent = `${count} / 15000`;

  if (count > 3000) {
    longTextNotice.textContent = `Long text detected (${count} chars). The API may process this in background mode.`;
    longTextNotice.classList.remove("hidden");
  } else {
    longTextNotice.textContent = "";
    longTextNotice.classList.add("hidden");
  }
}

function updateAdvancedLabels() {
  exaggerationValue.textContent = Number(exaggeration.value).toFixed(2);
  cfgWeightValue.textContent = Number(cfgWeight.value).toFixed(2);
  temperatureValue.textContent = Number(temperature.value).toFixed(2);
}

function saveAdvanced() {
  const payload = {
    exaggeration: Number(exaggeration.value),
    cfgWeight: Number(cfgWeight.value),
    temperature: Number(temperature.value),
  };
  localStorage.setItem(ADVANCED_KEY, JSON.stringify(payload));
}

function loadAdvanced() {
  try {
    const raw = localStorage.getItem(ADVANCED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      exaggeration.value = parsed.exaggeration ?? defaultAdvanced.exaggeration;
      cfgWeight.value = parsed.cfgWeight ?? defaultAdvanced.cfgWeight;
      temperature.value = parsed.temperature ?? defaultAdvanced.temperature;
    }
  } catch (_) {}
  updateAdvancedLabels();
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    historyItems = raw ? JSON.parse(raw) : [];
  } catch (_) {
    historyItems = [];
  }
  renderHistory();
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyItems));
}

function addHistoryItem(item) {
  historyItems = [item, ...historyItems].slice(0, 20);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  if (historyItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "helper";
    empty.textContent = "No history yet.";
    historyList.appendChild(empty);
    return;
  }

  historyItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-item";

    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = `${item.voice || "Default"} • ${new Date(item.createdAt).toLocaleString()}`;

    row.appendChild(title);
    row.appendChild(meta);

    historyList.appendChild(row);
  });
}

function updateStreamingStatus() {
  streamingStatus.textContent = streamingToggle.checked
    ? `Streaming enabled (${streamingFormat.value})`
    : "Streaming disabled";
}

async function loadLanguages() {
  try {
    const res = await apiFetch("/languages");
    if (!res.ok) return;
    const data = await res.json();
    const langs = Array.isArray(data) ? data : data?.languages || [];
    voiceLanguage.innerHTML = "<option value=\"\">Language (optional)</option>";
    langs.forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang.code || lang.id || lang;
      opt.textContent = lang.name || lang.code || lang;
      voiceLanguage.appendChild(opt);
    });
  } catch (_) {}
}

async function loadDefaultVoice() {
  try {
    const res = await apiFetch("/voices/default");
    if (!res.ok) return;
    const data = await res.json();
    defaultVoice = data.default_voice || null;
    if (defaultVoice) {
      localStorage.setItem(DEFAULT_VOICE_KEY, defaultVoice);
    }
  } catch (_) {
    defaultVoice = localStorage.getItem(DEFAULT_VOICE_KEY);
  }
  updateDefaultVoiceBadge();
}

function updateDefaultVoiceBadge() {
  if (!defaultVoice) {
    defaultVoiceBadge.textContent = "";
    defaultVoiceBadge.classList.remove("visible");
    return;
  }
  defaultVoiceBadge.textContent = `Default: ${defaultVoice}`;
  defaultVoiceBadge.classList.add("visible");
}

async function loadAliases() {
  aliasList.innerHTML = "";
  const voice = voiceSelect.value;
  if (!voice) return;

  try {
    const res = await apiFetch(`/voices/${encodeURIComponent(voice)}/aliases`);
    if (!res.ok) return;
    const data = await res.json();
    const aliases = data.aliases || data || [];
    aliases.forEach((alias) => {
      const tag = document.createElement("button");
      tag.className = "tag";
      tag.textContent = alias;
      tag.title = "Remove alias";
      tag.addEventListener("click", async () => {
        await apiFetch(`/voices/${encodeURIComponent(voice)}/aliases/${encodeURIComponent(alias)}`, {
          method: "DELETE",
        });
        loadAliases();
      });
      aliasList.appendChild(tag);
    });
  } catch (_) {}
}

async function loadVoices() {
  try {
    const res = await apiFetch("/voices");
    if (!res.ok) throw new Error("Failed to load voices");
    const data = await res.json();

    const voices = Array.isArray(data) ? data : data?.voices || [];

    voiceSelect.innerHTML = "";
    if (voices.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No voices found";
      voiceSelect.appendChild(opt);
      return;
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a voice";
    voiceSelect.appendChild(placeholder);

    voices.forEach((voice) => {
      const opt = document.createElement("option");
      if (typeof voice === "string") {
        opt.value = voice;
        opt.textContent = voice;
      } else {
        opt.value = voice.name || voice.id || "";
        opt.textContent = voice.name || voice.id || "Unknown";
      }
      voiceSelect.appendChild(opt);
    });
  } catch (err) {
    voiceSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Failed to load voices";
    voiceSelect.appendChild(opt);
  }
}

async function uploadVoice() {
  const file = voiceFile.files && voiceFile.files[0];
  if (!file) {
    setStatus("Select an audio file first.");
    return;
  }

  const name = (voiceName.value || "").trim() || file.name.replace(/\.[^/.]+$/, "");
  const language = voiceLanguage.value || "";

  const formData = new FormData();
  formData.append("voice_name", name);
  formData.append("voice_file", file);
  if (language) formData.append("language", language);

  uploadVoiceBtn.disabled = true;
  setStatus("Uploading voice...");
  try {
    const res = await apiFetch("/voices", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    await loadVoices();
    setStatus("Voice uploaded.");
    voiceName.value = "";
    voiceFile.value = "";
  } catch (err) {
    setStatus(err.message || "Upload failed");
  } finally {
    uploadVoiceBtn.disabled = false;
  }
}

async function playSelectedVoice() {
  const voice = voiceSelect.value;
  if (!voice) {
    setStatus("Select a voice first.");
    return;
  }
  try {
    const res = await apiFetch(`/voices/${encodeURIComponent(voice)}/download`);
    if (!res.ok) throw new Error("Failed to download voice");
    const blob = await res.blob();
    if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = URL.createObjectURL(blob);
    audioPlayer.src = currentAudioUrl;
    audioPlayer.play().catch(() => {});
    downloadBtn.href = currentAudioUrl;
    downloadBtn.removeAttribute("disabled");
  } catch (err) {
    setStatus(err.message || "Failed to play voice");
  }
}

async function downloadSelectedVoice() {
  const voice = voiceSelect.value;
  if (!voice) return;
  try {
    const res = await apiFetch(`/voices/${encodeURIComponent(voice)}/download`);
    if (!res.ok) throw new Error("Failed to download voice");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${voice}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    setStatus(err.message || "Download failed");
  }
}

async function renameSelectedVoice() {
  const voice = voiceSelect.value;
  if (!voice) return;
  const nextName = prompt("New voice name", voice);
  if (!nextName || nextName === voice) return;

  const formData = new FormData();
  formData.append("new_name", nextName);

  try {
    const res = await apiFetch(`/voices/${encodeURIComponent(voice)}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error("Rename failed");
    await loadVoices();
  } catch (err) {
    setStatus(err.message || "Rename failed");
  }
}

async function deleteSelectedVoice() {
  const voice = voiceSelect.value;
  if (!voice) return;
  if (!confirm(`Delete voice "${voice}"?`)) return;
  try {
    const res = await apiFetch(`/voices/${encodeURIComponent(voice)}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    await loadVoices();
  } catch (err) {
    setStatus(err.message || "Delete failed");
  }
}

async function addAlias() {
  const voice = voiceSelect.value;
  const alias = (aliasInput.value || "").trim();
  if (!voice || !alias) return;
  const formData = new FormData();
  formData.append("alias", alias);
  try {
    const res = await apiFetch(`/voices/${encodeURIComponent(voice)}/aliases`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Alias failed");
    aliasInput.value = "";
    loadAliases();
  } catch (err) {
    setStatus(err.message || "Alias failed");
  }
}

async function setDefaultVoice() {
  const voice = voiceSelect.value;
  if (!voice) return;
  const formData = new FormData();
  formData.append("voice_name", voice);
  try {
    const res = await apiFetch("/voices/default", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Failed to set default");
    defaultVoice = voice;
    localStorage.setItem(DEFAULT_VOICE_KEY, defaultVoice);
    updateDefaultVoiceBadge();
  } catch (err) {
    setStatus(err.message || "Failed to set default");
  }
}

async function clearDefaultVoice() {
  try {
    const res = await apiFetch("/voices/default", { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear default");
    defaultVoice = null;
    localStorage.removeItem(DEFAULT_VOICE_KEY);
    updateDefaultVoiceBadge();
  } catch (err) {
    setStatus(err.message || "Failed to clear default");
  }
}

async function generateSpeech() {
  const text = textEl.value.trim();
  if (!text) {
    setStatus("Please enter some text.");
    return;
  }

  generateBtn.disabled = true;
  setStatus("Generating audio...");

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }

  try {
    const uploadFile = voiceFile.files && voiceFile.files[0];

    let res;

    if (uploadFile) {
      const formData = new FormData();
      formData.append("input", text);
      formData.append("exaggeration", exaggeration.value);
      formData.append("cfg_weight", cfgWeight.value);
      formData.append("temperature", temperature.value);

      if (outputFormat.value) {
        formData.append("output_format", outputFormat.value);
        formData.append("response_format", outputFormat.value);
      }

      if (streamingChunkSize.value) {
        formData.append("streaming_chunk_size", streamingChunkSize.value);
      }
      if (streamingStrategy.value) {
        formData.append("streaming_strategy", streamingStrategy.value);
      }
      if (streamingQuality.value) {
        formData.append("streaming_quality", streamingQuality.value);
      }

      if (voiceSelect.value) {
        formData.append("voice", voiceSelect.value);
        formData.append("voice_name", voiceSelect.value);
      }

      formData.append("voice_file", uploadFile);

      res = await apiFetch("/audio/speech/upload", {
        method: "POST",
        body: formData,
      });
    } else {
      const payload = {
        input: text,
        exaggeration: Number(exaggeration.value),
        cfg_weight: Number(cfgWeight.value),
        temperature: Number(temperature.value),
      };

      if (outputFormat.value) {
        payload.output_format = outputFormat.value;
        payload.response_format = outputFormat.value;
      }

      if (streamingChunkSize.value) {
        payload.streaming_chunk_size = Number(streamingChunkSize.value);
      }
      if (streamingStrategy.value) {
        payload.streaming_strategy = streamingStrategy.value;
      }
      if (streamingQuality.value) {
        payload.streaming_quality = streamingQuality.value;
      }

      if (voiceSelect.value) {
        payload.voice = voiceSelect.value;
      }

      res = await apiFetch("/audio/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      let errorText = `Request failed (${res.status})`;
      try {
        const errJson = await res.json();
        errorText = errJson?.detail || errJson?.error || errorText;
      } catch (_) {}
      throw new Error(errorText);
    }

    const blob = await res.blob();
    currentAudioUrl = URL.createObjectURL(blob);
    audioPlayer.src = currentAudioUrl;
    audioPlayer.play().catch(() => {});

    downloadBtn.href = currentAudioUrl;
    downloadBtn.removeAttribute("disabled");

    addHistoryItem({
      id: Date.now().toString(),
      title: text.slice(0, 48) + (text.length > 48 ? "…" : ""),
      voice: voiceSelect.value || defaultVoice || "Default",
      createdAt: new Date().toISOString(),
    });

    setStatus(streamingToggle.checked ? "Done (streaming enabled)" : "Done");
  } catch (err) {
    setStatus(err.message || "Failed to generate audio");
  } finally {
    generateBtn.disabled = false;
  }
}

function initApiBaseUrl() {
  const stored = localStorage.getItem(API_STORAGE_KEY);
  apiBaseUrlInput.value = stored || "/api";
}

apiBaseUrlInput.addEventListener("change", () => {
  const normalized = normalizeBaseUrl(apiBaseUrlInput.value);
  apiBaseUrlInput.value = normalized;
  localStorage.setItem(API_STORAGE_KEY, normalized);
  loadVoices();
  loadLanguages();
  loadDefaultVoice();
});

apiResetBtn.addEventListener("click", () => {
  apiBaseUrlInput.value = "/api";
  localStorage.setItem(API_STORAGE_KEY, "/api");
  loadVoices();
  loadLanguages();
  loadDefaultVoice();
});

textEl.addEventListener("input", updateCharCount);
clearTextBtn.addEventListener("click", () => {
  textEl.value = "";
  updateCharCount();
});

exaggeration.addEventListener("input", () => {
  updateAdvancedLabels();
  saveAdvanced();
});

cfgWeight.addEventListener("input", () => {
  updateAdvancedLabels();
  saveAdvanced();
});

temperature.addEventListener("input", () => {
  updateAdvancedLabels();
  saveAdvanced();
});

resetAdvancedBtn.addEventListener("click", () => {
  exaggeration.value = defaultAdvanced.exaggeration;
  cfgWeight.value = defaultAdvanced.cfgWeight;
  temperature.value = defaultAdvanced.temperature;
  updateAdvancedLabels();
  saveAdvanced();
});

refreshVoicesBtn.addEventListener("click", loadVoices);
setDefaultVoiceBtn.addEventListener("click", setDefaultVoice);
clearDefaultVoiceBtn.addEventListener("click", clearDefaultVoice);
uploadVoiceBtn.addEventListener("click", uploadVoice);
playVoiceBtn.addEventListener("click", playSelectedVoice);
downloadVoiceBtn.addEventListener("click", downloadSelectedVoice);
renameVoiceBtn.addEventListener("click", renameSelectedVoice);
deleteVoiceBtn.addEventListener("click", deleteSelectedVoice);
addAliasBtn.addEventListener("click", addAlias);

voiceSelect.addEventListener("change", () => {
  loadAliases();
});

streamingToggle.addEventListener("change", updateStreamingStatus);
streamingFormat.addEventListener("change", updateStreamingStatus);

clearHistoryBtn.addEventListener("click", () => {
  historyItems = [];
  saveHistory();
  renderHistory();
});

generateBtn.addEventListener("click", generateSpeech);

initApiBaseUrl();
loadAdvanced();
updateCharCount();
updateStreamingStatus();
loadVoices();
loadLanguages();
loadDefaultVoice();
loadHistory();
