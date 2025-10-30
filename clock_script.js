/*

// Globale DOM Element Referenties (na DOMContentLoaded)
let tijdElement, datumElement, batterijStatusElement, klokContainer, notepadContainer, notepadArea, toonInstellingenKnop;

// Globale status-variabelen
let toonSeconden, toonBatterij;

// Standaardinstellingen (vereenvoudigd, enkel wat de klok zelf nodig heeft)
const standaardInstellingen = {
    toonSeconden: false,
    toonBatterij: true,
    showDayOfWeek: true,
    fontTijd: 'Verdana, sans-serif',
    grootteTijd: 4.0,
    paddingOnderTijd: 0,
    paddingBovenTijd: 0,
    kleurTijd: '#39FF14',
    fontDatum: 'Arial, sans-serif',
    grootteDatum: 1.2,
    paddingOnderDatum: 0,
    kleurDatum: '#B0B0B0',
    fontBatterij: 'Arial, sans-serif',
    grootteBatterij: 1.2,
    breedteBatterij: 1.0,
    paddingOnderBatterij: 0,
    kleurBatterij: '#B0B0B0',
    achtergrondKleur: '#000000',
    klokPositie: 'top-center',
    isDatumVisible: true,
    notepadContent: '',
    isNotepadVisible: true,
    notepadTextAlign: 'center',
    fontNotepad: 'Arial, sans-serif',
    grootteNotepad: 1.5,
    notepadHeight: null
};

// --- DOM Initialisatie ---
function initializeDOMReferences() {
    tijdElement = document.getElementById('tijd');
    datumElement = document.getElementById('datum');
    batterijStatusElement = document.getElementById('batterij-status');
    klokContainer = document.getElementById('klok-container');
    toonInstellingenKnop = document.getElementById('toon-instellingen');
    notepadContainer = document.getElementById('notepad-container');
    notepadArea = document.getElementById('notepad-area');
}

// --- Vertalingen Toepassen ---
function applyTranslations() {
    document.documentElement.lang = chrome.i18n.getUILanguage().split('-')[0];
    document.getElementById('htmlPageTitle').textContent = chrome.i18n.getMessage('htmlPageTitle');
    if (toonInstellingenKnop) toonInstellingenKnop.textContent = chrome.i18n.getMessage('toggleSettingsText');
    if (notepadArea) notepadArea.placeholder = chrome.i18n.getMessage('notepadPlaceholder');
}


// --- Layout en Stijlen Toepassen ---
function setKlokLayout(positie) {
    document.body.className = ''; // Clear all classes
    const finalPositie = positie || standaardInstellingen.klokPositie;
    document.body.classList.add(`position-${finalPositie}`);
}

function applyStyling(settings) {
    // Check for each element before applying styles
    if (document.body) document.body.style.backgroundColor = settings.achtergrondKleur;
    toonSeconden = settings.toonSeconden;
    toonBatterij = settings.toonBatterij;

    if (tijdElement) {
        tijdElement.style.fontFamily = settings.fontTijd;
        tijdElement.style.color = settings.kleurTijd;
        tijdElement.style.fontSize = settings.grootteTijd + 'em';
        tijdElement.style.paddingBottom = settings.paddingOnderTijd + 'px';
        tijdElement.style.paddingTop = settings.paddingBovenTijd + 'px';
    }
    if (datumElement) {
        datumElement.style.fontFamily = settings.fontDatum;
        datumElement.style.color = settings.kleurDatum;
        datumElement.style.fontSize = settings.grootteDatum + 'em';
        datumElement.style.paddingBottom = settings.paddingOnderDatum + 'px';
    }
    if (batterijStatusElement) {
        batterijStatusElement.style.fontFamily = settings.fontBatterij;
        batterijStatusElement.style.color = settings.kleurBatterij;
        batterijStatusElement.style.fontSize = settings.grootteBatterij + 'em';
        batterijStatusElement.style.paddingBottom = settings.paddingOnderBatterij + 'px';
        batterijStatusElement.style.transform = `scaleX(${settings.breedteBatterij})`;
    }
    if (notepadArea) {
        notepadArea.value = settings.notepadContent;
        notepadArea.style.textAlign = settings.notepadTextAlign;
        notepadArea.style.fontFamily = settings.fontNotepad;
        notepadArea.style.fontSize = settings.grootteNotepad + 'em';
         if (settings.notepadHeight && Math.abs(notepadArea.offsetHeight - settings.notepadHeight) > 2) {
             notepadArea.style.height = `${settings.notepadHeight}px`;
         }
    }

    setKlokLayout(settings.klokPositie);
    applyDatumVisibility(settings.isDatumVisible);
    applyBatteryVisibility(settings.toonBatterij);
    applyNotepadVisibility(settings.isNotepadVisible);
}

function applyDatumVisibility(isVisible) {
    if (datumElement) datumElement.style.display = isVisible ? 'block' : 'none';
}

function applyBatteryVisibility(isVisible) {
    if (batterijStatusElement) batterijStatusElement.style.display = isVisible ? 'block' : 'none';
}

function applyNotepadVisibility(isVisible) {
     if (notepadContainer) notepadContainer.classList.toggle('hidden', !isVisible);
}


// --- Data Laden en Opslaan ---
async function laadInstellingen() {
    const opgeslagenInstellingen = await chrome.storage.local.get(standaardInstellingen);
    applyStyling(opgeslagenInstellingen);
}

async function saveNotepadContent() {
    if (notepadArea) await chrome.storage.local.set({ notepadContent: notepadArea.value });
}


// --- Klok en Batterij Updates ---
async function updateKlok() {
    if (!tijdElement || !datumElement) return;
    if (toonBatterij) updateBatteryStatus();

    const nu = new Date();
    let uren = nu.getHours().toString().padStart(2, '0');
    let minuten = nu.getMinutes().toString().padStart(2, '0');
    let tijdString = `${uren}:${minuten}`;

    if (toonSeconden) {
        tijdString += `:${nu.getSeconds().toString().padStart(2, '0')}`;
    }
    tijdElement.textContent = tijdString;

    const { showDayOfWeek } = await chrome.storage.local.get({ showDayOfWeek: standaardInstellingen.showDayOfWeek });

    const currentLocale = chrome.i18n.getMessage('dateLocale') || 'en-US';
    const optiesDatum = { year: 'numeric', month: 'long', day: 'numeric' };
    if (showDayOfWeek) {
        optiesDatum.weekday = 'long';
    }
    datumElement.textContent = nu.toLocaleDateString(currentLocale, optiesDatum);
}

async function updateBatteryStatus() {
    if (!navigator.getBattery) {
        if(batterijStatusElement) batterijStatusElement.style.display = 'none';
        return;
    }
    try {
        const battery = await navigator.getBattery();
        if (batterijStatusElement) {
           batterijStatusElement.textContent = `${Math.floor(battery.level * 100)}%`;
        }
    } catch (error) {
        console.error('Error getting battery status:', error);
        if(batterijStatusElement) batterijStatusElement.style.display = 'none';
    }
}


// --- Event Listeners ---
function setupEventListeners() {
    if (toonInstellingenKnop) {
        toonInstellingenKnop.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'open-settings' });
        });
    }

    if (notepadArea) {
        notepadArea.addEventListener('input', saveNotepadContent);

        let resizeTimeout;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                chrome.storage.local.set({ notepadHeight: notepadArea.offsetHeight });
            }, 500);
        });
        resizeObserver.observe(notepadArea);
    }

    // Luister naar wijzigingen in de opslag en pas de instellingen live toe
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            laadInstellingen();
        }
    });
    
    // Luister naar alarm-berichten van de background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'alarm-triggered') {
            document.body.classList.add('alarm-active');
            setTimeout(() => {
                document.body.classList.remove('alarm-active');
            }, 3000); // Duur van de visuele indicatie
        }
    });
}

// --- Initialisatie ---
async function initializeClock() {
    initializeDOMReferences();
    applyTranslations();
    await laadInstellingen();
    document.body.style.visibility = 'visible'; // Maak de body zichtbaar na het laden van de instellingen
    await updateKlok(); // Eerste klok-update
    setupEventListeners();
    setInterval(updateKlok, 1000); // Start de klok-interval
}

document.addEventListener('DOMContentLoaded', initializeClock);

*/
