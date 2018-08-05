//@ts-check

async function getTickets() {
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

    let str = "";
    refundList = new Array();

    for (let i = 0; i < watcher.outstandingTickets.length; i++) {

        if (watcher.outstandingTickets[i].op[1].amount == "0.100 STEEM") {
            refundList.push(watcher.outstandingTickets[i]);
            str += watcher.outstandingTickets[i].op[1].from + " " + watcher.outstandingTickets[i].op[1].memo + " " + watcher.outstandingTickets[i].op[1].amount + "<br>";
        }
    }

    totalRefund = (refundList.length * 0.1).toFixed(1);

    str += "<br>" + refundList.length + " total refundable tickets<br>";
    str += totalRefund;

    document.getElementById("refundable").innerHTML = str;
}

async function sendRefund() {
    console.log("");
    console.log("---sending refund---");

    for (let i = 0; i < refundList.length; i++) {
        let name = refundList[i].op[1].from;
        let amount = "0.100 STEEM";
        console.log(name + " " + amount);
    }
}

let refundList = null;
let totalRefund = null;