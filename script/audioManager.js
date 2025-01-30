// Initialiser l'AudioContext et l'analyser
var analyser;
var dataArray;
var audioContext;
var audioSource;
var audioElement;

// Charger la musique de fond et configurer l'analyser
export function initializeAudio(backgroundMusic) {

    if (!audioContext && !audioSource) {

        backgroundMusic.play();
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioElement = backgroundMusic;
        audioSource = audioContext.createMediaElementSource(audioElement);
        analyser = audioContext.createAnalyser();

        // Connecter les nœuds
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 128; // Résolution moyenne

        // Tableau pour stocker les données audio
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        console.log('Données audio :', dataArray);
              
    }
    backgroundMusic.play();
}

// Détection des beats
export function detectBeats(callback) {
    if (!analyser) 
        { 
            return;
        }
    analyser.getByteFrequencyData(dataArray);
    

    const threshold = 220; // Seuil pour détecter un beat
    let beatDetected = false;
    

    // Analyser les basses fréquences
    for (let i = 0; i < Math.floor(dataArray.length/10); i+=2) {
        if (dataArray[i] >= 200 && dataArray[i] <= threshold) {
            beatDetected = true;
            break;
        }
    }

    // Appeler le callback si un beat est détecté
    if (beatDetected) {
        callback();
    }

   }

   export function getCurrentFrequency(){
    let currentFrequency = dataArray[0];
    return currentFrequency
   }

   export function drawB(context,canvas) {
    
    analyser.getByteFrequencyData(dataArray);
        
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    dataArray.forEach(value => {
      const barHeight = value;
      context.fillStyle = `grey`;
      context.fillRect(x, 300 - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    });
  }

 
