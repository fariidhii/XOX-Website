
document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { X: 0, O: 0 };
    let round = 1;
    let vsAI = false;
    let winningCells = [];
    
    // DOM elements
    const boardElement = document.querySelector('.grid');
    const currentPlayerElement = document.getElementById('current-player');
    const gameStatusElement = document.getElementById('game-status');
    const scoreXElement = document.getElementById('score-x');
    const scoreOElement = document.getElementById('score-o');
    const roundElement = document.getElementById('round');
    const restartBtn = document.getElementById('restart-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const aiToggle = document.getElementById('ai-toggle');
    const drawLineElement = document.getElementById('draw-line');
    const confettiCanvas = document.getElementById('confetti-canvas');
    
    // Initialize the board
    function initializeBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'bg-white', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'text-5xl', 'font-bold', 'cursor-pointer', 'shadow-md');
            cell.dataset.index = i;
            cell.addEventListener('click', () => handleCellClick(i));
            boardElement.appendChild(cell);
        }
    }
    
    // Handle cell click
    function handleCellClick(index) {
        if (!gameActive || board[index] !== '') return;
        
        // Human move
        makeMove(index, currentPlayer);
        
        // Check if game continues
        if (gameActive && vsAI && currentPlayer === 'O') {
            setTimeout(() => {
                makeAIMove();
            }, 500);
        }
    }
    
    // Make a move
    function makeMove(index, player) {
        board[index] = player;
        const cell = boardElement.children[index];
        cell.textContent = player;
        cell.classList.add('disabled');
        cell.classList.add(player === 'X' ? 'text-blue-500' : 'text-purple-500');
        
        // Check for win or draw
        const gameResult = checkGameResult();
        if (gameResult) {
            handleGameResult(gameResult);
        } else {
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            currentPlayerElement.textContent = currentPlayer;
            currentPlayerElement.className = currentPlayer === 'X' ? 'text-2xl font-bold text-blue-500' : 'text-2xl font-bold text-purple-500';
        }
    }
    
    // AI move logic (simple implementation)
    function makeAIMove() {
        if (!gameActive) return;
        
        // Simple AI: first try to win, then block, then random
        let move = findWinningMove('O') || findWinningMove('X') || findRandomMove();
        
        if (move !== null) {
            setTimeout(() => {
                makeMove(move, 'O');
            }, 300);
        }
    }
    
    function findWinningMove(player) {
        // Check rows
        for (let i = 0; i < 9; i += 3) {
            const row = [board[i], board[i+1], board[i+2]];
            if (row.filter(cell => cell === player).length === 2 && row.includes('')) {
                return i + row.indexOf('');
            }
        }
        
        // Check columns
        for (let i = 0; i < 3; i++) {
            const col = [board[i], board[i+3], board[i+6]];
            if (col.filter(cell => cell === player).length === 2 && col.includes('')) {
                return i + (col.indexOf('') * 3);
            }
        }
        
        // Check diagonals
        const diag1 = [board[0], board[4], board[8]];
        if (diag1.filter(cell => cell === player).length === 2 && diag1.includes('')) {
            return [0, 4, 8][diag1.indexOf('')];
        }
        
        const diag2 = [board[2], board[4], board[6]];
        if (diag2.filter(cell => cell === player).length === 2 && diag2.includes('')) {
            return [2, 4, 6][diag2.indexOf('')];
        }
        
        return null;
    }
    
    function findRandomMove() {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') availableMoves.push(i);
        }
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : null;
    }
    
    // Check game result
    function checkGameResult() {
        // Check rows
        for (let i = 0; i < 9; i += 3) {
            if (board[i] && board[i] === board[i+1] && board[i] === board[i+2]) {
                winningCells = [i, i+1, i+2];
                return { winner: board[i], line: 'row', index: i / 3 };
            }
        }
        
        // Check columns
        for (let i = 0; i < 3; i++) {
            if (board[i] && board[i] === board[i+3] && board[i] === board[i+6]) {
                winningCells = [i, i+3, i+6];
                return { winner: board[i], line: 'column', index: i };
            }
        }
        
        // Check diagonals
        if (board[0] && board[0] === board[4] && board[0] === board[8]) {
            winningCells = [0, 4, 8];
            return { winner: board[0], line: 'diagonal', index: 0 };
        }
        
        if (board[2] && board[2] === board[4] && board[2] === board[6]) {
            winningCells = [2, 4, 6];
            return { winner: board[2], line: 'diagonal', index: 1 };
        }
        
        // Check for draw
        if (!board.includes('')) {
            return { winner: null };
        }
        
        return null;
    }
    
    // Handle game result
    function handleGameResult(result) {
        gameActive = false;
        
        if (result.winner) {
            // Update scores
            scores[result.winner]++;
            updateScores();
            
            // Display win message
            gameStatusElement.textContent = `Player ${result.winner} wins!`;
            gameStatusElement.className = 'text-center text-lg font-semibold ' + 
                (result.winner === 'X' ? 'text-blue-500' : 'text-purple-500');
            
            // Highlight winning cells
            winningCells.forEach(index => {
                boardElement.children[index].classList.add('winning-cell');
            });
            
            // Draw winning line
            drawWinningLine(result.line, result.index);
            
            // Show confetti for winner
            showConfetti();
        } else {
            // Draw
            gameStatusElement.textContent = "Game ended in a draw!";
            gameStatusElement.className = 'text-center text-lg font-semibold text-gray-700';
        }
        
        // Increment round if someone won
        if (result.winner) {
            round++;
            roundElement.textContent = round;
        }
    }
    
    // Draw winning line
    function drawWinningLine(line, index) {
        const boardRect = boardElement.getBoundingClientRect();
        const cellSize = boardRect.width / 3;
        
        let startX, startY, endX, endY;
        
        switch (line) {
            case 'row':
                startX = 0;
                startY = (index * cellSize) + (cellSize / 2);
                endX = boardRect.width;
                endY = startY;
                break;
            case 'column':
                startX = (index * cellSize) + (cellSize / 2);
                startY = 0;
                endX = startX;
                endY = boardRect.height;
                break;
            case 'diagonal':
                if (index === 0) {
                    startX = 0;
                    startY = 0;
                    endX = boardRect.width;
                    endY = boardRect.height;
                } else {
                    startX = boardRect.width;
                    startY = 0;
                    endX = 0;
                    endY = boardRect.height;
                }
                break;
        }
        
        drawLineElement.style.width = line === 'column' ? '4px' : `${Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))}px`;
        drawLineElement.style.height = line === 'row' ? '4px' : '0';
        drawLineElement.style.left = `${startX}px`;
        drawLineElement.style.top = `${startY}px`;
        drawLineElement.style.transformOrigin = '0 0';
        
        if (line === 'diagonal') {
            const angle = index === 0 ? 
                Math.atan2(boardRect.height, boardRect.width) : 
                Math.atan2(boardRect.height, -boardRect.width);
            drawLineElement.style.transform = `rotate(${angle}rad)`;
        }
        
        drawLineElement.classList.remove('hidden');
    }
    
    // Update scores display
    function updateScores() {
        scoreXElement.textContent = scores.X;
        scoreOElement.textContent = scores.O;
    }
    
    // Reset the game (keep scores)
    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        winningCells = [];
        
        currentPlayerElement.textContent = currentPlayer;
        currentPlayerElement.className = 'text-2xl font-bold text-blue-500';
        gameStatusElement.textContent = "Game in progress";
        gameStatusElement.className = 'text-center text-lg font-semibold text-gray-700';
        
        drawLineElement.classList.add('hidden');
        initializeBoard();
    }
    
    // New game (reset everything)
    function newGame() {
        scores = { X: 0, O: 0 };
        round = 1;
        updateScores();
        roundElement.textContent = round;
        resetGame();
    }
    
    // Confetti effect
    function showConfetti() {
        confettiCanvas.style.display = 'block';
        
        // Confetti settings
        const confettiSettings = {
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b']
        };
        
        // Simple confetti implementation
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const particles = [];
        for (let i = 0; i < confettiSettings.particleCount; i++) {
            particles.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                size: Math.random() * 10 + 5,
                color: confettiSettings.colors[Math.floor(Math.random() * confettiSettings.colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                rotation: Math.random() * 0.2 - 0.1,
                rotationSpeed: Math.random() * 0.01 - 0.005
            });
        }
        
        let animationId;
        function animate() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            
            let stillActive = false;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.y += p.speed;
                p.angle += p.rotationSpeed;

                if (p.y < confettiCanvas.height) {
                    stillActive = true;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
            }
            
            if (stillActive) {
                animationId = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(animationId);
                confettiCanvas.style.display = 'none';
            }
        }
        
        animate();
        
        // Hide confetti after 3 seconds
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            confettiCanvas.style.display = 'none';
        }, 3000);
    }
    
    // Event listeners
    restartBtn.addEventListener('click', resetGame);
    newGameBtn.addEventListener('click', newGame);
    aiToggle.addEventListener('click', () => {
        vsAI = !vsAI;
        aiToggle.innerHTML = vsAI ? 
            '<i class="fas fa-user mr-2"></i>vs Human' : 
            '<i class="fas fa-robot mr-2"></i>vs AI';
        aiToggle.className = vsAI ? 
            'bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center' :
            'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center';
        resetGame();
    });
    
    // Initialize the game
    initializeBoard();
    
    // Responsive adjustments
    window.addEventListener('resize', () => {
        if (winningCells.length > 0) {
            const result = checkGameResult();
            if (result && result.winner) {
                drawWinningLine(result.line, result.index);
            }
        }
    });
});
