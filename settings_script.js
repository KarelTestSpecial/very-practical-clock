
// Globale DOM Element Referenties
let domRefs = {};

// Standaardinstellingen (één bron van waarheid)
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
    notepadHeight: null,
    alarm1Settings: {
        enabled: false,
        time: '08:00',
        sound: 'digital',
        duration: 10
    },
    alarm2Settings: {
        enabled: false,
        time: '18:00',
        sound: 'bell',
        duration: 5
    }
};

function initializeDOMReferences() {
    // Knoppen
    domRefs.toggleSecondenKnop = document.getElementById('toggle-seconden');
    domRefs.toggleDatumKnop = document.getElementById('toggle-datum');
    domRefs.toggleDagNaamKnop = document.getElementById('toggle-dag-naam');
    domRefs.toggleNotepadKnop = document.getElementById('toggle-notepad');
    domRefs.toggleBatterijKnop = document.getElementById('toggle-batterij');
    domRefs.bewaarFavorietKnop = document.getElementById('bewaar-favoriet');
    domRefs.herstelStandaardKnop = document.getElementById('herstel-standaard');
    domRefs.herstelFavorietKnop = document.getElementById('herstel-favoriet');

    // Tijd Instellingen
    domRefs.fontTijdInput = document.getElementById('font-tijd');
    domRefs.grootteTijdInput = document.getElementById('grootte-tijd');
    domRefs.weergaveGrootteTijd = document.getElementById('weergave-grootte-tijd');
    domRefs.paddingOnderTijdInput = document.getElementById('padding-onder-tijd');
    domRefs.weergavePaddingOnderTijd = document.getElementById('weergave-padding-onder-tijd');
    domRefs.paddingBovenTijdInput = document.getElementById('padding-boven-tijd');
    domRefs.weergavePaddingBovenTijd = document.getElementById('weergave-padding-boven-tijd');
    domRefs.kleurTijdInput = document.getElementById('kleur-tijd');

    // Datum Instellingen
    domRefs.fontDatumInput = document.getElementById('font-datum');
    domRefs.grootteDatumInput = document.getElementById('grootte-datum');
    domRefs.weergaveGrootteDatum = document.getElementById('weergave-grootte-datum');
    domRefs.paddingOnderDatumInput = document.getElementById('padding-onder-datum');
    domRefs.weergavePaddingOnderDatum = document.getElementById('weergave-padding-onder-datum');
    domRefs.kleurDatumInput = document.getElementById('kleur-datum');

    // Batterij Instellingen
    domRefs.fontBatterijInput = document.getElementById('font-batterij');
    domRefs.kleurBatterijInput = document.getElementById('kleur-batterij');
    domRefs.grootteBatterijInput = document.getElementById('grootte-batterij');
    domRefs.weergaveGrootteBatterij = document.getElementById('weergave-grootte-batterij');
    domRefs.breedteBatterijInput = document.getElementById('breedte-batterij');
    domRefs.weergaveBreedteBatterij = document.getElementById('weergave-breedte-batterij');
    domRefs.paddingOnderBatterijInput = document.getElementById('padding-onder-batterij');
    domRefs.weergavePaddingOnderBatterij = document.getElementById('weergave-padding-onder-batterij');

    // Notepad & Algemeen
    domRefs.achtergrondKleurInput = document.getElementById('achtergrond-kleur');
    domRefs.klokPositieSelect = document.getElementById('klok-positie-select');
    domRefs.notepadTextAlignSelect = document.getElementById('notepad-text-align');
    domRefs.fontNotepadInput = document.getElementById('font-notepad');
    domRefs.grootteNotepadInput = document.getElementById('grootte-notepad');
    domRefs.weergaveGrootteNotepad = document.getElementById('weergave-grootte-notepad');

    // Alarmen
    for (let i = 1; i <= 2; i++) {
        domRefs[`alarmTijd${i}`] = document.getElementById(`alarm-tijd-${i}`);
        domRefs[`alarmToggle${i}`] = document.getElementById(`alarm-toggle-${i}`);
        domRefs[`alarmGeluid${i}`] = document.getElementById(`alarm-geluid-${i}`);
        domRefs[`alarmDuur${i}`] = document.getElementById(`alarm-duur-${i}`);
    }
}

function applyTranslations() {
    document.documentElement.lang = chrome.i18n.getUILanguage().split('-')[0];
    document.title = chrome.i18n.getMessage('settingsTitleText');
    domRefs.toggleSecondenKnop.textContent = chrome.i18n.getMessage('toggleSecondsText');
    domRefs.toggleBatterijKnop.textContent = chrome.i18n.getMessage('toggleBatteryText');
    domRefs.toggleDatumKnop.textContent = chrome.i18n.getMessage('toggleDateText');
    domRefs.toggleDagNaamKnop.textContent = chrome.i18n.getMessage('toggleDayOfWeekText');
    domRefs.toggleNotepadKnop.textContent = chrome.i18n.getMessage('toggleNotepadText');
    domRefs.bewaarFavorietKnop.textContent = chrome.i18n.getMessage('saveFavoritesText');
    domRefs.herstelStandaardKnop.textContent = chrome.i18n.getMessage('defaultSettingsText');
    domRefs.herstelFavorietKnop.textContent = chrome.i18n.getMessage('restoreFavoritesText');

    // Simple labels might need manual translation if they are not part of the DOM with specific IDs
    // For selects, options are often translated manually if not given IDs
    // This is a simplified example, more complex UIs might need IDs for all translatable elements
}


