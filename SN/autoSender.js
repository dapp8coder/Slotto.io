function initAutoSend() {
    document.getElementById("repeat").checked = true;
}

async function downloadWinners() {
    const date = new Date();
    const utc = date.toUTCString();
    document.getElementById("checkTime").textContent = utc;

    console.clear();
    await getWinners();
    let winners = getFinalResult();
    sendList = new Array();
    winnerString = "";
    winnerString = "---winners---<br>";
    for (let i = 0; i < winners.length; i++) {
        calcPrize(winners[i]);
    }

    document.getElementById("winners").innerHTML = winnerString;

    console.log("");
    console.log("---send list---");
    console.log(sendList);

    await getTransfers("slotto.ninja", "slotto.ninja", null);
    let outGoingTransfers = getTransferHistory();

    checkDoubleSend(outGoingTransfers.transfers);

    if (document.getElementById("repeat").checked == true) {
        console.log("");
        console.log("updating again in 3 mins..");
        setTimeout("downloadWinners()", 180000); //3 mins
    }
}

/**
 * 
 * @param {array} outGoingTransfers 
 */
async function checkDoubleSend(outGoingTransfers) {
    for (let i = 0; i < sendList.length; i++) {
        let alreadySent = false;
        let receiver = null;
        for (let k = 0; k < outGoingTransfers.length; k++) {
            // check for same account, same winning draw
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
    let senderKey = document.getElementById("senderKey").value;
    let count = errCount;

    if (senderKey != "") {
        try {
            console.log(name + " " + STEEM + " " + SBD);
            let amount = STEEM + " STEEM";
            let result = await steem.broadcast.transferAsync(senderKey, "slotto.ninja", name, amount, message);
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

    winnerString += "<br>" + "winning draw: " + winningDraw;
    winnerString += "<br>" + "prize: " + steem + " STEEM";

    if (namesArray.length > 1) {
        winnerString += " (each)";
    }

    for (let i = 0; i < namesArray.length; i++) {
        let packet = new PrizeReceiver();
        packet.name = namesArray[i];
        winnerString += "<br> " + namesArray[i];
        packet.STEEM = steem;
        packet.SBD = sbd;
        packet.winningDraw = winningDraw;
        sendList.push(packet);
    }

    winnerString += "<br>";
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