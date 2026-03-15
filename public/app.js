const textEl = document.getElementById("text");
const charCountEl = document.getElementById("charCount");
const voiceSelect = document.getElementById("voiceSelect");
const voiceFile = document.getElementById("voiceFile");
const exaggeration = document.getElementById("exaggeration");
const exaggerationValue = document.getElementById("exaggerationValue");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");
const downloadBtn = document.getElementById("downloadBtn");

let currentAudioUrl = null;
let cachedRickSample = null;

function isRickVoice(value) {
  return value && value.toLowerCase().includes("rick");
}

async function getRickSampleFile() {
  if (cachedRickSample) return cachedRickSample;

  const res = await fetch("/api/voices/male_rickmorty/download");
  if (!res.ok) throw new Error("Failed to download Rick sample");

  const blob = await res.blob();
  const filename = "male_rickmorty_full.mp3";
  cachedRickSample = new File([blob], filename, {
    type: blob.type || "audio/mpeg",
  });

  return cachedRickSample;
}

function updateCharCount() {
  const count = textEl.value.length;
  charCountEl.textContent = `${count} / 3000`;
}

function setStatus(message) {
  statusEl.textContent = message || "";
}

async function loadVoices() {
  try {
    const res = await fetch("/api/voices");
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
    const formData = new FormData();
    formData.append("input", text);
    formData.append("exaggeration", exaggeration.value);

    if (voiceSelect.value) {
      formData.append("voice", voiceSelect.value);
      formData.append("voice_name", voiceSelect.value);
    }

    let uploadFile = voiceFile.files && voiceFile.files[0];

    if (!uploadFile && isRickVoice(voiceSelect.value)) {
      try {
        uploadFile = await getRickSampleFile();
      } catch (err) {
        console.warn("Rick sample download failed", err);
      }
    }

    if (uploadFile) {
      formData.append("voice_file", uploadFile);
    }

    const res = await fetch("/api/audio/speech/upload", {
      method: "POST",
      body: formData,
    });

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

    setStatus("Done");
  } catch (err) {
    setStatus(err.message || "Failed to generate audio");
  } finally {
    generateBtn.disabled = false;
  }
}

textEl.addEventListener("input", updateCharCount);
exaggeration.addEventListener("input", () => {
  exaggerationValue.textContent = Number(exaggeration.value).toFixed(2);
});

generateBtn.addEventListener("click", generateSpeech);
voiceSelect.addEventListener("change", () => {
  if (isRickVoice(voiceSelect.value) && !(voiceFile.files && voiceFile.files[0])) {
    getRickSampleFile().catch(() => {});
  }
});

updateCharCount();
loadVoices();
