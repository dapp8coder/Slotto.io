//@ts-check

function initBonusSend() {
    document.getElementById("results").style.display = "none";
}

async function updateBonuses() {
    document.getElementById("bonusButton").style.display = "none";
    document.getElementById("results").style.display = "block";
    document.getElementById("outstandingTickets").innerHTML = "loading..";
    console.clear();

    // @ts-ignore
    let sender = document.getElementById("sender").value;

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

    let outstandingStr = "";

    console.log(watcher.outstandingTickets);

    for (let i = 0; i < watcher.outstandingTickets.length; i++) {
        outstandingStr += watcher.outstandingTickets[i].op[1].from + " " + watcher.outstandingTickets[i].op[1].memo + " " + watcher.outstandingTickets[i].timestamp + "<br>";
    }

    document.getElementById("outstandingTickets").innerHTML = outstandingStr;

    let d = new Date();
    console.log("");
    console.log("check time: " + d);

    console.log("");
    console.log("updating again in 3 mins");
    setTimeout("updateBonuses();", 3 * 60 * 1000);
}