document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcomeScreen');
    const gameContainer = document.getElementById('gameContainer');
    const playerNameInput = document.getElementById('playerName');
    const singlePlayerBtn = document.getElementById('singlePlayer');
    const multiPlayerBtn = document.getElementById('multiPlayer');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const currentPlayerDisplay = document.getElementById('currentPlayer');
    const scoreBoard = document.getElementById('scoreBoard');
    const gameBoard = document.getElementById('gameBoard');
    const restartGameBtn = document.getElementById('restartGame');
    const gameTimer = document.getElementById('gameTimer');

    // Game variables
    let playerName = '';
    let gameMode = ''; // 'single' or 'multi'
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { wins: 0, losses: 0, ties: 0 };
    let gameTime = 0;
    let timerInterval;
    let autoRestartTimeout;

    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Event listeners for game mode selection
    singlePlayerBtn.addEventListener('click', () => {
        playerName = playerNameInput.value.trim();
        if (playerName) {
            gameMode = 'single';
            startGame();
        } else {
            alert('Please enter your name to continue');
        }
    });

    multiPlayerBtn.addEventListener('click', () => {
        playerName = playerNameInput.value.trim();
        if (playerName) {
            gameMode = 'multi';
            startGame();
        } else {
            alert('Please enter your name to continue');
        }
    });

    // Restart game button click handler
    restartGameBtn.addEventListener('click', () => {
        clearTimeout(autoRestartTimeout);
        initializeGame();
    });

    // Start the game
    function startGame() {
        welcomeScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        welcomeMessage.textContent = `Welcome, ${playerName}!`;
        initializeGame();
        updateScoreBoard();
    }

    // Initialize the game
    function initializeGame() {
        // Clear any existing timers
        clearInterval(timerInterval);
        clearTimeout(autoRestartTimeout);
        
        // Reset game variables
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        gameTime = 0;
        updateTimerDisplay();
        
        // Start the timer
        timerInterval = setInterval(updateTimer, 1000);
        
        // Update UI
        currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;
        currentPlayerDisplay.style.color = '#e94560';
        
        // Clear the game board
        gameBoard.innerHTML = '';
        
        // Create cells
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }

        // If single player and computer's turn first
        if (gameMode === 'single' && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }

    // Update the game timer
    function updateTimer() {
        if (gameActive) {
            gameTime++;
            updateTimerDisplay();
        }
    }

    // Update the timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toString().padStart(2, '0');
        gameTimer.textContent = `${minutes}:${seconds}`;
    }

    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // If cell is already filled or game is not active, return
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;

        // Update game state and UI
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());

        // Check for win or draw
        checkResult();
    }

    // Computer's move (for single player mode)
    function computerMove() {
        if (!gameActive || currentPlayer !== 'O') return;

        // Simple AI: first try to win, then block, then random
        let move = findWinningMove('O') || findWinningMove('X') || findRandomMove();

        if (move !== null) {
            setTimeout(() => {
                gameState[move] = 'O';
                const cells = document.querySelectorAll('.cell');
                cells[move].textContent = 'O';
                cells[move].classList.add('o');
                checkResult();
            }, 500);
        }
    }

    // Find a winning move for the given player
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            // Check if two cells are filled with player and third is empty
            if (gameState[a] === player && gameState[b] === player && gameState[c] === '') return c;
            if (gameState[a] === player && gameState[c] === player && gameState[b] === '') return b;
            if (gameState[b] === player && gameState[c] === player && gameState[a] === '') return a;
        }
        return null;
    }

    // Find a random empty cell
    function findRandomMove() {
        const emptyCells = gameState.reduce((acc, val, index) => {
            if (val === '') acc.push(index);
            return acc;
        }, []);

        return emptyCells.length > 0 ? 
            emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
    }

    // Check for win or draw
    function checkResult() {
        let roundWon = false;

        // Check all winning conditions
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;

            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                // Highlight winning cells
                document.querySelectorAll(`.cell[data-index="${a}"], .cell[data-index="${b}"], .cell[data-index="${c}"]`)
                    .forEach(cell => cell.classList.add('winner'));
                break;
            }
        }

        // If won
        if (roundWon) {
            endGame();
            
            if (gameMode === 'single') {
                if (currentPlayer === 'X') {
                    scores.wins++;
                    currentPlayerDisplay.innerHTML = `You Win! <span class="result-emoji">🎉</span>`;
                } else {
                    scores.losses++;
                    currentPlayerDisplay.innerHTML = `Computer Wins! <span class="result-emoji">😢</span>`;
                }
            } else {
                currentPlayerDisplay.innerHTML = `Player ${currentPlayer} Wins! <span class="result-emoji">🎉</span>`;
            }
            
            currentPlayerDisplay.style.color = currentPlayer === 'X' ? '#e94560' : '#05c46b';
            updateScoreBoard();
            autoRestart();
            return;
        }

        // If draw
        if (!gameState.includes('')) {
            endGame();
            scores.ties++;
            currentPlayerDisplay.innerHTML = `Game Ended in a Draw! <span class="result-emoji">🤝</span>`;
            currentPlayerDisplay.style.color = '#0fbcf9';
            updateScoreBoard();
            autoRestart();
            return;
        }

        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;
        currentPlayerDisplay.style.color = currentPlayer === 'X' ? '#e94560' : '#05c46b';

        // If single player and computer's turn
        if (gameMode === 'single' && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }

    // End the current game
    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
    }

    // Auto restart the game after delay
    function autoRestart() {
        showNotification("New game starting in 5 seconds...");
        autoRestartTimeout = setTimeout(() => {
            initializeGame();
        }, 5000);
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'auto-restart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Update the score board
    function updateScoreBoard() {
        if (gameMode === 'single') {
            scoreBoard.innerHTML = `
                Wins: <span>${scores.wins}</span> | 
                Losses: <span>${scores.losses}</span> | 
                Ties: <span>${scores.ties}</span>
            `;
        } else {
            scoreBoard.innerHTML = `
                Player X Wins: <span>${scores.wins}</span> | 
                Player O Wins: <span>${scores.losses}</span> | 
                Ties: <span>${scores.ties}</span>
            `;
        }
    }
});
