//@ts-check

function initAutoSend() {
    // @ts-ignore
    document.getElementById("repeat").checked = true;
    // @ts-ignore
    document.getElementById("showOutstanding").checked = false;
    // @ts-ignore
    document.getElementById("operationalFee").checked = true;
    document.getElementById("checkTimeLabel").style.display = "none";

    document.getElementById("inputSection").style.display = "block";
    document.getElementById("cancelSend").style.display = "none";
}

async function downloadWinners() {
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("cancelSend").style.display = "block";

    let date = new Date();
    let utc = date.toUTCString();
    document.getElementById("checkTimeLabel").style.display = "block";
    document.getElementById("checkTime").textContent = utc;

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

    sendList = new Array();
    winnerString = "";
    winnerString = "<br><h3>Winners</h3>";
    for (let i = 0; i < winners.length; i++) {
        calcPrize(winners[i]);

        if (i != winners.length - 1) {
            winnerString += "<br>";
        }
    }

    winnerString += "<br>";

    // @ts-ignore
    if (document.getElementById("showOutstanding").checked) {
        let outstanding = watcher.outstandingTickets;

        winnerString += "<br><h3>outstanding Tickets</h3>";
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
    console.log("---prizes already sent---");
    console.log(sentPrizes);

    await checkAndSend(sentPrizes);

    // @ts-ignore
    if (document.getElementById("repeat").checked == true) {
        console.log("");
        console.log("updating again in 3 mins..");
        date = new Date();
        utc = date.toUTCString();
        console.log(utc);
        setTimeout("downloadWinners()", 180000); //3 mins
    }
}

async function procSendReserve() {
    console.log("");
    console.log("---sending reserve---");

    // @ts-ignore
    let rAccount = document.getElementById("reserve").value;
    // @ts-ignore
    let rKey = document.getElementById("reserveKey").value;

    let name = "slotto.register";
    let amount = "100.000 STEEM";
    let memo = "51,51,51";

    if (rKey != "") {
        try {
            // @ts-ignore
            let t = await steem.broadcast.transferAsync(rKey, rAccount, name, amount, memo);
            console.log(t);
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log("active key missing (skipping)");
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
            // check for same account, same winning draw
            //console.log(outGoingTransfers[k].op[1].memo + " vs " + sendList[i].winningDraw);
            if (outGoingTransfers[k].op[1].memo == sendList[i].winningDraw) {
                if (outGoingTransfers[k].op[1].to == sendList[i].name) {
                    alreadySent = true;
                    receiver = outGoingTransfers[k].op[1].to;
                    break;
                }
            }
        }

        if (alreadySent == false) {
            console.log("");
            console.log("---unsent prize---");
            unsentList.push(sendList[i]);
            console.log(sendList[i]);
        } else {
            console.log("already sent: " + sendList[i].winningDraw + " " + receiver + " " + sendList[i].STEEM + " STEEM");
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

    await getRegisterBalance();

    console.log("");
    console.log("---register balance---");
    console.log(steemBalance);

    if (steemBalance <= unsentSteem) {
        console.log("");
        console.log("---adjusting prize pool---");
        let newAmount = Math.trunc((steemBalance * 0.99 * 1000 / unsentList.length)) / 1000;
        console.log(newAmount + " each");
        console.log(newAmount * unsentList.length + " total");

        for (let i = 0; i < unsentList.length; i++) {
            unsentList[i].STEEM = newAmount;
        }

        console.log(unsentList);
    }

    for (let i = 0; i < unsentList.length; i++) {
        await sendPrize(unsentList[i].name, unsentList[i].STEEM, unsentList[i].SBD, unsentList[i].winningDraw, 0);
    }
}

async function getRegisterBalance() {
    steemBalance = 0;
    let bResult = null;
    try {
        // @ts-ignore
        bResult = await steem.api.getAccountsAsync(["slotto.register"]);
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again - getting slotto.register balance");
        await getRegisterBalance();
    } finally {
        steemBalance = bResult[0].balance.replace(" STEEM", "");
    }
}

async function sendPrize(name, STEEM, SBD, message, errCount) {
    // @ts-ignore
    let sender = document.getElementById("sender").value;

    // @ts-ignore
    let senderKey = document.getElementById("senderKey").value;
    let count = errCount;

    if (senderKey != "") {
        try {
            console.log("");
            console.log(name + " " + STEEM + " STEEM" + " and " + SBD + " SBD");
            if (STEEM <= 0) {
                STEEM = 0.001;
            }
            let fixed = STEEM.toFixed(3);
            let amount = fixed + " STEEM";

            // @ts-ignore
            let result = await steem.broadcast.transferAsync(senderKey, sender, name, amount, message);
            console.log(result);
        } catch (err) {
            if (count <= 3) {
                console.log(err);
                console.log("");
                console.log("trying again..");
                count++
                await sendPrize(name, STEEM, SBD, message, count);
            } else {
                console.log("too many errors, check active key (skipping)");
            }
        }
    } else {
        console.log("");
        console.log("no active key (skipping send)");
    }
}

function calcPrize(data) {
    let namesArray = data.winnerNames;
    let steem = null;
    let sbd = null;

    // @ts-ignore
    if (document.getElementById("operationalFee").checked) {
        steem = Math.trunc((data.sum.STEEM * 0.99 * 1000 / namesArray.length)) / 1000;
        sbd = Math.trunc((data.sum.SBD * 0.99 * 1000 / namesArray.length)) / 1000;
    } else {
        steem = Number(data.sum.STEEM);
        sbd = Number(data.sum.SBD);
    }

    let winningDraw = data.winningDraw;

    winnerString += winningDraw + "<br>";

    for (let i = 0; i < namesArray.length; i++) {
        let packet = new PrizeReceiver();
        packet.name = namesArray[i];

        winnerString += namesArray[i] + " " + steem + " STEEM<br>";
        packet.STEEM = steem;
        packet.SBD = sbd;
        packet.winningDraw = winningDraw;
        sendList.push(packet);
    }
}

function PrizeReceiver() {
    this.name = null;
    this.STEEM = null;
    this.SBD = null;
    this.winningDraw = null;
}

function getUTC() {
    const date = new Date();
    const utc = date.toUTCString();
    document.getElementById("currentTime").textContent = utc;

    setTimeout("getUTC()", 1000);
}

function cancelSend() {
    location.reload();
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("cancelSend").style.display = "block";
}

let sendList = new Array();
let winnerString = "";
let steemBalance = null;