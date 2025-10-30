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
        showNotepad: true,
        notepadWidth: '500px',
        notepadHeight: '200px',

        timeFontFamily: 'Verdana',
        timeFontSize: '4.5',
        dateFontFamily: 'Arial',
        dateFontSize: '2.2',
        batteryFontFamily: 'Arial',
        batteryFontSize: '2.3',
        notepadFontFamily: 'Arial',
        notepadFontSize: '2.1'
    };

    let settings = { ...defaultSettings }; // Lokale cache voor instellingen

    // Functie om de zichtbaarheid en stijl van elementen toe te passen
    function applySettings() {
        const notepadArea = document.getElementById('notepad-area');

        // Zichtbaarheid
        datumElement.style.display = settings.showDate ? '' : 'none';
        batterijElement.style.display = settings.showBattery ? '' : 'none';
        notepadContainer.style.display = settings.showNotepad ? '' : 'none';

        // Notepad grootte
        if (notepadArea) {
            notepadArea.style.width = settings.notepadWidth;
            notepadArea.style.height = settings.notepadHeight;
        }

        // Lettertypes en -groottes
        tijdElement.style.fontFamily = settings.timeFontFamily;
        tijdElement.style.fontSize = `${settings.timeFontSize}em`;

        datumElement.style.fontFamily = settings.dateFontFamily;
        datumElement.style.fontSize = `${settings.dateFontSize}em`;

        batterijElement.style.fontFamily = settings.batteryFontFamily;
        batterijElement.style.fontSize = `${settings.batteryFontSize}em`;

        if (notepadArea) {
            notepadArea.style.fontFamily = settings.notepadFontFamily;
            notepadArea.style.fontSize = `${settings.notepadFontSize}em`;
        }
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
        applySettings();
        updateKlok(); // Eerste keer klok en datum correct instellen
        updateBatterijStatus();
        setInterval(updateKlok, 1000); // Start de klok-update loop
    }

    initialize();

    // --- Notepad Resize Listener ---
    const notepadArea = document.getElementById('notepad-area');
    if (notepadArea) {
        notepadArea.addEventListener('mouseup', () => {
            // Get computed style because inline style might not be set initially
            const style = window.getComputedStyle(notepadArea);
            const newWidth = style.width;
            const newHeight = style.height;

            chrome.storage.local.set({
                notepadWidth: newWidth,
                notepadHeight: newHeight
            });
            // Update local settings cache
            settings.notepadWidth = newWidth;
            settings.notepadHeight = newHeight;
        });
    }

    // --- Live Update Listener ---
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'setting-changed') {
            settings[request.key] = request.value;
            applySettings();
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
