//@ts-check

function initAutoSend() {
    // @ts-ignore
    document.getElementById("repeat").checked = true;
    // @ts-ignore
    document.getElementById("showOutstanding").checked = false;
    document.getElementById("checkTimeLabel").style.display = "none";
}

async function downloadWinners() {
    let date = new Date();
    let utc = date.toUTCString();
    document.getElementById("checkTimeLabel").style.display = "block";
    document.getElementById("checkTime").textContent = utc;

    console.clear();

    // @ts-ignore
    let sender = document.getElementById("sender").value;

    // @ts-ignore
    let receivehistory = new SteemHistory(sender);
    // @ts-ignore
    receivehistory.setSearchLimit(null, null, null);
    await receivehistory.download();

    // @ts-ignore
    let receiveTransfers = new SteemTransfers();
    receiveTransfers.filterTransfers(null, sender, receivehistory.result);

    // @ts-ignore
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
        winnerString += "(" + outstanding.length + " tickets)<br><br>";
        for (let i = 0; i < outstanding.length; i++) {
            winnerString += outstanding[i].op[1].from + " " + outstanding[i].op[1].memo + "<br>";
        }
    }

    document.getElementById("winners").innerHTML = winnerString;

    console.log("");
    console.log("---send list---");
    console.log(sendList);

    // @ts-ignore
    let sendHistory = new SteemHistory(sender);
    // @ts-ignore
    sendHistory.setSearchLimit(null, null, null);
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

/**
 * 
 * @param {array} outGoingTransfers 
 */
async function checkAndSend(outGoingTransfers) {
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
            console.log("---sending prize---");
            await sendPrize(sendList[i].name, sendList[i].STEEM, sendList[i].SBD, sendList[i].winningDraw, 0);
        } else {
            console.log("");
            console.log("already sent: " + sendList[i].winningDraw + " " + receiver + " " + sendList[i].STEEM + " STEEM");
        }
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
            console.log(name + " " + STEEM + " STEEM" + " and " + SBD + " SBD");

            STEEM = STEEM.toString();

            if (STEEM.includes(".")) {
                let decimals = STEEM.split(".")[1].length;

                if (decimals == 1) {
                    STEEM += "00"
                } else if (decimals == 2) {
                    STEEM += "0"
                }
            } else {
                STEEM += ".000";
            }

            let amount = STEEM + " STEEM";
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
        console.log("no active key (skipping send)");
    }
}

function calcPrize(data) {
    let namesArray = data.winnerNames;
    let steem = Math.trunc((data.sum.STEEM * 0.99 * 1000 / namesArray.length)) / 1000;
    let sbd = Math.trunc((data.sum.SBD * 0.99 * 1000 / namesArray.length)) / 1000;
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

let sendList = new Array();
let winnerString = "";