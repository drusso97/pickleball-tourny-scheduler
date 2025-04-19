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
    standingsTable.innerHTML = `<tr><th>Player</th><th>Wins</th><th>Losses</th><th>Points Scored</th><th>Points Allowed</th><th>Point Differential</th></tr>`;

    Object.entries(standings)
        .sort((a, b) => {
            const [pa, pb] = [a[1], b[1]];
            const diffA = pa.pointsScored - pa.pointsAllowed;
            const diffB = pb.pointsScored - pb.pointsAllowed;

            // Sort by wins, then point differential, then points scored
            return (
                b.wins - pa.wins ||        // Primary: Wins (desc)
                diffB - diffA ||           // Secondary: Point differential (desc)
                b.pointsScored - pa.pointsScored // Tertiary: Points scored (desc)
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