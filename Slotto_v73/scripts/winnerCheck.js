async function checkWinner() {
    document.getElementById("otTickets").innerHTML = "checking..";
    document.getElementById("winnerFound").innerHTML = "";

    // @ts-ignore
    let sender = "slotto.register";

    // @ts-ignore steemHistory.js
    let receivehistory = new SteemHistory(sender);
    // @ts-ignore steemHistory.js
    receivehistory.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await receivehistory.download();

    // @ts-ignore steemTransfers.js
    let receiveTransfers = new SteemTransfers();
    receiveTransfers.filterTransfers(null, sender, receivehistory.result);

    // @ts-ignore watcher.js
    let watcher = new Watcher();
    watcher.getWinners(receiveTransfers.result);

    let outstanding = watcher.outstandingTickets;
    let otstring = "";
    let winnerString = "";
    let winnersArray = new Array();

    otstring += "<br><h3>Outstanding Tickets</h3>";
    for (let i = 0; i < outstanding.length; i++) {
        otstring += outstanding[i].op[1].from + " " + outstanding[i].op[1].memo + "<br>";

        if (isMatch(outstanding[i].op[1].memo, document.getElementById("ticketCheck").value)) {
            winnersArray.push(outstanding[i]);
        }
    }
    otstring += "<br>total " + outstanding.length + " tickets<br>";


    if (winnersArray.length > 0) {
        console.log("");
        console.log("---winner check---");
        console.log(winnersArray);

        winnerString += "<br><h3>Winner Found!</h3>";
        for (let i = 0; i < winnersArray.length; i++) {
            winnerString += winnersArray[i].op[1].from + " " + winnersArray[i].op[1].memo + "<br>";

            winnerString += "<br>";
        }
    } else {
        winnerString += "<br><h3>No winner today!</h3>";
        winnerString += "Draw: " + document.getElementById("ticketCheck").value;
        winnerString += "<br>";
    }

    document.getElementById("otTickets").innerHTML = otstring;
    document.getElementById("winnerFound").innerHTML = winnerString;
}