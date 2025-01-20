import {
  initializeAudio,
  detectBeats,
  drawB,
  getCurrentFrequency,
} from "./audioManager.js";
import {getValueWeather } from "./meteoSource.js";
import {drawSnowflake} from "./assets.js";

var canva = document.getElementById("gameCanvas");
const context = canva.getContext("2d");

var modeTest = false;

//Gestion du score
var score = 0;
var scoreDisplay = 0;
var scoreTab = [];

//Debut de partie
var start = false;

//Fin de partie
var isGameOver = false;
var gameOver = 0;
var animationId = null;

// Variables pour gérer le message de fin
let messageFinActive = false;
let messageFinX = canva.width;
const messageFinText = "Fin";
const messageFinSpeed = 2;

//Gestion de la balle
var ballY = 290;
var velocityY = 0;
const gravity = 0.3;
const maxJumpPower = -15;
const jumpPower = -10;
const minJumpPower = -2;
const groundY = 300;
var isOnBlock = false;

/*
//Arrière plan
var backgrounds = [
  { x: canva.width, width: 50, height: 250 },
  { x: canva.width + 50, width: 50, height: 200 },
  { x: canva.width + 70, width: 50, height: 350 },
  { x: canva.width + 300, width: 50, height: 370 },
  { x: canva.width + 350, width: 50, height: 250 },
];
*/

const bgImage1 = new Image();
bgImage1.src = "images/bckg1.jpg";
const bgImage2 = new Image();
bgImage2.src = "images/bckg2.jpg";

//var bgX1 = 0;
//var bgX2 = canva.width;

//Obstacles
var obstacles = [];
//Vitesse
var baseSpeed = 2;
var speed = baseSpeed;

//Bonus
var bonus = null;
var bonusType = "";
var isInvincible = false;
var invincibilityTimer = 0;

var isSlow = false;
var slowTimer = 0;

//METEO

var pressureData = null;
var temperatureData = null;
//var humidityData = null;
var nebulositeData = null;

async function pressure() {
  try {
    const weatherData = await getValueWeather();
    console.log(weatherData);
    pressureData = weatherData.pressure;
    return pressureData;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données météorologiques:",
      error
    );
  }
}
pressure();
async function temperature() {
  try {
    const weatherData = await getValueWeather();
    console.log(weatherData);
    temperatureData = weatherData.temperature;
    nebulositeData = weatherData.nebulosity;
    return temperatureData, nebulositeData;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données météorologiques:",
      error
    );
  }
}
temperature();

/*
async function humidity() {
  try {
    const weatherData = await getValueWeather();
    console.log(weatherData);
    humidityData = weatherData.humidity;
    return humidityData
  } catch (error) {
    console.error('Erreur lors de la récupération des données météorologiques:', error);
  }
}
  */

async function nebulosity() {
  try {
    const weatherData = await getValueWeather();
    console.log(weatherData);
    nebulositeData = weatherData.nebulosity;
    return nebulositeData;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données météorologiques:",
      error
    );
  }
}
nebulosity();

//Particule
var particules = [];
//Son
//const soundJump = new Audio("sound/jump.mp3")

//Gestion du saut
var jumpStartTime = null;
var doubleJumpAvailable = true;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (ballY === groundY - 10 || isOnBlock) {
      velocityY = jumpPower;
      //soundJump.play();
      isOnBlock = false; // La balle quitte le bloc
      doubleJumpAvailable = true;
    } else if (doubleJumpAvailable) {
      velocityY = jumpPower + 2;
      doubleJumpAvailable = false;
    }

    if (e.code === "Space" && jumpStartTime === null) {
      jumpStartTime = Date.now();
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space" && jumpStartTime != null) {
    let pressDuration = (Date.now() - jumpStartTime) / 1000;
    jumpStartTime = null;

    let jumpPowerModulated = Math.max(
      maxJumpPower,
      minJumpPower - pressDuration * 10
    );

    if (ballY === groundY - 10 || isOnBlock) {
      velocityY = jumpPowerModulated;
      isOnBlock = false;
      doubleJumpAvailable = true;
    } else if (doubleJumpAvailable) {
      velocityY = jumpPowerModulated;
    } else if (ballY < groundY - 10) {
    }
  }
});

