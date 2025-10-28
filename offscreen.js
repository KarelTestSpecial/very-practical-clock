
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

function playAlarmSound(sound, duration) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const soundFile = `sounds/${sound}.mp3`;
  currentAudio = new Audio(chrome.runtime.getURL(soundFile));
  currentAudio.loop = true;

  currentAudio.play().catch(error => {
    console.error("Error playing sound in offscreen document:", error);
  });

  setTimeout(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  }, duration * 1000);
}
