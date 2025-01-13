// Initialiser l'AudioContext et l'analyser
var analyser;
var dataArray;
var audioContext;
var audioSource;
var audioElement;

// Charger la musique de fond et configurer l'analyser
export function initializeAudio() {

    if (!audioContext && !audioSource) {

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioElement = document.querySelector('audio');
        audioSource = audioContext.createMediaElementSource(audioElement);
        analyser = audioContext.createAnalyser();

        // Connecter les nœuds
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256; // Résolution moyenne

        // Tableau pour stocker les données audio
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        console.log('Données audio :', dataArray);
        console.log("ho")
        audioElement.play();

    }
}

// Détection des beats
export function detectBeats(callback) {
    if (!analyser) 
        {console.log("HeyHo") 
            return;

        }

        console.log("HIHI")

    analyser.getByteFrequencyData(dataArray);
    

    const threshold = 120; // Seuil pour détecter un beat
    let beatDetected = false;
    

    // Analyser les basses fréquences
    for (let i = 0; i < dataArray.length / 4; i++) {
        if (dataArray[i] === threshold) {
            beatDetected = true;
            break;
        }
    }

    // Appeler le callback si un beat est détecté
    if (beatDetected) {
        callback();
        console.log('Données audio :', dataArray)
    }

   }
