// Houd een referentie naar het venster bij, zodat we het kunnen sluiten als het al open is
let klokWindowId = null;

chrome.action.onClicked.addListener(async (tab) => {
  if (klokWindowId !== null) {
    try {
      await chrome.windows.update(klokWindowId, { focused: true });
      return;
    } catch (e) {
      console.warn("Kon bestaand venster niet updaten (mogelijk al gesloten):", e.message);
      klokWindowId = null;
    }
  }

  // Standaardafmetingen voor het geval er nog niets is opgeslagen
  const defaultWidth = 220;
  const defaultHeight = 120;

  // Haal de opgeslagen venstergrootte op
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

  chrome.windows.create({
    url: chrome.runtime.getURL("clock_window.html"),
    type: "popup",
    width: windowWidth,   // Gebruik de opgeslagen of standaard breedte
    height: windowHeight, // Gebruik de opgeslagen of standaard hoogte
    left: Math.max(0, screenWidth - windowWidth - 20),
    top: Math.max(0, screenHeight - windowHeight - 20),
    focused: true,
    setSelfAsOpener: false
  }, (window) => {
    if (chrome.runtime.lastError) {
      console.error("Fout bij het maken van het venster:", chrome.runtime.lastError.message);
      klokWindowId = null;
      return;
    }
    if (window) {
      klokWindowId = window.id;
      console.log("Klokvenster succesvol gemaakt met ID:", klokWindowId);
    } else {
      console.error("Venster object niet ontvangen na creatie zonder error.");
      klokWindowId = null;
    }
  });
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === klokWindowId) {
    klokWindowId = null;
    console.log("Klokvenster gesloten, ID gereset.");
  }
});