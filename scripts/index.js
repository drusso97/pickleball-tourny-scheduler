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

function generateSchedule() {
    // let schedule = [];
    let usedPairs = new Set();

    for (let round = 1; round <= numRounds; round++) {
        let availablePlayers = [...players];
        let matches = [];

        while (availablePlayers.length >= 4) {
            let [p1, p2, p3, p4] = availablePlayers.splice(0, 4);
            let team1 = [p1, p2];
            let team2 = [p3, p4];

            let matchKey = `${p1}-${p2} vs ${p3}-${p4}`;
            if (usedPairs.has(matchKey)) continue; // Avoid exact rematches

            matches.push({ team1, team2, score: null });
            usedPairs.add(matchKey);
        }

        schedule.push({ round, matches });
    }

    displaySchedule(schedule);
}

function displaySchedule(schedule) {
    const scheduleContainer = document.createElement("div");
    scheduleContainer.classList.add("schedule-container");

    schedule.forEach((round) => {
        let roundDiv = document.createElement("div");
        roundDiv.innerHTML = `<h3>Round ${round.round}</h3>`;

        round.matches.forEach((match, index) => {
            let matchDiv = document.createElement("div");
            matchDiv.innerHTML = `
                <p>${match.team1.join(" & ")} vs ${match.team2.join(" & ")}</p>
                <input type="text" placeholder="Team 1 Score" id="score1-${round.round}-${index}">
                <input type="text" placeholder="Team 2 Score" id="score2-${round.round}-${index}">
                <button onclick="submitScore(${round.round}, ${index})">Submit</button>
            `;
            roundDiv.appendChild(matchDiv);
        });

        scheduleContainer.appendChild(roundDiv);
    });

    document.body.appendChild(scheduleContainer);
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


function addPlayerToStandings(playerName, pointsScored, pointsAllowed) {
    if (!playerName) {
        alert("Please enter a player name.");
        return;
    }

    let wins;
    let losses;

    const standingsTable = document.getElementById('standings-table');
    const row = standingsTable.insertRow(standingsTable.rows.length);
    const nameCell = row.insertCell(0);
    const pointsScoredCell = row.insertCell(1);
    const pointsAllowedCell = row.insertCell(2);
    const pointDifferentialCell = row.insertCell(3);
    const deleteOrAddCell = row.insertCell(4);
    const winsCell = row.insertCell(5);
    const lossesCell = row.insertCell(6);

    nameCell.innerHTML = playerName;
    pointsScoredCell.innerHTML = pointsScored;
    pointsAllowedCell.innerHTML = pointsAllowed;
    pointDifferentialCell.innerHTML = pointsScoredCell.innerHTML - pointsAllowedCell.innerHTML;

    if (parseInt(pointsScored) > parseInt(pointsAllowed)) {
        wins = 1
        losses = 0
    } else {
        wins = 0
        losses = 1
    }

    winsCell.innerHTML = wins;
    lossesCell.innerHTML = losses;

    const addGameButton = document.createElement("button");
    addGameButton.innerHTML = "Add Game";
    addGameButton.classList.add('add-game-button');

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.classList.add('delete-button');

    // Add event listener for the delete button
    deleteButton.addEventListener("click", function() {
        standingsTable.deleteRow(row.rowIndex);
    });

    // Add event listener for the edit button
    addGameButton.addEventListener("click", function() {
        addGame(row.rowIndex);
    })

    deleteOrAddCell.appendChild(addGameButton);
    deleteOrAddCell.appendChild(deleteButton);
    updateStandings()
}

function addGame(playerRowIndex) {
    const standingsTable = document.getElementById('standings-table');

    // Create a temporary row beneath the player row to input game scores
    const row = standingsTable.insertRow(playerRowIndex + 1);
    const blankCell = row.insertCell(0);
    const pointsScoredCell = row.insertCell(1);
    const pointsAllowedCell = row.insertCell(2);
    const saveGameCell = row.insertCell(3);

    pointsScoredCell.innerHTML = `<input type="number" id="game-scored" placeholder="Points Scored">`;
    pointsAllowedCell.innerHTML = `<input type="number" id="game-allowed" placeholder="Points Allowed">`;

    const saveGameButton = document.createElement("button");
    saveGameButton.innerHTML = "Save Game";

    saveGameButton.addEventListener("click", function() {
        const pointsScored = parseInt(document.getElementById("game-scored").value, 10);
        const pointsAllowed = parseInt(document.getElementById("game-allowed").value, 10);

        if (pointsScored < 0 || pointsAllowed < 0) {
            alert("Please enter valid scores for the game.");
            return;
        }

        // Update the main player's row
        const playerRow = standingsTable.rows[playerRowIndex];
        const pointsScoredCell = playerRow.cells[1];
        const pointsAllowedCell = playerRow.cells[2];
        const pointDifferentialCell = playerRow.cells[3];
        const winsCell = playerRow.cells[5];
        const lossesCell = playerRow.cells[6];

        const currentPointsScored = parseInt(pointsScoredCell.innerHTML, 10);
        const currentPointsAllowed = parseInt(pointsAllowedCell.innerHTML, 10);

        pointsScoredCell.innerHTML = currentPointsScored + pointsScored;
        pointsAllowedCell.innerHTML = currentPointsAllowed + pointsAllowed;
        pointDifferentialCell.innerHTML = (currentPointsScored + pointsScored) - (currentPointsAllowed + pointsAllowed);

        if (parseInt(pointsScored) > parseInt(pointsAllowed)) {
            winsCell.innerHTML++;
        } else {
            lossesCell.innerHTML++;
        }

        // Remove the temporary row
        standingsTable.deleteRow(row.rowIndex);

        updateStandings()
    });

    saveGameCell.appendChild(saveGameButton);
}

const standings = {};

function submitScore(round, matchIndex) {
    const score1 = parseInt(document.getElementById(`score1-${round}-${matchIndex}`).value);
    const score2 = parseInt(document.getElementById(`score2-${round}-${matchIndex}`).value);

    if (isNaN(score1) || isNaN(score2)) {
        alert("Enter valid scores!");
        return;
    }

    const match = schedule[round - 1].matches[matchIndex];

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
    standingsTable.innerHTML = `<tr><th>Player</th><th>Wins</th><th>Losses</th><th>Points Scored</th><th>Points Allowed</th></tr>`;

    Object.entries(standings)
        .sort((a, b) => b[1].wins - a[1].wins) // Sort by wins
        .forEach(([player, stats]) => {
            let row = standingsTable.insertRow();
            row.innerHTML = `<td>${player}</td><td>${stats.wins}</td><td>${stats.losses}</td><td>${stats.pointsScored}</td><td>${stats.pointsAllowed}</td>`;
        });
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".add-player-standings-button").addEventListener("click", function() {
        const playerName = document.getElementById('player-name').value
        const pointsScored = document.getElementById('points-scored').value
        const pointsAllowed = document.getElementById('points-allowed').value

        addPlayerToStandings(playerName, pointsScored, pointsAllowed);

        document.getElementById('player-name').value = ''
        document.getElementById('points-scored').value = ''
        document.getElementById('points-allowed').value = ''
    });
});