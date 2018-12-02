//@ts-check

function initAutoSend() {
    // @ts-ignore
    document.getElementById("repeat").checked = true;
    // @ts-ignore
    document.getElementById("showOutstanding").checked = true;
    // @ts-ignore
    document.getElementById("limitTestPrize").checked = true;

    document.getElementById("checkTimeLabel").style.display = "none";

    document.getElementById("inputSection").style.display = "block";
    document.getElementById("cancelSend").style.display = "none";
}

async function downloadWinners() {
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("cancelSend").style.display = "block";

    let date = new Date();
    document.getElementById("checkTimeLabel").style.display = "block";
    document.getElementById("checkTime").textContent = String(date);

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
    let winners = watcher.result;

    //get bonus data (to subtract from total prize amount)

    // @ts-ignore bonusSender.js
    await getBonusData(receivehistory);
    console.log("");
    console.log("---bonus data---");
    // @ts-ignore bonusSender.js
    let bonusBlocks = getBonusBlocks();
    console.log(bonusBlocks);

    sendList = new Array();
    winnerString = "";
    winnerString = "<br><h3>Winners</h3>";

    for (let i = 0; i < winners.length; i++) {
        // add bonus data (for prize calculation)
        for (let b = 0; b < bonusBlocks.length; b++) {
            if (bonusBlocks[b].winningDraw == winners[i].winningDraw) {
                winners[i].bonusesSent = bonusBlocks[b];
            }
        }

        // subtract all unchecked bonuses from the latest winning prize
        if (i == winners.length - 1) {
            for (let b = 0; b < bonusBlocks.length; b++) {
                if (bonusBlocks[b].winningDraw == "outstanding bonuses") {
                    winners[i].bonusesSent = bonusBlocks[b];
                    break;
                }
            }
        }

        calcPrize(winners[i]);

        // winner names
        for (let w = 0; w < winners[i].winnerNames.length; w++) {
            winnerString += "winner: " + winners[i].winnerNames[w] + "<br>";
        }

        winnerString += "winning draw: " + winners[i].winningDraw + "<br>";
        winnerString += "prize: " + winners[i].sum.STEEM + " STEEM" + "<br>";

        if (winners[i].bonusesSent != null) {
            winnerString += "bonuses sent: " + winners[i].bonusesSent.subTotal + " STEEM" + "<br>";
        } else {
            winnerString += "bonuses sent: none" + "<br>";
        }

        winnerString += "↓<br>";

        for (let t = 0; t < winners[i].tickets.length; t++) {
            winnerString += winners[i].tickets[t].op[1].from + " " + winners[i].tickets[t].op[1].amount + " " + winners[i].tickets[t].op[1].memo + "<br>"
        }

        winnerString += "<br>";
    }

    // @ts-ignore
    if (document.getElementById("showOutstanding").checked) {
        let outstanding = watcher.outstandingTickets;

        winnerString += "<br><h3>Outstanding Tickets</h3>";
        for (let i = 0; i < outstanding.length; i++) {
            winnerString += outstanding[i].op[1].from + " " + outstanding[i].op[1].memo + "<br>";
        }
        winnerString += "<br>total " + outstanding.length + " tickets<br>";
        winnerString += "prize: " + watcher.sumOutstanding.STEEM + " STEEM";
    }

    document.getElementById("winners").innerHTML = winnerString;

    console.log("");
    console.log("---send list---");
    console.log(sendList);

    // @ts-ignore
    let sendHistory = new SteemHistory(sender);
    // @ts-ignore
    sendHistory.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await sendHistory.download();

    // @ts-ignore
    let sendTransfers = new SteemTransfers();
    sendTransfers.filterTransfers(sender, null, sendHistory.result);

    let sentPrizes = new Array();

    for (let i = 0; i < sendTransfers.result.length; i++) {
        if (sendTransfers.result[i].op[1].to != "slotto.gen") {
            sentPrizes.push(sendTransfers.result[i]);
        }
    }

    console.log("");
    console.log("---outward transfers from register---");
    console.log(sentPrizes);

    await checkAndSend(sentPrizes);

    // @ts-ignore
    if (document.getElementById("repeat").checked == true) {
        console.log("");
        console.log("updating again in 3 mins..");
        date = new Date();
        console.log("check time: " + date);
        setTimeout("downloadWinners()", 3 * 60 * 1000);
    }
}

/**
 * 
 * @param {array} outGoingTransfers 
 */
