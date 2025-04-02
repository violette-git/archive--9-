// Bunny Snake Game - Core Game Logic

// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let level = 1;
let speed = 100; // Base speed in milliseconds

// Bunny snake properties
let bunny = {
    body: [
        { x: 10, y: 10 }, // Head position
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ],
    direction: 'right',
    nextDirection: 'right',
    size: 20 // Size of each segment in pixels
};

// Food (carrot) properties
let carrot = {
    x: 0,
    y: 0,
    size: 20
};

// Enemies
let enemies = [];
const enemyTypes = {
    fox: { speed: 1.0, damage: 1, color: '#FF6600' },
    wolf: { speed: 1.5, damage: 2, color: '#666666' }
};

// Game grid properties
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Game loop reference
let gameLoop;

// Initialize game
function initGame() {
    // Reset game state
    gameRunning = true;
    gamePaused = false;
    gameOver = false;
    score = 0;
    level = 1;
    speed = 100;
    
    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('highScore').textContent = highScore;
    
    // Reset bunny position
    bunny.body = [
        { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
        { x: Math.floor(gridWidth / 2) - 1, y: Math.floor(gridHeight / 2) },
        { x: Math.floor(gridWidth / 2) - 2, y: Math.floor(gridHeight / 2) }
    ];
    bunny.direction = 'right';
    bunny.nextDirection = 'right';
    
    // Place initial carrot
    placeCarrot();
    
    // Clear enemies
    enemies = [];
    
    // Show/hide appropriate buttons
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'inline-block';
    
    // Start game loop
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, speed);
}

// Place a carrot at a random position
function placeCarrot() {
    // Find a position that doesn't overlap with the bunny
    let validPosition = false;
    while (!validPosition) {
        carrot.x = Math.floor(Math.random() * gridWidth);
        carrot.y = Math.floor(Math.random() * gridHeight);
        
        validPosition = true;
        // Check if carrot overlaps with bunny body
        for (let segment of bunny.body) {
            if (segment.x === carrot.x && segment.y === carrot.y) {
                validPosition = false;
                break;
            }
        }
    }
}

// Spawn an enemy at a random edge position
function spawnEnemy() {
    // Only spawn enemies after level 2
    if (level < 2) return;
    
    // Determine enemy type based on level
    const enemyType = level >= 5 ? (Math.random() > 0.7 ? 'wolf' : 'fox') : 'fox';
    
    // Determine spawn position (on the edge of the canvas)
    let x, y, direction;
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    
    switch (side) {
        case 0: // Top
            x = Math.floor(Math.random() * gridWidth);
            y = 0;
            direction = Math.random() > 0.5 ? 'right' : 'left';
            break;
        case 1: // Right
            x = gridWidth - 1;
            y = Math.floor(Math.random() * gridHeight);
            direction = Math.random() > 0.5 ? 'up' : 'down';
            break;
        case 2: // Bottom
            x = Math.floor(Math.random() * gridWidth);
            y = gridHeight - 1;
            direction = Math.random() > 0.5 ? 'right' : 'left';
            break;
        case 3: // Left
            x = 0;
            y = Math.floor(Math.random() * gridHeight);
            direction = Math.random() > 0.5 ? 'up' : 'down';
            break;
    }
    
    // Create enemy object
    enemies.push({
        x: x,
        y: y,
        type: enemyType,
        direction: direction,
        size: gridSize
    });
}

// Update game state
function updateGame() {
    if (gamePaused || gameOver) return;
    
    // Move bunny
    moveBunny();
    
    // Check for collisions
    checkCollisions();
    
    // Move enemies
    moveEnemies();
    
    // Spawn enemies randomly based on level
    if (Math.random() < 0.01 * level) {
        spawnEnemy();
    }
    
    // Draw everything
    drawGame();
    
    // Check if level up
    if (score >= level * 100) {
        levelUp();
    }
}

// Move the bunny based on current direction
function moveBunny() {
    // Update direction
    bunny.direction = bunny.nextDirection;
    
    // Calculate new head position
    const head = { x: bunny.body[0].x, y: bunny.body[0].y };
    
    switch (bunny.direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Add new head to the beginning of the body
    bunny.body.unshift({ x: head.x, y: head.y });
    
    // Check if bunny ate a carrot
    if (head.x === carrot.x && head.y === carrot.y) {
        // Increase score
        score += 10;
        document.getElementById('score').textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
        
        // Place a new carrot
        placeCarrot();
    } else {
        // Remove tail segment if no carrot was eaten
        bunny.body.pop();
    }
}

// Move all enemies
function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const type = enemyTypes[enemy.type];
        
        // Move enemy based on its direction and speed
        switch (enemy.direction) {
            case 'up':
                enemy.y -= type.speed;
                break;
            case 'down':
                enemy.y += type.speed;
                break;
            case 'left':
                enemy.x -= type.speed;
                break;
            case 'right':
                enemy.x += type.speed;
                break;
        }
        
        // Remove enemies that go off-screen
        if (enemy.x < -1 || enemy.x > gridWidth + 1 || 
            enemy.y < -1 || enemy.y > gridHeight + 1) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

// Check for collisions
function checkCollisions() {
    const head = bunny.body[0];
    
    // Check for wall collisions
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver = true;
        endGame();
        return;
    }
    
    // Check for self-collision (bunny hitting itself)
    for (let i = 1; i < bunny.body.length; i++) {
        if (head.x === bunny.body[i].x && head.y === bunny.body[i].y) {
            gameOver = true;
            endGame();
            return;
        }
    }
    
    // Check for enemy collisions
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        // Check if enemy hits bunny head
        if (Math.abs(enemy.x - head.x) < 1 && Math.abs(enemy.y - head.y) < 1) {
            gameOver = true;
            endGame();
            return;
        }
        
        // Check if enemy crosses bunny body (cuts the tail)
        for (let j = 1; j < bunny.body.length; j++) {
            const segment = bunny.body[j];
            if (Math.abs(enemy.x - segment.x) < 1 && Math.abs(enemy.y - segment.y) < 1) {
                // Cut the tail at this point
                bunny.body = bunny.body.slice(0, j);
                
                // Reduce score
                score = Math.max(0, score - 5);
                document.getElementById('score').textContent = score;
                
                // Remove the enemy
                enemies.splice(i, 1);
                i--;
                break;
            }
        }
    }
}

