document.addEventListener('DOMContentLoaded', () => {
    // Definieer de standaardinstellingen
    const defaultSettings = {
        showSeconds: true,
        showDate: true,
        showDayName: true,
        showBattery: true,
        showNotepad: true
    };

    // Hulpfunctie om de huidige instellingen op te halen
    async function getSettings() {
        const settings = await chrome.storage.local.get(defaultSettings);
        return settings;
    }

    // Generieke functie om een instelling te togglen
    async function toggleSetting(key) {
        const currentSettings = await getSettings();
        const newValue = !currentSettings[key];

        // Sla de nieuwe waarde op
        await chrome.storage.local.set({ [key]: newValue });

        // Stuur een bericht naar alle extensie-onderdelen (inclusief het klokvenster)
        chrome.runtime.sendMessage({
            action: 'setting-changed',
            key: key,
            value: newValue
        });
    }

    // Voeg event listeners toe aan de knoppen
    document.getElementById('toggle-seconds-btn').addEventListener('click', () => toggleSetting('showSeconds'));
    document.getElementById('toggle-date-btn').addEventListener('click', () => toggleSetting('showDate'));
    document.getElementById('toggle-day-name-btn').addEventListener('click', () => toggleSetting('showDayName'));
    document.getElementById('toggle-battery-btn').addEventListener('click', () => toggleSetting('showBattery'));
    document.getElementById('toggle-notepad-btn').addEventListener('click', () => toggleSetting('showNotepad'));

    console.log("Instellingenscript geladen en listeners zijn ingesteld.");
});