const backgroundMusic = new Audio("musique/test3.mp3");
backgroundMusic.volume = 1; // Ajuste le volume

backgroundMusic.addEventListener("ended", () => {
  messageFinActive = true;
  drawEndMessage();
  console.log("ended");
});

//Generer les bonus
function generateBonus() {
  if (!messageFinActive) {
    bonus = {
      x: canva.width,
      y: Math.random() * (groundY - 50), // Position aléatoire au-dessus du sol
      width: 20,
      height: 20,
    };
  }
}

function drawBonus() {
  if (bonus && bonusType === "invincible") {
    context.fillStyle = "gold";
    context.fillRect(bonus.x, bonus.y, bonus.width, bonus.height);
  } else if (bonus && bonusType === "slow") {
    context.fillStyle = "red";
    context.fillRect(bonus.x, bonus.y, bonus.width, bonus.height);
  } else if (bonus && bonusType === "addScoreBonus") {
    context.fillStyle = "blue";
    context.fillRect(bonus.x, bonus.y, bonus.width, bonus.height);
  }
}

function updateBonus() {
  if (bonus) {
    bonus.x -= speed;
    if (bonus.x + bonus.width < 0) {
      bonus = null;
    }
  }
}

function checkBonusCollision() {
  if (bonus) {
    const ballBottom = ballY + 10;
    const ballTop = ballY - 10;
    const ballRight = 100 + 10;
    const ballLeft = 100 - 10;

    const bonusBottom = bonus.y + bonus.height;
    const bonusTop = bonus.y;
    const bonusRight = bonus.x + bonus.width;
    const bonusLeft = bonus.x;

    if (
      ballBottom > bonusTop &&
      ballTop < bonusBottom &&
      ballRight > bonusLeft &&
      ballLeft < bonusRight
    ) {
      bonus = null; // Supprime le bonus
      if (bonusType === "invincible") {
        activateInvincibility();
      } else if (bonusType === "addScoreBonus") {
        scoreDisplay += 10;
      } else {
        activateSlow();
      }
    }
  }
}

function activateInvincibility() {
  isInvincible = true;
  baseSpeed = 10;
  invincibilityTimer = 300; // 300 frames (environ 5 secondes si 60 FPS)
}

function updateInvincibility() {
  if (isInvincible) {
    invincibilityTimer--;
    if (invincibilityTimer <= 0) {
      isInvincible = false;
      baseSpeed = 3;
      // Fin de l'invincibilité
    }
  }
}
function activateSlow() {
  isSlow = true;
  slowTimer = 300; // 300 frames (environ 5 secondes si 60 FPS)
}

function updateSlow() {
  if (isSlow) {
    slowTimer--;
    if (slowTimer <= 0) {
      isSlow = false; // Fin de l'invincibilité
    }
  }
}

//Generer les particules
function generateParticules() {
  const particule = {
    x: Math.random() * 800,
    y: Math.random() * groundY,
    width: 2,
    height: 1,
  };
  particules.push(particule);
}

function drawParticule() {
  particules.forEach((particule) => {
    let i = particule;
    if (!isSlow) {
      particule.x -= speed * 0.3;
      particule.y += 0.1;
    } else {
      particule.x -= baseSpeed * 0.3;
      particule.y += 1;
    }

    context.fillStyle = "#f0f0f2";
    context.fillRect(
      particule.x,
      particule.y,
      particule.width + 0.1,
      particule.height
    );

    if (particule.x + particule.width < 0) {
      particules.splice(i, 1); // Retire l'obstacle du tableau
      score++;
    }
  });
}

