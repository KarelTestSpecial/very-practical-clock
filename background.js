const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// --- Window Management ---

// Helper to find an existing clock window
async function findClockWindow() {
    const windows = await chrome.windows.getAll({ populate: true });
    const clockWindowUrl = chrome.runtime.getURL("clock_window.html");
    for (const window of windows) {
        if (window.tabs && window.tabs.some(tab => tab.url === clockWindowUrl)) {
            return window;
        }
    }
    return null;
}

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
    return await chrome.windows.create({
      url: chrome.runtime.getURL("clock_window.html"),
      type: "popup",
      width: windowWidth,
      height: windowHeight,
      left: Math.max(0, screenWidth - windowWidth - 20),
      top: Math.max(0, screenHeight - windowHeight - 20),
      focused: true,
    });
  } catch (error) {
    console.error("Error creating window:", error.message);
    return null;
  }
}

chrome.action.onClicked.addListener(async () => {
    const existingWindow = await findClockWindow();
    if (existingWindow) {
        try {
            await chrome.windows.remove(existingWindow.id);
        } catch (e) {
            console.warn("Could not close window (already closed?):", e.message);
        }
    } else {
        await createClockWindow();
    }
});


// --- Alarm Functionality ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'set-alarm') {
        chrome.alarms.create(request.alarmName, { when: request.when });
        sendResponse({ status: "Alarm set" });
        return false; // No async response needed
    } else if (request.action === 'clear-alarm') {
        chrome.alarms.clear(request.alarmName);
        sendResponse({ status: "Alarm cleared" });
        return false; // No async response needed
    } else if (request.action === 'test-alarm') {
        triggerAlarmEffects(request.alarmName).then(() => {
            sendResponse({ status: "Test alarm triggered" });
        });
        return true; // Async response will be sent
    }
    // Let other listeners handle messages like 'offscreen-ready'
    return false;
});


chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log(`Alarm "${alarm.name}" triggered.`);
    triggerAlarmEffects(alarm.name);
});

async function triggerAlarmEffects(alarmName) {
    console.log(`Triggering effects for alarm: ${alarmName}`);
    // 1. Bring clock window to front and show visual indicator
    const existingWindow = await findClockWindow();
    let windowToFocus = existingWindow;
    if (!windowToFocus) {
        windowToFocus = await createClockWindow();
    }
    if (windowToFocus) {
        await chrome.windows.update(windowToFocus.id, { focused: true });
        // Send message to the content script in the clock window
        const tabs = await chrome.tabs.query({ windowId: windowToFocus.id });
        const clockTab = tabs.find(tab => tab.url.includes("clock_window.html"));
        if (clockTab) {
             chrome.tabs.sendMessage(clockTab.id, { action: 'alarm-triggered' });
        }
    }


    // 2. Play sound via offscreen document
    const alarmSettingsKey = alarmName === 'alarm-1' ? 'alarm1Settings' : 'alarm2Settings';
    const { [alarmSettingsKey]: settings } = await chrome.storage.local.get(alarmSettingsKey);
    const { alarmSoundEnabled } = await chrome.storage.local.get({ alarmSoundEnabled: true });


    if (settings && settings.enabled && alarmSoundEnabled) {
        console.log(`Settings found for ${alarmName}. Playing sound: ${settings.sound}`);
        await playSoundOffscreen(settings.sound, settings.duration);
    } else {
        console.log(`Sound for ${alarmName} is disabled or settings not found.`);
    }
}


// --- Offscreen Document Audio Playback ---
let creatingOffscreenDocument = null; // Promise to prevent race conditions

async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const matchedClients = await clients.matchAll();
  return matchedClients.some(c => c.url === offscreenUrl);
}

async function playSoundOffscreen(sound, duration) {
    console.log("playSoundOffscreen called.");
    if (await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH)) {
        console.log("Offscreen document exists. Sending play message.");
        chrome.runtime.sendMessage({
            target: 'offscreen',
            action: 'play-alarm-sound',
            sound: sound,
            duration: duration
        });
        return;
    }

    if (creatingOffscreenDocument) {
        console.log("Offscreen document is already being created. Waiting...");
        await creatingOffscreenDocument;
    } else {
        console.log("Creating new offscreen document.");
        creatingOffscreenDocument = new Promise((resolve, reject) => {
            const readyListener = (message) => {
                if (message.action === 'offscreen-ready') {
                    console.log("Offscreen document ready signal received.");
                    chrome.runtime.onMessage.removeListener(readyListener);
                    resolve();
                }
            };
            chrome.runtime.onMessage.addListener(readyListener);
            chrome.offscreen.createDocument({
                url: OFFSCREEN_DOCUMENT_PATH,
                reasons: ['AUDIO_PLAYBACK'],
                justification: 'To play alarm sounds reliably in the background.',
            }).catch(error => {
                 console.error("Error creating offscreen document:", error);
                 chrome.runtime.onMessage.removeListener(readyListener);
                 reject(error);
            });
        });

        try {
            await creatingOffscreenDocument;
        } finally {
            creatingOffscreenDocument = null;
        }
    }

    console.log("Offscreen document is ready. Sending play message.");
    chrome.runtime.sendMessage({
        target: 'offscreen',
        action: 'play-alarm-sound',
        sound: sound,
        duration: duration
    });
}