async function checkAndSend(outGoingTransfers) {
    let unsentList = new Array();

    for (let i = 0; i < sendList.length; i++) {
        let alreadySent = false;
        let receiver = null;
        for (let k = 0; k < outGoingTransfers.length; k++) {
            // check for same account, same winning draw time
            if (outGoingTransfers[k].op[1].memo == sendList[i].winningDraw) {
                if (outGoingTransfers[k].op[1].to == sendList[i].name) {
                    alreadySent = true;
                    receiver = outGoingTransfers[k].op[1].to;
                    console.log("already sent: " + sendList[i].winningDraw + " | " + receiver + " | nominal: " + sendList[i].STEEM + " STEEM" + " | actual: " + outGoingTransfers[k].op[1].amount);
                    break;
                }
            }
        }

        if (alreadySent == false) {
            console.log("");
            console.log("---unsent prize---");
            unsentList.push(sendList[i]);
            console.log(sendList[i]);
        }
    }

    await procUnsentList(unsentList);
}

async function procUnsentList(unsentList) {
    let unsentSteem = 0;

    for (let i = 0; i < unsentList.length; i++) {
        unsentSteem += unsentList[i].STEEM;
    }

    console.log("");
    console.log("---total unsent prize---");
    console.log(unsentSteem);

    // @ts-ignore accountBalance.js
    let b = await getSteemBalance("slotto.register");
    steemBalance = Number(b.replace(" STEEM", ""));

    if (steemBalance <= unsentSteem) {
        console.log("");
        console.log("---adjusting prize pool---");
        let newAmount = Math.trunc((steemBalance * 0.99999 * 1000 / unsentList.length)) / 1000;
        console.log(newAmount + " each");
        console.log(newAmount * unsentList.length + " total");

        for (let i = 0; i < unsentList.length; i++) {
            unsentList[i].STEEM = newAmount;
        }

        console.log(unsentList);
    }

    for (let i = 0; i < unsentList.length; i++) {
        await sendPrize(unsentList[i].name, unsentList[i].STEEM, unsentList[i].SBD, unsentList[i].winningDraw);
    }
}

async function sendPrize(name, STEEM, SBD, message) {
    // @ts-ignore
    let sender = document.getElementById("sender").value;

    // @ts-ignore
    let senderKey = document.getElementById("senderKey").value;

    try {
        console.log("");
        console.log(name + " " + STEEM + " STEEM" + " and " + SBD + " SBD");
        if (STEEM <= 0) {
            STEEM = 0.001;
        }
        let fixed = STEEM.toFixed(3);
        let amount = fixed + " STEEM";

        // @ts-ignore
        if (document.getElementById("limitTestPrize").checked) {
            if (name == "roundbeargames" ||
                name == "hitmanchoi" ||
                name == "slotto.register" ||
                name == "slotto.gen" ||
                name == "slotto.game" ||
                name == "slotto.ninja" ||
                name == "imaginalex" ||
                name == "bestbroplayer") {
                amount = "0.100 STEEM";
            }
        }

        // @ts-ignore
        let result = await steem.broadcast.transferAsync(senderKey, sender, name, amount, message);
        console.log(result);
    } catch (err) {
        console.log("");
        console.log("---error sending prize---");
        console.log(err);
    }
}

function calcPrize(data) {
    let namesArray = data.winnerNames;
    let steem = null;
    let sbd = null;

    console.log("");
    console.log("---calculating prize---");
    console.log(data);

    steem = Number(data.sum.STEEM);
    sbd = Number(data.sum.SBD);

    if (data.bonusesSent != null) {
        steem -= data.bonusesSent.subTotal.toFixed(3);
    }

    let winningDraw = data.winningDraw;

    for (let i = 0; i < namesArray.length; i++) {
        let packet = new PrizeReceiver();
        packet.name = namesArray[i];
        packet.STEEM = Number((steem / namesArray.length).toFixed(3));
        packet.SBD = sbd;
        packet.winningDraw = winningDraw;
        sendList.push(packet);

        if (packet.STEEM <= 0) {
            packet.STEEM = 0.1;
        }

        console.log("");
        console.log("---prize packet info---");
        console.log(packet);
    }
}

function PrizeReceiver() {
    this.name = null;
    this.STEEM = null;
    this.SBD = null;
    this.winningDraw = null;
}

function getLocalTime() {
    const date = new Date();
    document.getElementById("currentTime").textContent = String(date);

    setTimeout("getLocalTime()", 1000);
}

function cancelSend() {
    location.reload();
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("cancelSend").style.display = "block";
}

let sendList = new Array();
let winnerString = "";
let steemBalance = null;