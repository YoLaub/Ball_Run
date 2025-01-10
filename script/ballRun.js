var canva = document.getElementById("gameCanvas");
const context = canva.getContext("2d");

//Gestion du score
var score = 0;

//Debut de partie
var start = false;

//Fin de partie
var isGameOver = false;

//Gestion de la balle
let ballY = 290;
let velocityY = 0;
const gravity = 0.3;
const jumpPower = -10;
const groundY = 300;
var isOnBlock = false;

//Gestion des obstacles
const obstacles = [
  { x: canva.width, width: 50, height: 50 },
  { x: canva.width + 300, width: 40, height: 60 },
  { x: canva.width + 600, width: 60, height: 40 },
];

//Vitesse
var baseSpeed = 3;
var speed = baseSpeed;

//Gestion du saut
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && (ballY === groundY || isOnBlock)) {
    velocityY = jumpPower;
    isOnBlock = false; // La balle quitte le bloc
  }
});

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
  if (ballY > groundY) {
    ballY = groundY; // Reste au sol
    velocityY = 0; //Stop le mouvement
  }

  //Ajuster la vitess en fonction du score
  speed = baseSpeed + Math.floor(score / 5);
  console.log(speed);
  if (speed > 15){
    speed = 15;
  } else{
    speed
  }

  obstacles.forEach((obstacle) => {
    obstacle.x -= speed;
    if (obstacle.x + obstacle.width < 0) {
      obstacle.x = canva.width + Math.floor(Math.random() * 300); // Réinitialise l'obstacle à une position aléatoire
      obstacle.width = 10 + Math.floor(Math.random() * 50); // Taille aléatoire
      obstacle.height = 10 + Math.floor(Math.random() * 50);
      score++; // Incrémente le score pour chaque obstacle évité
    }
    context.fillStyle = "black";
    context.fillRect(
      obstacle.x,
      groundY - (obstacle.height),
      obstacle.width,
      obstacle.height
    );

    // Détection de collision avec le haut du bloc
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
      ballY = obstacleTop; // Place la balle sur le bloc
      //velocityY = 0; // Arrête la gravité
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
  });

  // Réactiver la gravité si la balle quitte le bloc
  /*if (!isOnBlock) {
    velocityY += gravity;
  }*/

  //Affichage du score
  context.font = "16px serif";
  context.fillText("Score: " + score, 600, 20);

  requestAnimationFrame(updateGame);
}

function restartGame() {
  //Réinitialise les variables
  score = 0;
  speed = baseSpeed;
  isGameOver = false;
  obstacles.forEach((obstacle) => {
    obstacle.x = canva.width + Math.floor(Math.random() * 300); // Réinitialise l'obstacle à une position aléatoire
    obstacle.width = 10 + Math.floor(Math.random() * 40); // Taille aléatoire
    obstacle.height = 10 + Math.floor(Math.random() * 40);
  });
  ballY = groundY;
  velocityY = 0;
  isOnBlock = false;

  updateGame();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "s" && !start || e.key === "S" && !start) {
    updateGame();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "r"&& isGameOver || e.key === "R" && isGameOver) {
    restartGame();
  }
});
