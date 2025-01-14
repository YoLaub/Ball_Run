import { initializeAudio, detectBeats, drawB } from "./audioManager.js";

var canva = document.getElementById("gameCanvas");
const context = canva.getContext("2d");

//Gestion du score
var score = 0;
var scoreDisplay = 0;

//Debut de partie
var start = false;

//Fin de partie
var isGameOver = false;

//Gestion de la balle
var ballY = 290;
var velocityY = 0;
const gravity = 0.3;
const maxJumpPower = -15;
const jumpPower = -10;
const minJumpPower = -2;
const groundY = 300;
var isOnBlock = false;

//Arrière plan
var backgrounds = [
  { x: canva.width, width: 50, height: 250 },
  { x: canva.width + 50, width: 50, height: 200 },
  { x: canva.width + 70, width: 50, height: 350 },
  { x: canva.width + 300, width: 50, height: 370 },
  { x: canva.width + 350, width: 50, height: 250 },
];

const bgImage1 = new Image();
bgImage1.src = "images/bckg1.jpg";
const bgImage2 = new Image();
bgImage2.src = "images/bckg2.jpg";

//var bgX1 = 0;
//var bgX2 = canva.width;

//Obstacles
var obstacles = [];
//Vitesse
var baseSpeed = 3;
var speed = baseSpeed;

//Bonus
var bonus = null;
var bonusType = "";
var isInvincible = false;
var invincibilityTimer = 0;

var isSlow = false;
var slowTimer = 0;

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
    }
  }
});

const backgroundMusic = new Audio("musique/test3.mp3");
backgroundMusic.loop = true; // Répète la musique en boucle
backgroundMusic.volume = 1; // Ajuste le volume

//Generer les bonus
function generateBonus() {
  bonus = {
    x: canva.width,
    y: Math.random() * (groundY - 50), // Position aléatoire au-dessus du sol
    width: 20,
    height: 20,
  };
}

function drawBonus() {
  if (bonus && bonusType === "invincible") {
    context.fillStyle = "gold";
    context.fillRect(bonus.x, bonus.y, bonus.width, bonus.height);
  } else if (bonus && bonusType === "slow") {
    context.fillStyle = "red";
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
      } else {
        activateSlow();
      }
    }
  }
}

function activateInvincibility() {
  isInvincible = true;
  invincibilityTimer = 300; // 300 frames (environ 5 secondes si 60 FPS)
}

