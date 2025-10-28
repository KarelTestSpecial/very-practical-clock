let klokWindowId = null;

// Functie om het klokvenster te maken, herbruikbaar voor de alarmen
async function createClockWindow() {
  const defaultWidth = 320; // Iets breder voor de nieuwe layout
  const defaultHeight = 220;
  const { windowWidth, windowHeight } = await chrome.storage.local.get({
    windowWidth: defaultWidth,
    windowHeight: defaultHeight
  });

  const screenInfo = await chrome.system.display.getInfo();
  const primaryDisplay = screenInfo.find(display => display.isPrimary) || screenInfo[0];
  if (!primaryDisplay) {
    console.error("Geen display informatie gevonden.");
    return;
  }
  const screenWidth = primaryDisplay.bounds.width;
  const screenHeight = primaryDisplay.bounds.height;

  return new Promise((resolve) => {
    chrome.windows.create({
      url: chrome.runtime.getURL("clock_window.html"),
      type: "popup",
      width: windowWidth,
      height: windowHeight,
      left: Math.max(0, screenWidth - windowWidth - 20),
      top: Math.max(0, screenHeight - windowHeight - 20),
      focused: true,
    }, (window) => {
      if (chrome.runtime.lastError) {
        console.error("Fout bij het maken van het venster:", chrome.runtime.lastError.message);
        klokWindowId = null;
        resolve(null);
      } else if (window) {
        klokWindowId = window.id;
        resolve(window);
      } else {
        klokWindowId = null;
        resolve(null);
      }
    });
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (klokWindowId !== null) {
    try {
      await chrome.windows.remove(klokWindowId);
      // De onRemoved listener zal klokWindowId resetten.
    } catch (e) {
      console.warn("Kon venster niet sluiten (mogelijk al gesloten):", e.message);
      klokWindowId = null; // Reset voor de zekerheid
      await createClockWindow(); // Maak een nieuw venster
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

// --- Alarm Functionaliteit ---

// Luister naar berichten van de clock_script om alarmen in te stellen of te verwijderen
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'set-alarm') {
    // periodInMinutes is niet nodig voor dagelijkse alarmen, 'when' is genoeg.
    // Voor een dagelijks alarm, moet het script in de clock window het alarm opnieuw instellen voor de volgende dag.
    chrome.alarms.create(request.alarmName, { when: request.when });
  } else if (request.action === 'clear-alarm') {
    chrome.alarms.clear(request.alarmName);
  }
});

// Luister naar wanneer een alarm afgaat
chrome.alarms.onAlarm.addListener(async (alarm) => {
  let window;
  if (klokWindowId !== null) {
    try {
      window = await chrome.windows.get(klokWindowId, { populate: true });
      await chrome.windows.update(klokWindowId, { focused: true });
    } catch (e) {
      // Venster was waarschijnlijk gesloten, maak een nieuwe
      window = await createClockWindow();
    }
  } else {
    window = await createClockWindow();
  }

  // Stuur een bericht naar het venster om het geluid af te spelen
  if (window && window.tabs && window.tabs.length > 0) {
    // Wacht even om zeker te zijn dat de content script geladen is, vooral bij een nieuw venster
    setTimeout(() => {
        chrome.tabs.sendMessage(window.tabs[0].id, {
            action: 'play-alarm-sound',
            alarmName: alarm.name
        });
    }, 500);
  }
});