//generer les obstacles
function generateObstacle() {
  let obstacle = {
    x: canva.width,
    width: 20 + Math.floor(Math.random() * 10),
    height: getCurrentFrequency() / 4 - Math.floor(Math.random() * 10),
  };
  obstacles.push(obstacle); // Ajoute le nouvel obstacle au tableau
}

function drawObstacles() {
  for (let i = obstacles.length - 5; i >= 0; i--) {
    let obstacle = obstacles[i];

    // Déplace l'obstacle
    if (!isSlow) {
      obstacle.x -= speed;
    } else {
      obstacle.x -= baseSpeed;
    }

    // Dessine l'obstacle
    context.fillStyle = "black";
    context.fillRect(
      obstacle.x,
      groundY - obstacle.height,
      obstacle.width,
      obstacle.height
    );

    // Supprime l'obstacle s'il sort de l'écran
    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1); // Retire l'obstacle du tableau
      score++;
      if (score % 10 === 0) {
        scoreDisplay++;
      } // Incrémente le score
    }
  }
}

function checkObstaclesCollision() {
  for (let obstacle of obstacles) {
    if (!isInvincible) {
      let ballBottom = ballY + 10;
      let ballTop = ballY - 10; // Haut de la balle
      let ballRight = 100 + 10;
      let ballLeft = 100 - 10;

      let obstacleTop = groundY - obstacle.height;
      let obstacleLeft = obstacle.x;
      let obstacleRight = obstacle.x + obstacle.width;

      // Collision avec le haut du bloc
      if (
        ballBottom > obstacleTop &&
        ballTop < obstacleTop + 1 &&
        ballRight > obstacleLeft &&
        ballLeft < obstacleRight
      ) {
        ballY = obstacleTop - 10; // Place la balle sur le bloc
        velocityY = 0; // Arrête la gravité
        isOnBlock = true;
      } else if (
        ballRight > obstacleLeft &&
        ballLeft < obstacleRight &&
        ballBottom > obstacleTop
      ) {
        console.log("Collision détectée !");
        isGameOver = true; // Déclenche le Game Over
        scoreTab.push(scoreDisplay);
        gameOver++;
        start = false;
        backgroundMusic.pause();
        break;
      }
    }
  }
}

/*
function drawBackground() {
  backgrounds.forEach((background) => {
    if (background.x + background.width < 0) {
      background.x = canva.width + Math.floor(Math.random() * 300); // Réinitialise l'obstacle à une position aléatoire
      background.width = 50 + Math.floor(Math.random() * 50); // Taille aléatoire
      background.height = 200 + Math.floor(Math.random() * 50);
    }
    context.fillStyle = "grey";
    context.fillRect(
      background.x,
      groundY - background.height,
      background.width,
      background.height
    );

    // Mouvement des rectangles
    if (isSlow) {
      background.x -= baseSpeed;
    } else {
      background.x -= baseSpeed * 0.1;
    }
    // Moins rapide pour simuler la distance
    //backgroundX2 -= baseSpeed; // Un peu plus rapide

    // Réinitialisation pour la répétition
    if (background.x + canva.width < 0) {
      background.x = canva.width;
    }
    /*if (backgroundX2 + canva.width < 0) {
        backgroundX2 = canva.width;
      }
  });
}
*/

// //DESSIN DES FLOCONS DE NEIGE
// var clouds = [];

// function generateSnowflake() {
//   let quantityCloud = Math.floor(nebulositeData);
  
//   if (quantityCloud <= 0) {
//     return;
//   }
//   for (let i = 0; i < quantityCloud; i++) {
//     let cloud = {
//       x: 0,
//       y: 0,
//       size: 0,
//     };
//     cloud.x = Math.floor(Math.random() * 600);
//     cloud.y = Math.floor(Math.random() * 150);
//     cloud.size = Math.floor(Math.random() * (quantityCloud * 10));
//     clouds.push(cloud);
//   }
// }