async function laadInstellingen() {
    const settings = await chrome.storage.local.get(standaardInstellingen);

    // General Toggles
    // These buttons don't have a visual state in the settings panel, they just trigger actions.

    // Time
    domRefs.fontTijdInput.value = settings.fontTijd;
    domRefs.grootteTijdInput.value = settings.grootteTijd;
    domRefs.weergaveGrootteTijd.textContent = settings.grootteTijd + 'em';
    domRefs.paddingOnderTijdInput.value = settings.paddingOnderTijd;
    domRefs.weergavePaddingOnderTijd.textContent = settings.paddingOnderTijd + 'px';
    domRefs.paddingBovenTijdInput.value = settings.paddingBovenTijd;
    domRefs.weergavePaddingBovenTijd.textContent = settings.paddingBovenTijd + 'px';
    domRefs.kleurTijdInput.value = settings.kleurTijd;

    // Date
    domRefs.fontDatumInput.value = settings.fontDatum;
    domRefs.grootteDatumInput.value = settings.grootteDatum;
    domRefs.weergaveGrootteDatum.textContent = settings.grootteDatum + 'em';
    domRefs.paddingOnderDatumInput.value = settings.paddingOnderDatum;
    domRefs.weergavePaddingOnderDatum.textContent = settings.paddingOnderDatum + 'px';
    domRefs.kleurDatumInput.value = settings.kleurDatum;

    // Battery
    domRefs.fontBatterijInput.value = settings.fontBatterij;
    domRefs.kleurBatterijInput.value = settings.kleurBatterij;
    domRefs.grootteBatterijInput.value = settings.grootteBatterij;
    domRefs.weergaveGrootteBatterij.textContent = settings.grootteBatterij + 'em';
    domRefs.breedteBatterijInput.value = settings.breedteBatterij;
    domRefs.weergaveBreedteBatterij.textContent = settings.breedteBatterij;
    domRefs.paddingOnderBatterijInput.value = settings.paddingOnderBatterij;
    domRefs.weergavePaddingOnderBatterij.textContent = settings.paddingOnderBatterij + 'px';

    // Notepad & General
    domRefs.achtergrondKleurInput.value = settings.achtergrondKleur;
    domRefs.klokPositieSelect.value = settings.klokPositie;
    domRefs.notepadTextAlignSelect.value = settings.notepadTextAlign;
    domRefs.fontNotepadInput.value = settings.fontNotepad;
    domRefs.grootteNotepadInput.value = settings.grootteNotepad;
    domRefs.weergaveGrootteNotepad.textContent = settings.grootteNotepad + 'em';

    // Alarms
    for (let i = 1; i <= 2; i++) {
        const alarmSettings = settings[`alarm${i}Settings`];
        domRefs[`alarmTijd${i}`].value = alarmSettings.time;
        domRefs[`alarmToggle${i}`].checked = alarmSettings.enabled;
        domRefs[`alarmGeluid${i}`].value = alarmSettings.sound;
        domRefs[`alarmDuur${i}`].value = alarmSettings.duration;
    }
}

async function saveAndApplySetting(key, value) {
     await chrome.storage.local.set({ [key]: value });
}

async function toggleSetting(key) {
    const currentSettings = await chrome.storage.local.get(key);
    const currentValue = currentSettings[key];
    await chrome.storage.local.set({ [key]: !currentValue });
}


async function saveAlarmSetting(alarmNum, key, value) {
    const alarmSettingsKey = `alarm${alarmNum}Settings`;
    const data = await chrome.storage.local.get(alarmSettingsKey);
    const existingSettings = data[alarmSettingsKey] || {};
    const completeSettings = { ...standaardInstellingen[alarmSettingsKey], ...existingSettings };
    const newSettings = { ...completeSettings, [key]: value };
    await chrome.storage.local.set({ [alarmSettingsKey]: newSettings });

    const alarmName = `alarm-${alarmNum}`;
    if (newSettings.enabled) {
        const [hours, minutes] = newSettings.time.split(':');
        const now = new Date();
        const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
        if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }
        chrome.runtime.sendMessage({ action: 'set-alarm', alarmName: alarmName, when: alarmTime.getTime() });
    } else {
        chrome.runtime.sendMessage({ action: 'clear-alarm', alarmName: alarmName });
    }
}


