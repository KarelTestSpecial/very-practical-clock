document.addEventListener('DOMContentLoaded', () => {
    const tijdElement = document.getElementById('tijd');
    const datumElement = document.getElementById('datum');
    const batterijElement = document.getElementById('batterij-status');

    function updateKlok() {
        const nu = new Date();

        // Tijd instellen (HH:MM)
        const uren = nu.getHours().toString().padStart(2, '0');
        const minuten = nu.getMinutes().toString().padStart(2, '0');
        tijdElement.textContent = `${uren}:${minuten}`;

        // Datum instellen
        const optiesDatum = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        datumElement.textContent = nu.toLocaleDateString('en-US', optiesDatum);
    }

    async function updateBatterijStatus() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                batterijElement.textContent = `${Math.floor(battery.level * 100)}%`;
                battery.addEventListener('levelchange', () => {
                    batterijElement.textContent = `${Math.floor(battery.level * 100)}%`;
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

    // Initial calls
    updateKlok();
    updateBatterijStatus();

    // Update de klok elke seconde
    setInterval(updateKlok, 1000);
});
