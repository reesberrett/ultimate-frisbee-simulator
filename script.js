var homeScore = 0;
var awayScore = 0;
var pointsPlayed = 0;
var offenseTeam = 'home';
var halfTimeTaken = false;
var simTimer = null;
var isRunning = false;

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

function updateTeamHeaders() {
  var homeInput = document.getElementById('home-name').value.trim() || "Home";
  var awayInput = document.getElementById('away-name').value.trim() || "Away";
  document.getElementById('display-home-name').textContent = homeInput;
  document.getElementById('display-away-name').textContent = awayInput;
  return { home: homeInput, away: awayInput };
}

function updateOffenseIndicator() {
  document.getElementById('home-offense').textContent = offenseTeam === 'home' ? 'PULLING / ON D' : 'RECEIVING / ON O';
  document.getElementById('away-offense').textContent = offenseTeam === 'away' ? 'PULLING / ON D' : 'RECEIVING / ON O';
}

function addLog(message, type, showScore) {
  var logList = document.getElementById('play-log');
  var li = document.createElement('li');
  li.className = 'log-item ' + (type || 'system');

  var textSpan = document.createElement('span');
  textSpan.textContent = message;
  li.appendChild(textSpan);

  if (showScore) {
    var scoreSpan = document.createElement('span');
    scoreSpan.className = 'log-score';
    scoreSpan.textContent = homeScore + ' - ' + awayScore;
    li.appendChild(scoreSpan);
  }

  logList.prepend(li);
}

function checkWinner() {
  var teams = updateTeamHeaders();
  if ((homeScore >= 15 && homeScore - awayScore >= 2) || homeScore === 17) return teams.home;
  if ((awayScore >= 15 && awayScore - homeScore >= 2) || awayScore === 17) return teams.away;
  return null;
}

function simulatePoint() {
  var teams = updateTeamHeaders();
  pointsPlayed++;
  document.getElementById('point-counter').textContent = 'Points Played: ' + pointsPlayed;

  var offenseScores = Math.random() < 0.58;
  var scoringTeam = offenseScores ? offenseTeam : (offenseTeam === 'home' ? 'away' : 'home');
  var tag = offenseScores ? '[HOLD] ' : '[BREAK] ';

  if (scoringTeam === 'home') {
    homeScore++;
    document.getElementById('home-score').textContent = homeScore;
  } else {
    awayScore++;
    document.getElementById('away-score').textContent = awayScore;
  }

  var teamName = scoringTeam === 'home' ? teams.home : teams.away;
  var playDesc = plays[Math.floor(Math.random() * plays.length)];
  var logType = scoringTeam === 'home' ? 'goal-home' : 'goal-away';

  addLog(tag + teamName + ' ' + playDesc, logType, true);

  offenseTeam = scoringTeam === 'home' ? 'away' : 'home';
  updateOffenseIndicator();

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

  var winner = checkWinner();
  if (winner) {
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

function startSimulation() {
  if (isRunning) return;
  if (checkWinner()) resetGame();

  var teams = updateTeamHeaders();
  isRunning = true;
  document.getElementById('start-btn').disabled = true;
  document.getElementById('home-name').disabled = true;
  document.getElementById('away-name').disabled = true;

  var statusBadge = document.getElementById('game-status');
  statusBadge.textContent = 'In Progress';
  statusBadge.className = 'status-badge';

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

document.getElementById('start-btn').addEventListener('click', startSimulation);
document.getElementById('reset-btn').addEventListener('click', resetGame);