//DESSIN NUAGE
var clouds = [];

function generateClouds() {
  let quantityCloud = Math.floor(nebulositeData);
  
  if (quantityCloud <= 0) {
    return;
  }
  for (let i = 0; i < quantityCloud; i++) {
    let cloud = {
      x: 0,
      y: 0,
      size: 0,
    };
    cloud.x = Math.floor(Math.random() * 600);
    cloud.y = Math.floor(Math.random() * 150);
    cloud.size = Math.floor(Math.random() * (quantityCloud * 10));
    clouds.push(cloud);
  }
}



function drawCloud() {
  for (let i = clouds.length - 1; i >= 0; i--) {
    let cloud = clouds[i];
    console.log(clouds[i]);

    if (!isSlow) {
      cloud.x -= 0.2;
    } else {
      cloud.x -= 0;
    }

    context.fillStyle = "black"; // Couleur blanche pour le nuage
    context.beginPath();

    // Dessiner les cercles du nuage
    context.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2); // Cercle principal
    context.arc(
      cloud.x + cloud.size * 0.7,
      cloud.y - cloud.size * 0.4,
      cloud.size * 0.8,
      0,
      Math.PI * 2
    );
    context.arc(
      cloud.x - cloud.size * 0.7,
      cloud.y - cloud.size * 0.4,
      cloud.size * 0.8,
      0,
      Math.PI * 2
    );
    context.arc(
      cloud.x + cloud.size * 0.4,
      cloud.y + cloud.size * 0.4,
      cloud.size * 0.7,
      0,
      Math.PI * 2
    );
    context.arc(
      cloud.x - cloud.size * 0.4,
      cloud.y + cloud.size * 0.4,
      cloud.size * 0.7,
      0,
      Math.PI * 2
    );

    context.closePath();
    context.fill();

    // Supprime l'obstacle s'il sort de l'écran
    if (cloud.x < 0) {
      cloud.x = canva.width;
    }
  }
}

// Fonction pour dessiner le message "Fin"
function drawEndMessage() {
  context.font = "48px Arial";
  context.fillStyle = "black";
  context.fillText(messageFinText, messageFinX, canva.height / 2);
  messageFinX -= messageFinSpeed;

  // Vérifier si le message est complètement sorti de l'écran
  if (
    messageFinX + context.measureText(messageFinText).width <
    canva.width / 2
  ) {
    stopGame(); // Arrêter le jeu
  }
}

//-------------MIS A JOUR FRAME----------------

