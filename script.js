// Game state variables
var homeScore = 0;
var awayScore = 0;
var pointsPlayed = 0;
var offenseTeam = 'home'; // Tracks which team is currently receiving on offense
var halfTimeTaken = false;
var simTimer = null;      // Holds the interval timer ID
var isRunning = false;

// Randomized play descriptions for point commentary
var plays = [
  "threads a 50-yard backhand huck into the back corner for the score!",
  "grinds out a 14-pass possession before hitting a crisp flick in the endzone.",
  "gets a massive layout D at mid-field and converts the fast break!",
  "launches a high-release hammer over the zone defense for a clean grab!",
  "capitalizes on a stall-out turnover and punches in a quick goal.",
  "skies a pack of defenders in the endzone to haul in a floaty deep shot!",
  "intercepts a swing pass in the endzone for a huge Callahan goal!",
  "works the disc cleanly up the break side for an effortless score."
];

// Syncs input fields with the scoreboard team headers
function updateTeamHeaders() {
  var homeInput = document.getElementById('home-name').value.trim() || "Home";
  var awayInput = document.getElementById('away-name').value.trim() || "Away";
  document.getElementById('display-home-name').textContent = homeInput;
  document.getElementById('display-away-name').textContent = awayInput;
  return { home: homeInput, away: awayInput };
}

// Updates which team is pulling (D) vs receiving (O) on the scoreboard
function updateOffenseIndicator() {
  document.getElementById('home-offense').textContent = offenseTeam === 'home' ? 'PULLING / ON D' : 'RECEIVING / ON O';
  document.getElementById('away-offense').textContent = offenseTeam === 'away' ? 'PULLING / ON D' : 'RECEIVING / ON O';
}

// Prepends a new commentary entry to the top of the play log
function addLog(message, type, showScore) {
  var logList = document.getElementById('play-log');
  var li = document.createElement('li');
  li.className = 'log-item ' + (type || 'system');

  var textSpan = document.createElement('span');
  textSpan.textContent = message;
  li.appendChild(textSpan);

  // Attach the current score pill if a point was scored
  if (showScore) {
    var scoreSpan = document.createElement('span');
    scoreSpan.className = 'log-score';
    scoreSpan.textContent = homeScore + ' - ' + awayScore;
    li.appendChild(scoreSpan);
  }

  logList.prepend(li);
}

// Evaluates official Ultimate win conditions (to 15, win by 2, hard cap at 17)
function checkWinner() {
  var teams = updateTeamHeaders();
  if ((homeScore >= 15 && homeScore - awayScore >= 2) || homeScore === 17) return teams.home;
  if ((awayScore >= 15 && awayScore - homeScore >= 2) || awayScore === 17) return teams.away;
  return null;
}

// Simulates a single point, updates scores, and checks for half-time or game end
function simulatePoint() {
  var teams = updateTeamHeaders();
  pointsPlayed++;
  document.getElementById('point-counter').textContent = 'Points Played: ' + pointsPlayed;

  // Offense has a 58% chance to hold; defense has a 42% chance to break
  var offenseScores = Math.random() < 0.58;
  var scoringTeam = offenseScores ? offenseTeam : (offenseTeam === 'home' ? 'away' : 'home');
  var tag = offenseScores ? '[HOLD] ' : '[BREAK] ';

  // Increment score for the scoring team
  if (scoringTeam === 'home') {
    homeScore++;
    document.getElementById('home-score').textContent = homeScore;
  } else {
    awayScore++;
    document.getElementById('away-score').textContent = awayScore;
  }

  // Build and log the commentary line
  var teamName = scoringTeam === 'home' ? teams.home : teams.away;
  var playDesc = plays[Math.floor(Math.random() * plays.length)];
  var logType = scoringTeam === 'home' ? 'goal-home' : 'goal-away';

  addLog(tag + teamName + ' ' + playDesc, logType, true);

  // Scoring team pulls on the next point, flipping possession
  offenseTeam = scoringTeam === 'home' ? 'away' : 'home';
  updateOffenseIndicator();

  // Check for half-time (first team to 8) or Universe Point (16-16)
  var statusBadge = document.getElementById('game-status');
  if (!halfTimeTaken && (homeScore === 8 || awayScore === 8)) {
    halfTimeTaken = true;
    statusBadge.textContent = 'Half-Time';
    statusBadge.className = 'status-badge halftime';
    addLog('HALF-TIME! ' + teams.home + ' ' + homeScore + ', ' + teams.away + ' ' + awayScore + '.', 'system', false);
  } else {
    statusBadge.textContent = (homeScore === 16 && awayScore === 16) ? 'Universe Point!' : 'In Progress';
    statusBadge.className = 'status-badge';
  }

  // Stop simulation and announce winner if win condition is met
  var winner = checkWinner();
  if (winner) {
    recordCompletedGame(winner, teams.home, teams.away, homeScore, awayScore);
    clearInterval(simTimer);
    isRunning = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('home-name').disabled = false;
    document.getElementById('away-name').disabled = false;
    document.getElementById('home-offense').textContent = '';
    document.getElementById('away-offense').textContent = '';

    statusBadge.textContent = 'Final - ' + winner + ' Wins!';
    statusBadge.className = 'status-badge final';
    addLog('GAME OVER! ' + winner + ' wins (' + homeScore + ' - ' + awayScore + ').', 'system', false);
  }
}

