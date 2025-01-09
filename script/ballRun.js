var canva = document.getElementById("gameCanvas");
const context = canva.getContext("2d");

//Gestion du score
var score = 0;

var isGameOver = false;

//Gestion de la balle
let ballY = 300;
let velocityY = 0;
const gravity = 0.3;
const jumpPower = -15;
const groundY = 300;
var isOnBlock = false;

//Gestion des obstacles
const obstacles = [
  { x: canva.width, width: 50, height: 50 },
  { x: canva.width + 300, width: 40, height: 60 },
  { x: canva.width + 600, width: 60, height: 40 },
];

var baseSpeed = 3;
var speed = baseSpeed;

//Gestion du saut
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && ballY === groundY) {
    velocityY = jumpPower;
  }
});

function updateGame() {
  if (isGameOver) {
    // Afficher l'écran de Game Over
    context.fillStyle = 'black';
    context.font = '40px Arial';
    context.textAlign = 'center';
    context.fillText('Game Over', canva.width / 2, canva.height / 2);
    context.font = '20px Arial';
    context.fillText('Press R to Restart', canva.width / 2, canva.height / 2 + 40);
    return; // Arrête la boucle du jeu
  }

  context.clearRect(0, 0, canva.width, canva.height);

  //Dessine la boule
  context.fillStyle = "black";
  context.beginPath();
  context.arc(100, ballY, 10, 0, Math.PI * 2);
  context.fill();

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
  if (speed > 15) speed = 15;

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
      groundY - (obstacle.height - 10),
      obstacle.width,
      obstacle.height
    );

    // Détection de collision avec le haut du bloc
    const ballBottom = ballY;
    const ballRight = 100 + 10;
    const ballLeft = 100 - 10;

    const obstacleTop = groundY - obstacle.height;
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;

    if (
      ballBottom <= obstacleTop &&
      ballRight > obstacleLeft &&
      ballLeft < obstacleRight
    ) {
      ballY = obstacleTop + 10; // Place la balle sur le bloc
      velocityY = 0; // Arrête la gravité
      isOnBlock = true;
    }else if (
      ballRight > obstacleLeft &&
      ballLeft < obstacleRight &&
      ballY - 10 < groundY // Collision sur les côtés ou la face avant
    ) {
      console.log("Collision détectée !");
      isGameOver = true; // Déclenche le Game Over
    }


  });

  if (!isOnBlock && ballY < groundY) {
    velocityY += gravity;
  }

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

document.addEventListener('keydown', (e) => {
  if (e.key === 's' || e.key === 'S') {
    updateGame();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    restartGame();
  }
});

