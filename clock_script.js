document.addEventListener('DOMContentLoaded', () => {
    const tijdElement = document.getElementById('tijd');
    const datumElement = document.getElementById('datum');
    const batterijElement = document.getElementById('batterij-status');
    const notepadContainer = document.getElementById('notepad-container');

    // Definieer de standaardinstellingen
    const defaultSettings = {
        showSeconds: true,
        showDate: true,
        showDayName: true,
        showBattery: true,
        showNotepad: true
    };

    let settings = { ...defaultSettings }; // Lokale cache voor instellingen

    // Functie om de zichtbaarheid van elementen toe te passen
    function applyVisibilitySettings() {
        datumElement.style.display = settings.showDate ? '' : 'none';
        batterijElement.style.display = settings.showBattery ? '' : 'none';
        notepadContainer.style.display = settings.showNotepad ? '' : 'none';
    }

    async function updateKlok() {
        const nu = new Date();
        const uren = nu.getHours().toString().padStart(2, '0');
        const minuten = nu.getMinutes().toString().padStart(2, '0');
        let tijdString = `${uren}:${minuten}`;

        if (settings.showSeconds) {
            const seconden = nu.getSeconds().toString().padStart(2, '0');
            tijdString += `:${seconden}`;
        }
        tijdElement.textContent = tijdString;

        const optiesDatum = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: settings.showDayName ? 'long' : undefined
        };
        datumElement.textContent = nu.toLocaleDateString('en-US', optiesDatum);
    }

    async function updateBatterijStatus() {
        if (!settings.showBattery) return;
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                batterijElement.textContent = `${Math.floor(battery.level * 100)}%`;
                battery.addEventListener('levelchange', () => {
                    if (settings.showBattery) {
                        batterijElement.textContent = `${Math.floor(battery.level * 100)}%`;
                    }
                });
            } catch (error) {
                console.error('Fout bij ophalen batterijstatus:', error);
                batterijElement.style.display = 'none';
            }
        } else {
            console.log('Batterijstatus API niet ondersteund.');
            batterijElement.style.display = 'none';
        }
    }

    // --- Initialisatie ---
    async function initialize() {
        const storedSettings = await chrome.storage.local.get(defaultSettings);
        settings = storedSettings;
        applyVisibilitySettings();
        updateKlok(); // Eerste keer klok en datum correct instellen
        updateBatterijStatus();
        setInterval(updateKlok, 1000); // Start de klok-update loop
    }

    initialize();

    // --- Live Update Listener ---
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'setting-changed') {
            settings[request.key] = request.value;
            applyVisibilitySettings();
            updateKlok(); // Her-render de klok/datum met de nieuwe instelling
        }
    });

    // --- Instellingen Venster Knop ---
    const openInstellingenKnop = document.getElementById('open-instellingen-knop');
    if (openInstellingenKnop) {
        openInstellingenKnop.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'open-settings' });
        });
    }
});
