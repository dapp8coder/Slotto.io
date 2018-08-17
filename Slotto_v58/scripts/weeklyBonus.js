//@ts-check

function initWeeklyBonus() {
    document.getElementById("results").style.display = "none";
}

async function updateWeeklyBonus() {
    document.getElementById("bonusButton").style.display = "none";
    document.getElementById("results").style.display = "block";
    document.getElementById("eligibleTickets").innerHTML = "loading..";
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
}

async function setCheckpoint() {
    // @ts-ignore
    let sender = document.getElementById("cpMarker").value;
    // @ts-ignore
    let senderKey = document.getElementById("cpKey").value;
    // @ts-ignore
    let receiver = document.getElementById("sender").value;
    let amount = "0.001 STEEM";
    let message = "bonus checkpoint"

    await simpleSend(senderKey, sender, receiver, amount, message);
}

async function confirmCheckpoint() {
    // @ts-ignore
    let sender = document.getElementById("sender").value;
    // @ts-ignore
    let senderKey = document.getElementById("senderKey").value;
    // @ts-ignore
    let receiver = document.getElementById("cpMarker").value;
    let amount = "0.001 STEEM";
    let message = "bonus checkpoint"

    await simpleSend(senderKey, sender, receiver, amount, message);
}

async function simpleSend(key, sender, receiver, amount, message) {
    let result = null;
    try {
        // @ts-ignore
        result = await steem.broadcast.transferAsync(key, sender, receiver, amount, message);
    } catch (err) {
        console.log(err);
    } finally {
        console.log(result);
    }
}