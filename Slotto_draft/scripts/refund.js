//@ts-check

async function getTickets() {
    document.getElementById("refundable").innerHTML = "";
    console.clear();

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

    console.log("");
    console.log("---Refundable Tickets (outstanding)---")
    console.log(watcher.outstandingTickets);

    printRefundables(watcher.outstandingTickets);
}

function printRefundables(tickets) {
    let str = "";
    refundList = new Array();

    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].op[1].amount == "0.100 STEEM") {
            refundList.push(tickets[i]);
            str += tickets[i].op[1].from + " " + tickets[i].op[1].memo + " " + tickets[i].op[1].amount + "<br>";
        }
    }

    // @ts-ignore
    let refundAmount = Number(document.getElementById("refundAmount").value);
    totalRefund = (refundList.length * refundAmount).toFixed(1);

    str += "<br>" + refundList.length + " total refundable tickets<br>";
    str += totalRefund;

    document.getElementById("refundable").innerHTML = str;
}

async function searchTickets() {
    document.getElementById("refundable").innerHTML = "";
    console.clear();

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

    refundList = new Array();

    // @ts-ignore
    let searchDraw = document.getElementById("winningDraw").value;
    if (searchDraw != "") {
        for (let i = 0; i < watcher.result.length; i++) {
            if (watcher.result[i].winningDraw == searchDraw) {
                console.log("");
                console.log("---searching refundable tickets---");
                console.log(watcher.result[i].tickets);
                for (let t = 0; t < watcher.result[i].tickets.length; t++) {
                    refundList.push(watcher.result[i].tickets[t]);
                }
            }
        }

        printRefundables(refundList);
    }
}

async function sendRefund() {
    console.log("");
    console.log("---sending refund---");
    // @ts-ignore
    let key = document.getElementById("registerKey").value;
    // @ts-ignore
    let sender = document.getElementById("register").value;
    let message = "this is a refund. round 3 is resetting.";

    // @ts-ignore
    let refund = Number(document.getElementById("refundAmount").value);

    for (let i = 0; i < refundList.length; i++) {
        let receiver = refundList[i].op[1].from;
        let amount = refund.toFixed(3) + " STEEM";
        console.log("");
        console.log(receiver + " " + amount);

        if (key != "") {
            // @ts-ignore
            let result = await steem.broadcast.transferAsync(key, sender, receiver, amount, message)
            console.log(result);
        } else {
            console.log("active key missing (skipping)");
        }
    }
}

let refundList = null;
let totalRefund = null;