// Initialiser l'AudioContext et l'analyser
var analyser;
var dataArray;
var audioContext;
var audioSource;

// Charger la musique de fond et configurer l'analyser
export function initializeAudio(backgroundMusicElement) {

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!audioSource) {
        audioSource = audioContext.createMediaElementSource(backgroundMusicElement);
        console.log(audioSource)
        analyser = audioContext.createAnalyser();

        // Connecter les nœuds
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 512; // Résolution moyenne
        analyser.minDecibels = -90;
        analyser.maxDecibels = 10;
        analyser.smoothingTimeConstant = 0.85;
        // Taille pour analyser les fréquences.
        console.log(analyser)

        // Tableau pour stocker les données audio
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        console.log('Données audio :', dataArray);
        backgroundMusicElement.play();

    }
}

// Détection des beats
export function detectBeats(callback) {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    const threshold = 100; // Seuil pour détecter un beat
    let beatDetected = false;
    console.log(dataArray)

    // Analyser les basses fréquences
    for (let i = 0; i < dataArray.length / 4; i++) {
        if (dataArray[i] > threshold) {
            beatDetected = true;
            break;
        }
    }

    // Appeler le callback si un beat est détecté
    if (beatDetected) {
        callback();
    }

    // Appeler la fonction à chaque frame
    requestAnimationFrame(() => detectBeats(callback));
}
