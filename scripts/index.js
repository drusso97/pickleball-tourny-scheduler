function addPlayer(playerName) {
    if (!playerName) {
        alert("Please enter a player name.");
        return;
    }

    var standingsTable = document.getElementById('standings-table');
    var row = standingsTable.insertRow(standingsTable.rows.length);
    var nameCell = row.insertCell(0);
    var pointsScoredCell = row.insertCell(1);
    var pointsAllowedCell = row.insertCell(2);
    var pointDifferentialCell = row.insertCell(3);

    nameCell.innerHTML = playerName; // Use the actual player name
    pointsScoredCell.innerHTML = 0; // Placeholder for additional data
    pointsAllowedCell.innerHTML = 0;
    pointDifferentialCell.innerHTML = pointsScoredCell.innerHTML - pointsAllowedCell.innerHTML;
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".add-player-button").addEventListener("click", function() {
        addPlayer(document.getElementById('player-name').value);
    });
});
