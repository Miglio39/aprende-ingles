export const isSpeechSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const cleanTextForSpeech = (text, isPastOrParticiple = false) => {
  const normalized = text.trim().toLowerCase();
  // Caso especial: pasado y participio de "read" se pronuncian como "red"
  if (isPastOrParticiple && normalized === "read") {
    return "red";
  }
  // Cambia "/" por pausa natural para que no lea "slash"
  return text.replace(/\s*\/\s*/g, ", ");
};

const pickEnglishVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-US" && v.localService) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en-")) ||
    null
  );
};

export const stopSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

export const speakEnglish = (
  text,
  { isPastOrParticiple = false, rate = 0.88 } = {}
) => {
  if (!isSpeechSupported() || !text) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(
    cleanTextForSpeech(text, isPastOrParticiple)
  );
  utterance.lang = "en-US";
  utterance.rate = rate;

  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
};

export const speakSequence = (items, rate = 0.86) => {
  if (!isSpeechSupported() || !items?.length) return;

  window.speechSynthesis.cancel();
  const voice = pickEnglishVoice();

  items.forEach(({ text, isPastOrParticiple = false }) => {
    const utterance = new SpeechSynthesisUtterance(
      cleanTextForSpeech(text, isPastOrParticiple)
    );
    utterance.lang = "en-US";
    utterance.rate = rate;
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  });
};