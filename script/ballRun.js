var canva = document.getElementById("gameCanvas");
const context = canva.getContext("2d");
var messageAlert = document.getElementById("message");

//Gestion du score
var score = 0;

var gameOver = document.createElement("h1");
var contentGameOver = document.createTextNode("GAME OVER");
let isGameOver = false;

//Gestion de la balle
let ballY = 300;
let velocityY = 0;
const gravity = 0.5;
const jumpPower = -12;
const groundY = 300;

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
  if (e.code === "Space" && ballY >= groundY) {
    velocityY = jumpPower ;
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

  //Affichage du score
  context.font = "16px serif";
  context.fillText("Score: " + score, 600, 20);

  //gravité
  velocityY += gravity;
  ballY += velocityY;

  //Collision avec le sol
  if (ballY > groundY) {
    ballY = groundY; // Reste au sol
    velocityY = 0; //Stop le mouvement
  }

  //Dessine la boule
  context.fillStyle = "black";
  context.beginPath();
  context.arc(100, ballY, 10, 0, Math.PI * 2);
  context.fill();

  //Ajuster la vitess en fonction du score
  speed = baseSpeed + Math.floor(score / 5);
  console.log(speed);
  if (speed > 15) speed = 15;

  obstacles.forEach((obstacle) => {
    obstacle.x -= speed;
    if (obstacle.x + obstacle.width < 0) {
      obstacle.x = canva.width + Math.random() * 300; // Réinitialise l'obstacle à une position aléatoire
      obstacle.width = 20 + Math.random() * 50; // Taille aléatoire
      obstacle.height = 20 + Math.random() * 50;
      score++; // Incrémente le score pour chaque obstacle évité
    }
    context.fillStyle = "black";
    context.fillRect(
      obstacle.x,
      groundY - ( obstacle.height - 10),
      obstacle.width,
      obstacle.height
    );

    // Détection de collision
    const ballLeft = 100 - 10;
    const ballRight = 100 + 10;
    const ballTop = ballY - 10;
    const ballBottom = ballY + 10;

    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleTop = groundY - obstacle.height;
    const obstacleBottom = groundY;

    if (
      ballRight > obstacleLeft &&
      ballLeft < obstacleRight &&
      ballBottom > obstacleTop &&
      ballTop < obstacleBottom
    ) {
      console.log("Collision détectée !");
      score = 0;
      speed = baseSpeed;
      return
    }
  });

  requestAnimationFrame(updateGame);
}

updateGame();
