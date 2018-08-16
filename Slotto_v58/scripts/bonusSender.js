//@ts-check

function initBonusSend() {
    document.getElementById("results").style.display = "none";
}

async function updateBonuses() {
    document.getElementById("bonusButton").style.display = "none";
    document.getElementById("results").style.display = "block";
    document.getElementById("outstandingTickets").innerHTML = "loading..";
    document.getElementById("bonusesSent").innerHTML = "loading..";
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

    showOutstandingTickets(watcher.outstandingTickets);
    await sendBonuses(sender);

    let d = new Date();
    console.log("");
    console.log("check time: " + d);

    console.log("");
    console.log("updating again in 3 mins");
    setTimeout("updateBonuses();", 3 * 60 * 1000);
}

function showOutstandingTickets(outstanding) {
    let outstandingStr = "";
    outstandingDataArray = new Array();

    for (let i = 0; i < outstanding.length; i++) {
        let od = new OutstandingData();
        od.buyer = outstanding[i].op[1].from;
        od.ticket = outstanding[i].op[1].memo
        od.timestamp = outstanding[i].timestamp;

        outstandingDataArray.push(od);
        outstandingStr += od.buyer + " " + od.ticket + " " + od.timestamp + "<br>";
    }

    document.getElementById("outstandingTickets").innerHTML = outstandingStr;
}

async function sendBonuses(sender) {
    let bonusStr = "";

    // @ts-ignore
    let sendHistory = new SteemHistory(sender);
    // @ts-ignore
    sendHistory.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await sendHistory.download();

    // @ts-ignore
    let sendTransfers = new SteemTransfers();
    sendTransfers.filterTransfers(sender, null, sendHistory.result);

    for (let i = 0; i < sendTransfers.result.length; i++) {
        if (sendTransfers.result[i].op[1].to != "slotto.gen") {
            if (sendTransfers.result[i].op[1].memo.includes("bonus")) {
                console.log();
                bonusStr += sendTransfers.result[i].op[1].to + " " + sendTransfers.result[i].op[1].amount + " " + sendTransfers.result[i].op[1].memo + "<br>";
            }
        }
    }

    document.getElementById("bonusesSent").innerHTML = bonusStr;
}

function OutstandingData() {
    this.buyer = null;
    this.ticket = null;
    this.timestamp = null;
}

function BonusData() {
    this.amount = null;
    this.ticket = null;
    this.timestamp = null;
}

let outstandingDataArray = null;
let bonusDataArray = null;