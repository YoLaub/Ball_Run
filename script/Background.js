
// Charger l'image de l'arrière-plan
const bgParis = new Image();
bgParis.src = "images/bg1.png"; // Remplace par le chemin de ton image
const bgNewYork = new Image();
bgNewYork.src = "images/bg2.png"; // Remplace par le chemin de ton image
const bgBresil = new Image();
bgBresil.src = "images/bg3.png"; // Remplace par le chemin de ton image
const bgJohannesburg = new Image();
bgJohannesburg.src = "images/bg4.jpg"; // Remplace par le chemin de ton image
const bgTokyo = new Image();
bgTokyo.src = "images/bg5.png"; // Remplace par le chemin de ton image
const bgMoscou = new Image();
bgMoscou.src = "images/bg6.png"; // Remplace par le chemin de ton image

const backgroundCity = {
    image: bgParis,
    bgX: 0,
    bgY: -100,
    width: canva.width,
    height: canva.height
}


export function drawScrollingBackground() {
  // Dessiner les deux images côte à côte

  
  context.drawImage(bgParis, bgX1, -100, canva.width, canva.height);
  context.drawImage(bgNewYork, bgX2, -100, canva.width, canva.height);
  context.drawImage(bgBresil, bgX3, -100, canva.width, canva.height);
  context.drawImage(bgJohannesburg, bgX4, -100, canva.width, canva.height);
  context.drawImage(bgTokyo, bgX5, -100, canva.width, canva.height);
  context.drawImage(bgMoscou, bgX6, -100, canva.width, canva.height);

  // Déplacer les images vers la gauche
  if (isSlow) {
    bgX1 -= 0; // Vitesse réduite si slow
    bgX2 -= 0;
  } else {
    bgX1 -= 0.1; // Vitesse légèrement plus lente pour simuler la distance
    bgX2 -= 0.1;
  }

  // Réinitialiser la position pour créer un défilement infini
  if (bgX1 + canva.width <= 0) {
    bgX1 = bgX2 + canva.width;
  }
  if (bgX2 + canva.width <= 0) {
    bgX2 = bgX1 + canva.width;
  }
}
