document.addEventListener('DOMContentLoaded', () => {
    // Definieer de standaardinstellingen
    const defaultSettings = {
        showSeconds: true,
        showDate: true,
        showDayName: true,
        showBattery: true,
        showNotepad: true,

        timeFontFamily: 'Verdana',
        timeFontSize: '4.5',
        dateFontFamily: 'Arial',
        dateFontSize: '2.2',
        batteryFontFamily: 'Arial',
        batteryFontSize: '2.3',
        notepadFontFamily: 'Arial',
        notepadFontSize: '2.1',

        timeColor: '#39FF14',
        dateColor: '#B0B0B0',
        batteryColor: '#B0B0B0',
        backgroundColor: '#000000'
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

    // --- Initialiseer UI met opgeslagen waarden ---
    async function initializeUI() {
        const settings = await getSettings();

        // Font families
        document.getElementById('time-font-family').value = settings.timeFontFamily;
        document.getElementById('date-font-family').value = settings.dateFontFamily;
        document.getElementById('battery-font-family').value = settings.batteryFontFamily;
        document.getElementById('notepad-font-family').value = settings.notepadFontFamily;

        // Font sizes
        document.getElementById('time-font-size').value = settings.timeFontSize;
        document.getElementById('date-font-size').value = settings.dateFontSize;
        document.getElementById('battery-font-size').value = settings.batteryFontSize;
        document.getElementById('notepad-font-size').value = settings.notepadFontSize;

        // Update labels
        updateFontSizeLabel('time-font-size-label', settings.timeFontSize);
        updateFontSizeLabel('date-font-size-label', settings.dateFontSize);
        updateFontSizeLabel('battery-font-size-label', settings.batteryFontSize);
        updateFontSizeLabel('notepad-font-size-label', settings.notepadFontSize);

        // Colors
        document.getElementById('time-color').value = settings.timeColor;
        document.getElementById('date-color').value = settings.dateColor;
        document.getElementById('battery-color').value = settings.batteryColor;
        document.getElementById('background-color').value = settings.backgroundColor;
    }

    function updateFontSizeLabel(labelId, value) {
        const label = document.getElementById(labelId);
        if (label) {
            // Vervang de numerieke waarde in de tekst van het label
            label.textContent = label.textContent.replace(/[\d.]+em/, `${value}em`);
        }
    }

    // --- Generieke functie voor stijl-instellingen ---
    async function handleStyleChange(key, value) {
        await chrome.storage.local.set({ [key]: value });
        chrome.runtime.sendMessage({
            action: 'setting-changed',
            key: key,
            value: value
        });
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Toggle Knoppen
        document.getElementById('toggle-seconds-btn').addEventListener('click', () => toggleSetting('showSeconds'));
        document.getElementById('toggle-date-btn').addEventListener('click', () => toggleSetting('showDate'));
        document.getElementById('toggle-day-name-btn').addEventListener('click', () => toggleSetting('showDayName'));
        document.getElementById('toggle-battery-btn').addEventListener('click', () => toggleSetting('showBattery'));
        document.getElementById('toggle-notepad-btn').addEventListener('click', () => toggleSetting('showNotepad'));

        // Font Family Selects
        document.getElementById('time-font-family').addEventListener('change', (e) => handleStyleChange('timeFontFamily', e.target.value));
        document.getElementById('date-font-family').addEventListener('change', (e) => handleStyleChange('dateFontFamily', e.target.value));
        document.getElementById('battery-font-family').addEventListener('change', (e) => handleStyleChange('batteryFontFamily', e.target.value));
        document.getElementById('notepad-font-family').addEventListener('change', (e) => handleStyleChange('notepadFontFamily', e.target.value));

        // Font Size Ranges
        document.getElementById('time-font-size').addEventListener('input', (e) => {
            handleStyleChange('timeFontSize', e.target.value);
            updateFontSizeLabel('time-font-size-label', e.target.value);
        });
        document.getElementById('date-font-size').addEventListener('input', (e) => {
            handleStyleChange('dateFontSize', e.target.value);
            updateFontSizeLabel('date-font-size-label', e.target.value);
        });
        document.getElementById('battery-font-size').addEventListener('input', (e) => {
            handleStyleChange('batteryFontSize', e.target.value);
            updateFontSizeLabel('battery-font-size-label', e.target.value);
        });
        document.getElementById('notepad-font-size').addEventListener('input', (e) => {
            handleStyleChange('notepadFontSize', e.target.value);
            updateFontSizeLabel('notepad-font-size-label', e.target.value);
        });

        // Color Inputs
        document.getElementById('time-color').addEventListener('input', (e) => handleStyleChange('timeColor', e.target.value));
        document.getElementById('date-color').addEventListener('input', (e) => handleStyleChange('dateColor', e.target.value));
        document.getElementById('battery-color').addEventListener('input', (e) => handleStyleChange('batteryColor', e.target.value));
        document.getElementById('background-color').addEventListener('input', (e) => handleStyleChange('backgroundColor', e.target.value));
    }

    // Initialiseer alles
    initializeUI();
    setupEventListeners();
    console.log("Instellingenscript geladen, UI geïnitialiseerd en listeners zijn ingesteld.");
});