function updateGame() {
  if (isGameOver) {
    // Afficher l'écran de Game Over
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("Game Over", canva.width / 2, canva.height / 2);
    context.font = "20px Arial";
    context.fillText(
      "Press R to Restart",
      canva.width / 2,
      canva.height / 2 + 40
    );
    return; // Arrête la boucle du jeu
  }

  context.clearRect(0, 0, canva.width, canva.height);

  //COULEUR DE FOND

  //gradient linéaire
  const gradient = context.createLinearGradient(0, 0, 0, canva.height);

  // Ajouter les couleurs du gradient
  gradient.addColorStop(0, "#ff7e5f"); // Couleur orange vif
  gradient.addColorStop(1, "#feb47b"); // Couleur pêche

  // Remplir le canvas avec le gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, canva.width, canva.height);

  drawCloud();

  //drawScrollingBackground();
  drawB(context, canva);
  //drawBackground();
  drawBonus();
  if (pressureData <= 1010) {
    generateParticules();
    drawParticule();
  }

  updateBonus();

  start = true;

  //Dessine la boule
  context.fillStyle = "black";
  context.beginPath();
  context.arc(100, ballY, 10, 0, Math.PI * 2);
  context.fill();

  //Dessine le sol
  context.beginPath(); // Start a new path
  context.moveTo(0, 300); // Move the pen to (30, 50)
  context.lineTo(800, 300); // Draw a line to (150, 100)
  context.lineWidth = 5;
  context.stroke(); // Render the path

  //gravité
  velocityY += gravity;
  ballY += velocityY;

  //Collision avec le sol
  if (isInvincible) {
    ballY = groundY - 150;
    velocityY = 0;
  } else {
    if (ballY > groundY - 10) {
      ballY = groundY - 10; // Reste au sol
      velocityY = 0; //Stop le mouvement
    }
  }
  //Ajuster la vitess en fonction du score

  if (speed > 15) {
    speed = 15;
    console.log(speed);
  } else {
    speed = baseSpeed + 0.1 * Math.floor(scoreDisplay / 5);
  }

  if (!modeTest) {
    detectBeats(() => {
      generateObstacle(); // Génère un nouvel obstacle sur chaque beat détecté
    });
    drawObstacles();
  }

  
  checkObstaclesCollision();
  checkBonusCollision();
  updateInvincibility();
  updateSlow();

  // Gérer l'apparition du bonus à chaque multiple de 25 points
  if (score >= 25 && score % 25 === 0 && !bonus) {
    bonusType = "invincible";
    generateBonus();
  }
  if (score >= 30 && score % 20 === 0 && !bonus) {
    bonusType = "slow";
    generateBonus();
  }
  if (score >= 10 && score % 15 === 0 && !bonus) {
    bonusType = "addScoreBonus";
    generateBonus();
  }

  // Indicateur de bonus
  if (isInvincible && !isGameOver) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("SPEED ACTIVATE", canva.width / 2, 100);
    context.font = "20px Arial";
  }
  if (isSlow && !isGameOver) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("SLOW", canva.width / 2, 100);
    context.font = "20px Arial";
  }

  if (speed > 10 && !messageFinActive && !isGameOver) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("YOU SO ARE FAST!!", canva.width / 2, canva.height);
    context.font = "20px Arial";
  }
  if (speed > 5 && speed < 10 && !messageFinActive && !isGameOver) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("GO FAST!!", canva.width / 2, canva.height);
    context.font = "20px Arial";
  }
  if (speed < 4 && !messageFinActive && !isGameOver) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("YOU ARE SO SLOW!!", canva.width / 2, canva.height);
    context.font = "20px Arial";
  }

  


  //Affichage du score
  context.font = "16px serif";
  context.fillText("Score: " + scoreDisplay, 600, 20);
  //Temperature
  context.font = "16px serif";
  context.fillText("Temperature: " + Math.floor(temperatureData) + "°C", 600, 40);

  animationId = requestAnimationFrame(updateGame);

  if (messageFinActive) {
    drawEndMessage();
  }
}

function stopGame() {
  cancelAnimationFrame(animationId);

  context.clearRect(0, 0, canva.width, canva.height);

  context.fillStyle = "black";
  context.font = "40px Arial";
  context.textAlign = "center";
  context.fillText(
    "Your best Score: " + Math.max(...scoreTab),
    canva.width / 2,
    canva.height / 2
  );
  context.font = "20px Arial";
  context.fillText(
    "You failed " + gameOver + " times",
    canva.width / 2,
    canva.height / 2 + 40
  );
  console.log(scoreTab);
}

function restartGame() {
  //Réinitialise les variables
  score = 0;
  scoreDisplay = 0;
  speed = baseSpeed;
  isGameOver = false;
  obstacles = [];
  ballY = groundY;
  velocityY = 0;
  isOnBlock = false;
  updateGame();
}

document.addEventListener("keydown", (e) => {
  if ((e.key === "s" && !start) || (e.key === "S" && !start)) {
    // Démarrer le jeu après interaction
    initializeAudio(backgroundMusic);
    updateGame();
    generateClouds();
    
  }
});

window.addEventListener("keydown", (e) => {
  if ((e.key === "r" && isGameOver) || (e.key === "R" && isGameOver)) {
    // Démarrer le jeu après interaction
    initializeAudio(backgroundMusic);
    restartGame();
  }
});