function setupEventListeners() {
    // Toggles
    domRefs.toggleSecondenKnop.addEventListener('click', () => toggleSetting('toonSeconden'));
    domRefs.toggleDatumKnop.addEventListener('click', () => toggleSetting('isDatumVisible'));
    domRefs.toggleDagNaamKnop.addEventListener('click', () => toggleSetting('showDayOfWeek'));
    domRefs.toggleBatterijKnop.addEventListener('click', () => toggleSetting('toonBatterij'));
    domRefs.toggleNotepadKnop.addEventListener('click', () => toggleSetting('isNotepadVisible'));

    // Inputs en Selects
    const inputs = [
        // Time
        { id: 'font-tijd', key: 'fontTijd' },
        { id: 'grootte-tijd', key: 'grootteTijd', isFloat: true, label: 'weergaveGrootteTijd', unit: 'em' },
        { id: 'padding-onder-tijd', key: 'paddingOnderTijd', isInt: true, label: 'weergavePaddingOnderTijd', unit: 'px' },
        { id: 'padding-boven-tijd', key: 'paddingBovenTijd', isInt: true, label: 'weergavePaddingBovenTijd', unit: 'px' },
        { id: 'kleur-tijd', key: 'kleurTijd' },
        // Date
        { id: 'font-datum', key: 'fontDatum' },
        { id: 'grootte-datum', key: 'grootteDatum', isFloat: true, label: 'weergaveGrootteDatum', unit: 'em' },
        { id: 'padding-onder-datum', key: 'paddingOnderDatum', isInt: true, label: 'weergavePaddingOnderDatum', unit: 'px' },
        { id: 'kleur-datum', key: 'kleurDatum' },
        // Battery
        { id: 'font-batterij', key: 'fontBatterij' },
        { id: 'kleur-batterij', key: 'kleurBatterij' },
        { id: 'grootte-batterij', key: 'grootteBatterij', isFloat: true, label: 'weergaveGrootteBatterij', unit: 'em' },
        { id: 'breedte-batterij', key: 'breedteBatterij', isFloat: true, label: 'weergaveBreedteBatterij' },
        { id: 'padding-onder-batterij', key: 'paddingOnderBatterij', isInt: true, label: 'weergavePaddingOnderBatterij', unit: 'px' },
        // Notepad & General
        { id: 'achtergrond-kleur', key: 'achtergrondKleur' },
        { id: 'klok-positie-select', key: 'klokPositie' },
        { id: 'notepad-text-align', key: 'notepadTextAlign' },
        { id: 'font-notepad', key: 'fontNotepad' },
        { id: 'grootte-notepad', key: 'grootteNotepad', isFloat: true, label: 'weergaveGrootteNotepad', unit: 'em' },
    ];

    inputs.forEach(({ id, key, isFloat, isInt, label, unit }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', (e) => {
                let value = e.target.value;
                if (isFloat) value = parseFloat(value);
                if (isInt) value = parseInt(value);
                saveAndApplySetting(key, value);
                if (label) {
                    const labelElement = document.getElementById(label);
                    if (labelElement) labelElement.textContent = value + (unit || '');
                }
            });
        }
    });

    // Alarmen
    for (let i = 1; i <= 2; i++) {
        domRefs[`alarmTijd${i}`].addEventListener('change', (e) => saveAlarmSetting(i, 'time', e.target.value));
        domRefs[`alarmToggle${i}`].addEventListener('change', (e) => saveAlarmSetting(i, 'enabled', e.target.checked));
        domRefs[`alarmGeluid${i}`].addEventListener('change', (e) => saveAlarmSetting(i, 'sound', e.target.value));
        domRefs[`alarmDuur${i}`].addEventListener('change', (e) => saveAlarmSetting(i, 'duration', parseInt(e.target.value)));
    }

    // Favorieten en Herstel
    domRefs.bewaarFavorietKnop.addEventListener('click', bewaarFavorieteInstellingen);
    domRefs.herstelStandaardKnop.addEventListener('click', herstelStandaardInstellingen);
    domRefs.herstelFavorietKnop.addEventListener('click', herstelFavorieteInstellingen);
}


async function bewaarFavorieteInstellingen() {
    const huidigeInstellingen = await chrome.storage.local.get(standaardInstellingen);
    await chrome.storage.local.set({ favorieteInstellingen: huidigeInstellingen });
    // showStatusMessage(chrome.i18n.getMessage('alertFavoriteSaved')); // Status message element does not exist here
    alert(chrome.i18n.getMessage('alertFavoriteSaved'));
}

async function herstelStandaardInstellingen() {
    await chrome.storage.local.set(standaardInstellingen);
    await laadInstellingen();
}

async function herstelFavorieteInstellingen() {
    const { favorieteInstellingen } = await chrome.storage.local.get('favorieteInstellingen');
    if (favorieteInstellingen) {
        await chrome.storage.local.set(favorieteInstellingen);
        await laadInstellingen();
        alert(chrome.i18n.getMessage('alertFavoriteRestored'));
    } else {
        alert(chrome.i18n.getMessage('alertNoFavoriteFound'));
    }
}


// --- Initialisatie ---
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMReferences();
    applyTranslations();
    laadInstellingen();
    setupEventListeners();
});