// Starts the simulation loop using the selected speed interval
function startSimulation() {
  if (isRunning) return;
  if (checkWinner()) resetGame();

  var teams = updateTeamHeaders();
  savePreferences()
  isRunning = true;
  document.getElementById('start-btn').disabled = true;
  document.getElementById('home-name').disabled = true;
  document.getElementById('away-name').disabled = true;

  var statusBadge = document.getElementById('game-status');
  statusBadge.textContent = 'In Progress';
  statusBadge.className = 'status-badge';

  // Flip the disc at the start of a fresh game
  if (pointsPlayed === 0) {
    document.getElementById('play-log').innerHTML = '';
    offenseTeam = Math.random() < 0.5 ? 'home' : 'away';
    var receivingTeam = offenseTeam === 'home' ? teams.home : teams.away;
    addLog('Disc flip complete! ' + receivingTeam + ' receives the opening pull.', 'system', false);
  }

  updateOffenseIndicator();
  var speed = parseInt(document.getElementById('sim-speed').value, 10);
  simTimer = setInterval(simulatePoint, speed);
}

// Resets all scores, timers, and UI elements back to pre-game state
function resetGame() {
  clearInterval(simTimer);
  isRunning = false;
  homeScore = 0;
  awayScore = 0;
  pointsPlayed = 0;
  halfTimeTaken = false;

  updateTeamHeaders();
  document.getElementById('home-score').textContent = '0';
  document.getElementById('away-score').textContent = '0';
  document.getElementById('point-counter').textContent = 'Points Played: 0';
  document.getElementById('home-offense').textContent = '';
  document.getElementById('away-offense').textContent = '';

  var statusBadge = document.getElementById('game-status');
  statusBadge.textContent = 'Ready for Pull';
  statusBadge.className = 'status-badge';

  document.getElementById('start-btn').disabled = false;
  document.getElementById('home-name').disabled = false;
  document.getElementById('away-name').disabled = false;
  document.getElementById('play-log').innerHTML = '<li class="log-item system">Click "Simulate" to flip the disc and start the match.</li>';
}

// Load saved preferences, series record, and match history on page load
function loadSavedData() {
  // 1. Restore team names and speed preference
  var savedHome = localStorage.getItem('ult_home_name');
  var savedAway = localStorage.getItem('ult_away_name');
  var savedSpeed = localStorage.getItem('ult_sim_speed');

  if (savedHome) document.getElementById('home-name').value = savedHome;
  if (savedAway) document.getElementById('away-name').value = savedAway;
  if (savedSpeed) document.getElementById('sim-speed').value = savedSpeed;
  updateTeamHeaders();

  // 2. Restore series record
  updateSeriesDisplay();

  // 3. Restore match history list
  renderHistory();
}

// Save team names and speed whenever the user changes them
function savePreferences() {
  localStorage.setItem('ult_home_name', document.getElementById('home-name').value.trim());
  localStorage.setItem('ult_away_name', document.getElementById('away-name').value.trim());
  localStorage.setItem('ult_sim_speed', document.getElementById('sim-speed').value);
}

// Update the All-Time Series display from localStorage
function updateSeriesDisplay() {
  var homeWins = parseInt(localStorage.getItem('ult_home_wins') || '0', 10);
  var awayWins = parseInt(localStorage.getItem('ult_away_wins') || '0', 10);
  var teams = updateTeamHeaders();
  document.getElementById('series-record').textContent =
    'All-Time Series: ' + teams.home + ' ' + homeWins + ' — ' + teams.away + ' ' + awayWins;
}

// Save a finished game to localStorage
function recordCompletedGame(winnerName, homeTeam, awayTeam, hScore, aScore) {
  // Increment win counter
  if (winnerName === homeTeam) {
    var hWins = parseInt(localStorage.getItem('ult_home_wins') || '0', 10) + 1;
    localStorage.setItem('ult_home_wins', hWins);
  } else {
    var aWins = parseInt(localStorage.getItem('ult_away_wins') || '0', 10) + 1;
    localStorage.setItem('ult_away_wins', aWins);
  }
  updateSeriesDisplay();

  // Parse existing history array (or default to empty array)
  var history = JSON.parse(localStorage.getItem('ult_match_history') || '[]');
  var entry = winnerName + ' defeated ' + (winnerName === homeTeam ? awayTeam : homeTeam) + ' (' + hScore + ' - ' + aScore + ')';

  // Add newest game to the front and keep only the last 5 games
  history.unshift(entry);
  if (history.length > 5) history.pop();

  localStorage.setItem('ult_match_history', JSON.stringify(history));
  renderHistory();
}

// Render saved match history items into the UI
function renderHistory() {
  var history = JSON.parse(localStorage.getItem('ult_match_history') || '[]');
  var historyList = document.getElementById('history-log');
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<li class="log-item system">No completed games saved yet.</li>';
    return;
  }

  for (var i = 0; i < history.length; i++) {
    var li = document.createElement('li');
    li.className = 'log-item';
    li.textContent = history[i];
    historyList.appendChild(li);
  }
}

// Wipe saved history and series wins
function clearHistory() {
  localStorage.removeItem('ult_match_history');
  localStorage.removeItem('ult_home_wins');
  localStorage.removeItem('ult_away_wins');
  updateSeriesDisplay();
  renderHistory();
}


// Attach click event listeners to the control buttons
document.getElementById('start-btn').addEventListener('click', startSimulation);
document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
loadSavedData();

