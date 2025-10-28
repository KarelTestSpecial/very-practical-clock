
chrome.runtime.onMessage.addListener(handleMessages);

function handleMessages(message) {
  if (message.target !== 'offscreen') {
    return;
  }

  if (message.action === 'play-alarm-sound') {
    playAlarmSound(message.sound, message.duration);
  }
}

let currentAudio = null;
let timeoutId = null;

function playAlarmSound(sound, duration) {
  // Clear any existing timeout and pause current audio
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const soundFile = `sounds/${sound}.mp3`;
  currentAudio = new Audio(chrome.runtime.getURL(soundFile));
  currentAudio.loop = true;

  currentAudio.play().catch(error => {
    // We can ignore the AbortError because we are intentionally interrupting the previous sound.
    if (error.name !== 'AbortError') {
      console.error("Error playing sound in offscreen document:", error);
    }
  });

  timeoutId = setTimeout(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    timeoutId = null;
  }, duration * 1000);
}
