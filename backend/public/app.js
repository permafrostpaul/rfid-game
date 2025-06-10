// public/app.js - Final Complete Code

document.addEventListener("DOMContentLoaded", () => {
  // --- VIEWS ---
  const loginView = document.getElementById("login-view");
  const welcomeScreen = document.getElementById("welcome-screen");
  const difficultyView = document.getElementById("difficulty-view");
  const gameView = document.getElementById("game-view");
  const gameOverView = document.getElementById("game-over-view");
  const leaderboardView = document.getElementById("leaderboard-view");

  // --- ELEMENTS ---
  const allViews = [
    loginView,
    welcomeScreen,
    difficultyView,
    gameView,
    gameOverView,
    leaderboardView,
  ];
  const welcomeName = document.getElementById("welcome-name");
  const currentScoreDisplay = document.getElementById("current-score");
  const rankDisplay = document.getElementById("rank");
  const playButton = document.getElementById("play-button");
  const playerName = document.getElementById("player-name");
  const scoreDisplay = document.getElementById("score-display");
  const questionText = document.getElementById("question-text");
  const answerOptions = document.getElementById("answer-options");
  const feedbackText = document.getElementById("feedback-text");
  const finalScore = document.getElementById("final-score");
  const timerDisplay = document.getElementById("timer-display");
  const logoutBtn = document.getElementById("logout-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const leaderboardBody = document.getElementById("leaderboard-body");
  const topPlayersList = document.getElementById("top-players-list");
  const backToHomeBtn = document.getElementById("back-to-home-btn");
  const gameOverLogoutBtn = document.getElementById("gameOver-logout-btn");
  const questionIndicator = document.getElementById("question-indicator");

  // --- STATE VARIABLES ---
  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let timeLimit = 60; // Default time limit, will be changed based on difficulty
  let timeLeft = timeLimit;
  let timerInterval;
  let stateCheckInterval;
  let currentPlayer = null;

  // --- VIEW MANAGEMENT ---
  const showView = (viewId) => {
    allViews.forEach((view) => {
      if (view) view.classList.add("hidden");
    });
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) viewToShow.classList.remove("hidden");

    if (viewId === "leaderboard-view") {
      fetchAndDisplayLeaderboard();
    }
  };

  const fetchAndDisplayLeaderboard = async () => {
    if (!leaderboardBody || !topPlayersList) return;
    leaderboardBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    topPlayersList.innerHTML = '<p style="text-align: center;">Loading...</p>';
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();
      leaderboardBody.innerHTML = "";
      topPlayersList.innerHTML = "";
      if (!data || data.length === 0) {
        leaderboardBody.innerHTML =
          '<tr><td colspan="4">No scores yet.</td></tr>';
        topPlayersList.innerHTML =
          '<p style="text-align: center;">No top players yet.</p>';
        return;
      }
      data.forEach((student, index) => {
        const rank = index + 1;
        if (rank <= 3) {
          const topPlayerCard = document.createElement("div");
          topPlayerCard.classList.add("top-player-card");
          let rankIcon = "";
          if (rank === 1)
            rankIcon =
              '<i class="fas fa-medal rank-icon" style="color: gold;"></i>';
          else if (rank === 2)
            rankIcon =
              '<i class="fas fa-medal rank-icon" style="color: silver;"></i>';
          else if (rank === 3)
            rankIcon =
              '<i class="fas fa-medal rank-icon" style="color: #cd7f32;"></i>';
          topPlayerCard.innerHTML = `${rankIcon}<div class="player-info"><h3>${student.name}</h3><p>${student.student_number} - ${student.points} pts</p></div><div class="profile-pic"><i class="fas fa-user"></i></div>`;
          topPlayersList.appendChild(topPlayerCard);
        }
        const row = document.createElement("tr");
        row.innerHTML = `<td>${rank}</td><td>${student.name}</td><td>${student.student_number}</td><td>${student.points}</td>`;
        leaderboardBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      leaderboardBody.innerHTML =
        '<tr><td colspan="4">Could not load data.</td></tr>';
      topPlayersList.innerHTML =
        '<p style="text-align: center; color: var(--text-light);">Could not load data.</p>';
    }
  };

  // --- INITIALIZATION & GAME FLOW ---
  const initializePage = () => {
    showView("login-view");
    stateCheckInterval = setInterval(checkSystemState, 2000);
  };

  const checkSystemState = async () => {
    try {
      const response = await fetch("/api/game-state");
      const data = await response.json();
      if (data.status === "PLAYER_LOGGED_IN") {
        clearInterval(stateCheckInterval);
        showWelcomeScreen(data.player);
      } else if (data.status === "PENDING_REGISTRATION") {
        clearInterval(stateCheckInterval);
        window.location.href = `/signup.html?uid=${data.uid}`;
      }
    } catch (error) {
      console.error("Error checking system state:", error);
    }
  };

  const showWelcomeScreen = async (player) => {
    currentPlayer = player;
    welcomeName.textContent = player.name;
    currentScoreDisplay.textContent = player.points || "0";
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();
      const playerRank =
        data.findIndex((student) => student.rfid_uid === player.rfid_uid) + 1;
      rankDisplay.textContent = playerRank > 0 ? `#${playerRank}` : "-";
    } catch (error) {
      rankDisplay.textContent = "-";
    }
    showView("welcome-screen");
  };

  const showDifficultySelection = () => {
    showView("difficulty-view");
  };

  const fetchQuestionsAndStart = async (difficulty) => {
    try {
      const response = await fetch(`/api/game-state?difficulty=${difficulty}`);
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        questions = data.questions;
        startGame(data.player, difficulty);
      } else {
        alert(`No questions found for ${difficulty} difficulty.`);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const startGame = (player, difficulty) => {
    // Set time limit based on difficulty
    if (difficulty === 'hard') {
        timeLimit = 30; // 30 seconds for hard mode
    } else {
        timeLimit = 60; // 60 seconds for easy/medium
    }

    currentPlayer = player;
    showView("game-view");
    score = player.points; // Start with the player's current score
    playerName.textContent = player.name;
    scoreDisplay.textContent = score;
    currentQuestionIndex = 0;
    displayQuestion();
  };

  const displayQuestion = () => {
    if (currentQuestionIndex >= questions.length) {
      endGame();
      return;
    }
    clearInterval(timerInterval);
    timeLeft = timeLimit;
    timerDisplay.textContent = timeLeft;
    startTimer();
    feedbackText.textContent = "";

    // Update the question indicator
    questionIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    answerOptions.innerHTML = "";
    currentQuestion.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.classList.add("answer-btn");
      button.addEventListener("click", () =>
        handleAnswer(option, button, currentQuestion.id)
      );
      answerOptions.appendChild(button);
    });
  };

  const startTimer = () => {
    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = timeLeft;
      if (timeLeft <= 0) {
        handleTimeout();
      }
    }, 1000);
  };

  const handleTimeout = () => {
    clearInterval(timerInterval);
    feedbackText.textContent = "Time's up! Moving to the next question.";
    document
      .querySelectorAll(".answer-btn")
      .forEach((btn) => (btn.disabled = true));
    setTimeout(() => {
      currentQuestionIndex++;
      displayQuestion();
    }, 2000);
  };

  const handleAnswer = async (selectedAnswer, button, questionId) => {
    clearInterval(timerInterval);
    document
      .querySelectorAll(".answer-btn")
      .forEach((btn) => (btn.disabled = true));

    const response = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: selectedAnswer }),
    });
    const result = await response.json();
    score = result.newScore;
    scoreDisplay.textContent = score;

    if (result.correct) {
      feedbackText.textContent = "Correct!";
      button.classList.add("correct");
    } else {
      feedbackText.textContent = `Wrong! The correct answer was: ${result.correctAnswer}`;
      button.classList.add("wrong");

      const correctButton = Array.from(
        document.querySelectorAll(".answer-btn")
      ).find((btn) => btn.textContent === result.correctAnswer);
      if (correctButton) {
        correctButton.classList.add("correct");
      }
    }

    setTimeout(() => {
      currentQuestionIndex++;
      displayQuestion();
    }, 2000);
  };

  const endGame = () => {
    clearInterval(timerInterval);
    showView("game-over-view");
    finalScore.textContent = score;
    questionIndicator.textContent = ""; // Clear the indicator
  };

  // --- EVENT LISTENERS ---
  const performLogout = () => {
    clearInterval(stateCheckInterval);
    clearInterval(timerInterval);
    fetch("/api/logout", { method: "POST" })
      .then(() => {
        window.location.href = "/";
      })
      .catch(() => {
        window.location.href = "/"; // Go home even if the fetch fails
      });
  };

  playButton.addEventListener("click", () => showDifficultySelection());

  document.querySelectorAll(".difficulty-btn").forEach((button) => {
    button.addEventListener("click", () => {
      fetchQuestionsAndStart(button.dataset.difficulty);
    });
  });

  document.querySelectorAll(".view-change-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      showView(event.currentTarget.dataset.view);
    });
  });

  playAgainBtn.addEventListener("click", () => showDifficultySelection());

  // Attach logout to all three buttons
  logoutBtn.addEventListener("click", performLogout);
  backToHomeBtn.addEventListener("click", performLogout);
  gameOverLogoutBtn.addEventListener("click", performLogout);

  // --- START THE APPLICATION ---
  initializePage();
});