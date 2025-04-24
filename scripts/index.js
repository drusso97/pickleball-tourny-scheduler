let players = []; // Store players
let numRounds = 0;
let schedule = [];

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".add-player-to-schedule-button").addEventListener("click", function () {
        console.log("clicked");

        const playerNameInput = document.getElementById("playerName");
        const playerName = playerNameInput.value.trim();

        if (playerName === "") {
            alert("Please enter a player name!");
            return;
        }

        players.push(playerName);
        updatePlayerList();
        playerNameInput.value = "";
    });
});


function updatePlayerList() {
    const playerList = document.querySelector(".player-list");
    playerList.innerHTML = "";

    players.forEach((player, index) => {
        const li = document.createElement("li");
        li.textContent = player;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.addEventListener("click", function() {
            players.splice(index, 1);
            updatePlayerList();
        });

        li.appendChild(deleteButton);
        playerList.appendChild(li);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateSchedule() {
    schedule = [];
    let usedPairs = new Set();

    for (let round = 1; round <= numRounds; round++) {
        let availablePlayers = shuffleArray([...players]);
        let matches = [];

        while (availablePlayers.length >= 4) {
            let [p1, p2, p3, p4] = availablePlayers.splice(0, 4);
            let matchKey = `${p1}-${p2} vs ${p3}-${p4}`;

            if (usedPairs.has(matchKey)) continue;

            let team1 = [p1, p2];
            let team2 = [p3, p4];

            matches.push({ team1, team2, score: null });
            usedPairs.add(matchKey);
        }

        schedule.push({ round, matches });
    }

    displaySchedule(schedule);
}

function displaySchedule(schedule, isPlayoffs = false) {
    const scheduleContainer = document.querySelector(".schedule-container") || document.createElement("div");
    scheduleContainer.classList.add("schedule-container");
    scheduleContainer.innerHTML = ""; // Clear previous schedule

    schedule.forEach((round, roundIndex) => {
        let roundDiv = document.createElement("div");
        roundDiv.innerHTML = `<h3>${isPlayoffs ? 'Playoff' : 'Round'} ${round.round}</h3>`;

        round.matches.forEach((match, index) => {
            let matchDiv = document.createElement("div");
            matchDiv.innerHTML = `
                <p>${match.team1.join(" & ")} vs ${match.team2.join(" & ")}</p>
                <input type="text" placeholder="Team 1 Score" id="score1-${roundIndex}-${index}">
                <input type="text" placeholder="Team 2 Score" id="score2-${roundIndex}-${index}">
                <button onclick="submitScore(${roundIndex}, ${index})">Submit</button>
            `;
            roundDiv.appendChild(matchDiv);
        });

        scheduleContainer.appendChild(roundDiv);
    });

    document.body.appendChild(scheduleContainer);

    // Ensure the playoffs button is moved to bottom
    const playoffsButton = document.querySelector(".generate-playoffs-button");
    if (playoffsButton) {
        document.body.appendChild(playoffsButton);
    }
}


document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".generate-schedule-button").addEventListener("click", function () {
        numRounds = parseInt(document.getElementById("numRounds").value);
        if (players.length % 4 !== 0) {
            alert("Number of players must be a multiple of 4 for balanced doubles.");
            return;
        }
        if (numRounds < 1) {
            alert("Please enter a valid number of rounds.");
            return;
        }

        generateSchedule();
    });
});

const standings = {};

function submitScore(round, matchIndex) {
    const score1 = parseInt(document.getElementById(`score1-${round}-${matchIndex}`).value);
    const score2 = parseInt(document.getElementById(`score2-${round}-${matchIndex}`).value);

    if (isNaN(score1) || isNaN(score2)) {
        alert("Enter valid scores!");
        return;
    }

    const match = schedule[round].matches[matchIndex];

    match.team1.forEach(player => updateStandings(player, score1, score2));
    match.team2.forEach(player => updateStandings(player, score2, score1));

    updateStandingsTable();
}

function updateStandings(player, pointsScored, pointsAllowed) {
    if (!standings[player]) {
        standings[player] = { wins: 0, losses: 0, pointsScored: 0, pointsAllowed: 0 };
    }

    standings[player].pointsScored += pointsScored;
    standings[player].pointsAllowed += pointsAllowed;

    if (pointsScored > pointsAllowed) standings[player].wins++;
    else standings[player].losses++;
}

