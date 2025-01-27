
//FLOCON DE NEIGE
export function drawSnowflake(x, y, size) {
    ctx.strokeStyle = '#FFFFFF'; // Blanc pour le flocon
    ctx.lineWidth = 2;

    // Fonction récursive pour dessiner les branches
    function drawBranch(x1, y1, length, angle, depth) {
        if (depth === 0) return;

        // Calculer le point final de la branche
        const x2 = x1 + length * Math.cos(angle);
        const y2 = y1 + length * Math.sin(angle);

        // Dessiner la branche principale
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Dessiner les sous-branches
        const newLength = length * 0.6; // Réduction de la taille
        drawBranch(x2, y2, newLength, angle - Math.PI / 6, depth - 1); // Branche gauche
        drawBranch(x2, y2, newLength, angle + Math.PI / 6, depth - 1); // Branche droite
    }

    // Dessiner les six branches principales du flocon
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        drawBranch(x, y, size, angle, 3); // Profondeur 3
    }
}