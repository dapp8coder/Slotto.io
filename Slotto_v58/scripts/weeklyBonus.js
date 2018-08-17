//@ts-check

function initWeeklyBonus() {
    document.getElementById("results").style.display = "none";
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
    document.getElementById("results").style.display = "block";
    document.getElementById("eligibleTickets").innerHTML = "loading..";
    document.getElementById("luckyWinner").innerHTML = "loading..";

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

    await sortCandidates(t.result);
    pickCandidate();
}

async function sortCandidates(data) {
    let startAddingCandidates = false;
    let str = "";
    candidatesArray = new Array();

    for (let i = 0; i < data.length; i++) {
        let transfer = data[i];
        if (transfer.op[1].from == "slotto.game") {
            if (transfer.op[1].memo.includes("checkpoint")) {
                if (startAddingCandidates == false) {
                    console.log("");
                    console.log("---start adding candidates---");
                    console.log(transfer);
                    startAddingCandidates = true;
                } else {
                    startAddingCandidates = false;
                    console.log("");
                    console.log("---end of candidates---");
                    console.log(transfer);
                    break;
                }
            }
        }

        if (startAddingCandidates) {
            // @ts-ignore
            if (isSlottoFormat(transfer)) {
                if (transfer.op[1].from != "slotto.gen") {
                    str += transfer.op[1].from + " " + transfer.op[1].memo + "<br>";
                    candidatesArray.push(transfer.op[1].from);
                }
            }
        }

        document.getElementById("eligibleTickets").innerHTML = str;
    }

    console.log("");
    console.log("---bonus candidates---");
    console.log(candidatesArray);
}

function pickCandidate() {
    // @ts-ignore fortunaGenerator.js
    let luckyIndex = getFortunaRand(0, candidatesArray.length, 0);
    luckyIndex = Number(luckyIndex);
    let winner = candidatesArray[luckyIndex];

    console.log("");
    console.log("---lucky winner---");
    console.log(luckyIndex);
    console.log(winner);

    document.getElementById("luckyWinner").innerHTML = winner;
    luckyWinner = winner;
}

async function sendSmallPot() {
    // @ts-ignore
    let sender = document.getElementById("sender").value;
    // @ts-ignore
    let senderKey = document.getElementById("senderKey").value;
    // @ts-ignore
    let amount = document.getElementById("bonusAmount").value;
    amount = String(Number(amount).toFixed(3)) + " STEEM";
    let message = "bonus"

    await simpleSend(senderKey, sender, luckyWinner, amount, message);
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
let luckyWinner = null;