function updateStandingsTable() {
    const standingsTable = document.getElementById("standings-table");
    standingsTable.innerHTML = `<tr><th>Player</th><th>Wins</th><th>Losses</th><th>Points Scored</th><th>Points Allowed</th><th>Point Differential</th></tr>`;

    Object.entries(standings)
        .sort((a, b) => {
            const pa = a[1];
            const pb = b[1];
            const diffA = pa.pointsScored - pa.pointsAllowed;
            const diffB = pb.pointsScored - pb.pointsAllowed;

            // Sort by wins first, then point differential, then points scored
            return (
                pb.wins - pa.wins ||           // Wins DESC
                diffB - diffA ||               // Point differential DESC
                pb.pointsScored - pa.pointsScored // Points scored DESC
            );
        })
        .forEach(([player, stats]) => {
            let row = standingsTable.insertRow();
            row.innerHTML = `<td>${player}</td>
                         <td>${stats.wins}</td>
                         <td>${stats.losses}</td>
                         <td>${stats.pointsScored}</td>
                         <td>${stats.pointsAllowed}</td>
                         <td>${stats.pointsScored - stats.pointsAllowed}</td>`;
        });
}

function generatePlayoffSchedule() {
    const sortedPlayers = Object.entries(standings)
        .sort((a, b) => {
            const diffA = a[1].pointsScored - a[1].pointsAllowed;
            const diffB = b[1].pointsScored - b[1].pointsAllowed;
            return (
                b[1].wins - a[1].wins ||
                diffB - diffA ||
                b[1].pointsScored - a[1].pointsScored
            );
        })
        .map(([player]) => player);

    let topHalf = Math.ceil(sortedPlayers.length / 2);
    let playoffCount = topHalf;

    // Increase to nearest multiple of 4
    while (playoffCount % 4 !== 0) playoffCount++;

    const playoffPlayers = sortedPlayers.slice(0, playoffCount);
    const playoffTeams = [];

    for (let i = 0; i < playoffPlayers.length / 2; i += 2) {
        playoffTeams.push([playoffPlayers[i], playoffPlayers[i + 1]]);
        playoffTeams.push([playoffPlayers[playoffPlayers.length - 1 - i], playoffPlayers[playoffPlayers.length - 2 - i]]);
    }

    const playoffMatches = [];
    for (let i = 0; i < playoffTeams.length; i += 2) {
        playoffMatches.push({
            team1: playoffTeams[i],
            team2: playoffTeams[i + 1],
            score: null
        });
    }

    const playoffRound = { round: "Quarterfinals", matches: playoffMatches };
    schedule = [playoffRound]; // Clear existing schedule to focus on playoffs

    displaySchedule(schedule, true);
}
function submitPlayoffScore(matchIndex) {
    const score1 = parseInt(document.getElementById(`score1-${matchIndex}`).value);
    const score2 = parseInt(document.getElementById(`score2-${matchIndex}`).value);

    if (isNaN(score1) || isNaN(score2)) {
        alert("Enter valid scores!");
        return;
    }

    // Update standings based on playoff results
    const match = playoffSchedule[matchIndex];

    if (score1 > score2) {
        updateStandings(match.team1, score1, score2);  // Team 1 wins
        updateStandings(match.team2, score2, score1);  // Team 2 loses
    } else {
        updateStandings(match.team2, score2, score1);  // Team 2 wins
        updateStandings(match.team1, score1, score2);  // Team 1 loses
    }

    // Update playoff matchups for the next round
    // Continue creating next round matchups as necessary.
}


document.querySelector(".generate-schedule-button").addEventListener("click", function () {
    numRounds = parseInt(document.getElementById("numRounds").value);
    if (players.length % 4 !== 0) {
        alert("Number of players must be a multiple of 4 for balanced doubles.");
        return;
    }
    if (numRounds < 1) {
        alert("Please enter a valid number of rounds.");
        return;
    }

    generateSchedule();

    // const playoffsButton = document.querySelector(".generate-playoffs-button");
    // if (playoffsButton) {
    //     playoffsButton.style.display = "block";
    // }
});


