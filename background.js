let klokWindowId = null;
const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// --- Window Management ---
async function createClockWindow() {
  const defaultWidth = 320;
  const defaultHeight = 220;
  const { windowWidth, windowHeight } = await chrome.storage.local.get({ windowWidth: defaultWidth, windowHeight: defaultHeight });

  const screenInfo = await chrome.system.display.getInfo();
  const primaryDisplay = screenInfo.find(display => display.isPrimary) || screenInfo[0];
  if (!primaryDisplay) {
    console.error("No display information found.");
    return null;
  }
  const screenWidth = primaryDisplay.bounds.width;
  const screenHeight = primaryDisplay.bounds.height;

  try {
    const window = await chrome.windows.create({
      url: chrome.runtime.getURL("clock_window.html"),
      type: "popup",
      width: windowWidth,
      height: windowHeight,
      left: Math.max(0, screenWidth - windowWidth - 20),
      top: Math.max(0, screenHeight - windowHeight - 20),
      focused: true,
    });
    klokWindowId = window.id;
    return window;
  } catch (error) {
    console.error("Error creating window:", error.message);
    klokWindowId = null;
    return null;
  }
}

chrome.action.onClicked.addListener(async () => {
  if (klokWindowId !== null) {
    try {
      await chrome.windows.remove(klokWindowId);
    } catch (e) {
      console.warn("Could not close window (already closed?):", e.message);
      klokWindowId = null;
      await createClockWindow();
    }
  } else {
    await createClockWindow();
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === klokWindowId) {
    klokWindowId = null;
  }
});


// --- Alarm Functionality ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'set-alarm') {
    chrome.alarms.create(request.alarmName, { when: request.when });
    sendResponse({ status: "Alarm set" });
  } else if (request.action === 'clear-alarm') {
    chrome.alarms.clear(request.alarmName);
    sendResponse({ status: "Alarm cleared" });
  }
  return true;
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  // 1. Bring clock window to front
  if (klokWindowId !== null) {
    try {
      await chrome.windows.update(klokWindowId, { focused: true });
    } catch (e) {
      await createClockWindow();
    }
  } else {
    await createClockWindow();
  }

  // 2. Play sound via offscreen document
  const alarmSettingsKey = alarm.name === 'alarm-1' ? 'alarm1Settings' : 'alarm2Settings';
  const { [alarmSettingsKey]: settings } = await chrome.storage.local.get(alarmSettingsKey);

  if (settings && settings.enabled) {
    await playSoundOffscreen(settings.sound, settings.duration);
  }
});


// --- Offscreen Document Audio Playback ---
async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const matchedClients = await clients.matchAll();
  return matchedClients.some(c => c.url === offscreenUrl);
}

async function playSoundOffscreen(sound, duration) {
  const offscreenDocumentExists = await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  if (!offscreenDocumentExists) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'To play alarm sounds reliably in the background.',
    });
  }

  chrome.runtime.sendMessage({
    target: 'offscreen',
    action: 'play-alarm-sound',
    sound: sound,
    duration: duration
  });
}
