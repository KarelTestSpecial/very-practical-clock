console.log("Offscreen script loaded.");

const audioPlayer = document.getElementById('alarm-audio-player');
let stopTimer = null;

if (!audioPlayer) {
    console.error("Audio player element not found in offscreen document.");
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.target !== 'offscreen') return;

  console.log("Offscreen document received message:", message);

  if (message.action === 'play-alarm-sound') {
    // Stop any currently playing sound and clear any existing timer
    if (stopTimer) {
      console.log("Clearing previous stop timer.");
      clearTimeout(stopTimer);
    }
    audioPlayer.pause();
    console.log("Audio paused.");

    // Set the new sound source and play it
    const soundFile = `sounds/${message.sound}.mp3`;
    audioPlayer.src = chrome.runtime.getURL(soundFile);
    audioPlayer.loop = true;
    console.log(`Attempting to play sound: ${audioPlayer.src}`);

    audioPlayer.play()
      .then(() => console.log("Audio playback started successfully."))
      .catch(e => console.error("Audio play failed:", e));

    // Set a timer to stop the sound after the specified duration
    console.log(`Setting timer to stop sound in ${message.duration} seconds.`);
    stopTimer = setTimeout(() => {
      console.log("Stop timer elapsed. Pausing audio.");
      audioPlayer.pause();
      audioPlayer.src = ''; // Clear the source
      stopTimer = null;
    }, message.duration * 1000);
  }
  return true;
});

// Signal that the offscreen document is ready to receive messages.
console.log("Sending 'offscreen-ready' message to service worker.");
chrome.runtime.sendMessage({ action: 'offscreen-ready' });
