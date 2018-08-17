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

async function takeSnapshot() {
    // @ts-ignore
    let sender = document.getElementById("sender").value;

    // @ts-ignore steemHistory.js
    let h = new SteemHistory(sender);
    // @ts-ignore steemHistory.js
    h.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await h.download();

    // @ts-ignore steemTransfers.js
    let t = new SteemTransfers();
    t.filterTransfers(null, sender, h.result);

    sortCandidates(t.result);
}

function sortCandidates(data) {
    let startAddingCandidates = false;
    let candidatesArray = new Array();

    for (let i = 0; i < data.length; i++) {
        let transfer = data[i];
        if (transfer.op[1].from == "slotto.game") {
            if (transfer.op[1].memo.includes("checkpoint")) {
                if (startAddingCandidates == false) {
                    console.log("");
                    console.log("start adding candidates");
                    console.log(transfer);
                    startAddingCandidates = true;
                } else {
                    startAddingCandidates = false;
                    console.log("stop adding");
                    break;
                }
            }
        }

        if (startAddingCandidates) {
            if (isSlottoFormat(transfer)) {
                candidatesArray.push(transfer.op[1].from);
            }
        }
    }

    console.log("");
    console.log("---bonus candidates---");
    console.log(candidatesArray);
}

async function simpleSend(key, sender, receiver, amount, message) {
    console.log("");
    console.log("---sending steem---");

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

let candidatesArray = null;