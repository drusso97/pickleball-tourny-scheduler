function addPlayer(playerName, pointsScored, pointsAllowed) {
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

function updateStandings() {
    const standingsTable = document.getElementById('standings-table');
    const rowsArray = Array.from(standingsTable.rows).slice(1);

    // Sort rows by point differential (column index 3) in descending order
    rowsArray.sort((rowA, rowB) => {
        const diffA = parseInt(rowA.cells[3].innerHTML, 10);
        const diffB = parseInt(rowB.cells[3].innerHTML, 10);
        return diffB - diffA; // Descending order
    });

    rowsArray.forEach(row => standingsTable.appendChild(row));
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".add-player-button").addEventListener("click", function() {
        const playerName = document.getElementById('player-name').value
        const pointsScored = document.getElementById('points-scored').value
        const pointsAllowed = document.getElementById('points-allowed').value

        addPlayer(playerName, pointsScored, pointsAllowed);

        document.getElementById('player-name').value = ''
        document.getElementById('points-scored').value = ''
        document.getElementById('points-allowed').value = ''
    });
});