function updateInvincibility() {
  if (isInvincible) {
    invincibilityTimer--;
    if (invincibilityTimer <= 0) {
      isInvincible = false; // Fin de l'invincibilité
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
/*
  function drawScrollingBackground() {
    // Dessiner les deux images côte à côte
    context.drawImage(bgImage1, bgX1, 0, canva.width, canva.height);
    context.drawImage(bgImage2, bgX2, 0, canva.width, canva.height);
  
    // Déplacer les images vers la gauche
    if (isSlow) {
      bgX1 -= baseSpeed * 0.08; 
      bgX2 -= baseSpeed * 0.08;
    } else {
      bgX1 -= baseSpeed * 0.1;
      bgX2 -= baseSpeed * 0.1;
    }
  
    // Réinitialiser la position pour créer un défilement infini
    if (bgX1 + canva.width <= 0) {
      bgX1 = bgX2 + canva.width;
    }
    if (bgX2 + canva.width <= 0) {
      bgX2 = bgX1 + canva.width;
    }
  }
    */

//Generer les particules
function generateParticules(){
  const particule = { x: canva.width, y: Math.random()*(groundY - 100), width: 5, height: 1 };
  particules.push(particule)
 
}

function drawParticule() {
  particules.forEach((particule) => {
      if (!isSlow) {
      particule.x -= speed;
    } else {
      particule.x -= baseSpeed;
    }
    if (particule.x + particule.width < 0) {
      particule.x = canva.width * (Math.random() * 400);
      particule.y = Math.random() * (groundY - 300);
      particule.width = 10 + scoreDisplay;
      particule.height = 2;
    }

    context.fillStyle = "#f0f0f2";
    context.fillRect(
      particule.x,
      particule.y,
      particule.width,
      particule.height
    );
  });
}

//generer les obstacles
function generateObstacle() {
  const obstacle = {
    x: canva.width,
    width: 20 + Math.floor(Math.random() * 10),
    height: 10 + Math.floor(Math.random() * 50),
  };
  obstacles.push(obstacle); // Ajoute le nouvel obstacle au tableau
}

function drawObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];

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
  for (const obstacle of obstacles) {
    if (!isInvincible) {
      const ballBottom = ballY + 10;
      const ballTop = ballY - 10; // Haut de la balle
      const ballRight = 100 + 10;
      const ballLeft = 100 - 10;

      const obstacleTop = groundY - obstacle.height;
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;

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

        start = false;
        break;
      }
    }
  }
}

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
      }*/
  });
}

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
    backgroundMusic.pause();
    return; // Arrête la boucle du jeu
  }

  context.clearRect(0, 0, canva.width, canva.height);

  //drawScrollingBackground();
  drawB(context, canva);
  //drawBackground();
  drawBonus();
  generateParticules();
  drawParticule();
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
  if (ballY > groundY - 10) {
    ballY = groundY - 10; // Reste au sol
    velocityY = 0; //Stop le mouvement
  }

  //Ajuster la vitess en fonction du score

  if (speed > 15) {
    speed = 15;
    console.log(speed);
  } else {
    speed = baseSpeed + 0.2 * Math.floor(scoreDisplay / 5);
  }

  detectBeats(() => {
    generateObstacle(); // Génère un nouvel obstacle sur chaque beat détecté
  });

  drawObstacles();

  checkObstaclesCollision();

  /*
  //Dessine les obstacles
  obstacles.forEach((obstacle) => {
    if (!isSlow) {
      obstacle.x -= speed;
    } else {
      obstacle.x -= baseSpeed;
    }

    if (obstacle.x + obstacle.width < 0) {
      obstacle.x = canva.width + Math.floor(Math.random() * 300); // Réinitialise l'obstacle à une position aléatoire
      obstacle.width = 10 + Math.floor(Math.random() * 50); // Taille aléatoire
      obstacle.height = 10 + Math.floor(Math.random() * 50);
      score++;
    }
    context.fillStyle = "black";
    context.fillRect(
      obstacle.x,
      groundY - obstacle.height,
      obstacle.width,
      obstacle.height
    );

    // Détection de collision avec le haut du bloc
    if (!isInvincible) {
      const ballBottom = ballY + 10;
      const ballTop = ballY - 10; // Haut de la balle
      const ballRight = 100 + 10;
      const ballLeft = 100 - 10;

      const obstacleTop = groundY - obstacle.height;
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;

      //collision haut de block
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
        start = false;
      }
    }
  });*/

  // Réactiver la gravité si la balle quitte le bloc
  /*if (!isOnBlock) {
      velocityY += gravity;
    }*/

  checkBonusCollision();
  updateInvincibility();
  updateSlow();

  // Gérer l'apparition du bonus à chaque multiple de 25 points
  if (score >= 25 && score % 25 === 0 && !bonus) {
    bonusType = "invincible";
    generateBonus();
  } else if (score >= 30 && score % 20 === 0 && !bonus) {
    bonusType = "slow";
    generateBonus();
  }

  // Indicateur de bonus
  if (isInvincible) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("INVINCIBLE", canva.width / 2, 100);
    context.font = "20px Arial";
  }
  if (isSlow) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("SLOW", canva.width / 2, 100);
    context.font = "20px Arial";
  }

  if (speed > 10) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("YOU SO ARE FAST!!", canva.width / 2, canva.height);
    context.font = "20px Arial";
  }
  if (speed > 5 && speed < 10) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("GO FAST!!", canva.width / 2, canva.height);
    context.font = "20px Arial";
  }
  if (speed < 4) {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.fillText("YOU ARE SO SLOW!!", canva.width / 2, canva.height);
    context.font = "20px Arial";
  }

  //Affichage du score
  context.font = "16px serif";
  context.fillText("Score: " + scoreDisplay, 600, 20);

  requestAnimationFrame(updateGame);
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
  }
});

window.addEventListener("keydown", (e) => {
  if ((e.key === "r" && isGameOver) || (e.key === "R" && isGameOver)) {
    // Démarrer le jeu après interaction
    initializeAudio(backgroundMusic);
    restartGame();
  }
});