// Level up function
function levelUp() {
    level++;
    document.getElementById('level').textContent = level;
    
    // Increase speed
    speed = Math.max(50, 100 - (level * 5));
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, speed);
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#F0F0E0'; // Light beige background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (optional)
    ctx.strokeStyle = '#E0E0D0';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw carrot
    ctx.fillStyle = '#FF4500'; // Orange-red for carrot
    ctx.fillRect(carrot.x * gridSize, carrot.y * gridSize, gridSize, gridSize);
    
    // Draw carrot top (green)
    ctx.fillStyle = '#00AA00';
    ctx.fillRect(carrot.x * gridSize + 5, carrot.y * gridSize - 3, 10, 5);
    
    // Draw bunny
    for (let i = 0; i < bunny.body.length; i++) {
        const segment = bunny.body[i];
        
        if (i === 0) {
            // Head
            ctx.fillStyle = '#FFFFFF'; // White for head
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Eyes
            ctx.fillStyle = '#FF0000'; // Red eyes
            
            // Position eyes based on direction
            let eyeX1, eyeY1, eyeX2, eyeY2;
            switch (bunny.direction) {
                case 'up':
                    eyeX1 = segment.x * gridSize + 5;
                    eyeY1 = segment.y * gridSize + 5;
                    eyeX2 = segment.x * gridSize + 15;
                    eyeY2 = segment.y * gridSize + 5;
                    break;
                case 'down':
                    eyeX1 = segment.x * gridSize + 5;
                    eyeY1 = segment.y * gridSize + 15;
                    eyeX2 = segment.x * gridSize + 15;
                    eyeY2 = segment.y * gridSize + 15;
                    break;
                case 'left':
                    eyeX1 = segment.x * gridSize + 5;
                    eyeY1 = segment.y * gridSize + 5;
                    eyeX2 = segment.x * gridSize + 5;
                    eyeY2 = segment.y * gridSize + 15;
                    break;
                case 'right':
                    eyeX1 = segment.x * gridSize + 15;
                    eyeY1 = segment.y * gridSize + 5;
                    eyeX2 = segment.x * gridSize + 15;
                    eyeY2 = segment.y * gridSize + 15;
                    break;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
            ctx.fill();
            
        } else {
            // Body
            ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#EEEEEE'; // Alternating white/light gray
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
    }
    
    // Draw enemies
    for (const enemy of enemies) {
        ctx.fillStyle = enemyTypes[enemy.type].color;
        ctx.fillRect(enemy.x * gridSize, enemy.y * gridSize, gridSize, gridSize);
        
        // Draw eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(enemy.x * gridSize + 5, enemy.y * gridSize + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x * gridSize + 15, enemy.y * gridSize + 10, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw game over message if needed
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Draw pause message if needed
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    }
}

// End the game
function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    // Show restart button
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'inline-block';
    
    // Draw final game state
    drawGame();
}

// Pause/resume the game
function togglePause() {
    if (!gameRunning || gameOver) return;
    
    gamePaused = !gamePaused;
    
    // Update pause button text
    document.getElementById('pauseButton').textContent = gamePaused ? 'Resume Game' : 'Pause Game';
    
    // Draw paused state
    drawGame();
}

// Handle keyboard input
document.addEventListener('keydown', function(event) {
    if (!gameRunning) return;
    
    // Handle direction changes
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (bunny.direction !== 'down') bunny.nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (bunny.direction !== 'up') bunny.nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (bunny.direction !== 'right') bunny.nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (bunny.direction !== 'left') bunny.nextDirection = 'right';
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

// Button event listeners
document.getElementById('startButton').addEventListener('click', initGame);

document.getElementById('restartButton').addEventListener('click', initGame);

document.getElementById('pauseButton').addEventListener('click', togglePause);

// Initialize high score display
document.getElementById('highScore').textContent = highScore;

// Draw initial game state (before starting)
drawGame();