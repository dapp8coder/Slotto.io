//@ts-check

function initBonusSend() {
    document.getElementById("results").style.display = "none";
    // @ts-ignore
    document.getElementById("repeat").checked = true;
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

    await getBonusData(receivehistory);
    await procBonus(sender);

    console.log("");
    console.log("---sent jackpot---");
    console.log(jackpotArray);

    console.log("");
    console.log("---bonus blocks---");
    console.log(bonusBlockArray);

    let d = new Date();
    console.log("");
    console.log("check time: " + d);
    console.log("updating again in 3 mins");

    // @ts-ignore
    if (document.getElementById("repeat").checked) {
        setTimeout("updateBonuses();", 3 * 60 * 1000);
    }
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

async function getBonusData(accountHistory) {
    let bonusStr = "";
    bonusDataArray = new Array();

    // @ts-ignore
    let tr = new SteemTransfers();
    tr.filterTransfers(null, null, accountHistory.result);

    let totalBonuses = 0;
    let subTotal = 0;
    let tempBag = new Array();
    jackpotArray = new Array();
    bonusBlockArray = new Array();

    console.log("");
    console.log("---checking for bonuses sent---");
    console.log(tr);

    for (let i = tr.result.length - 1; i >= 0; i--) {
        if (tr.result[i].op[1].from == "slotto.register") {
            if (tr.result[i].op[1].to != "slotto.gen") {
                if (tr.result[i].op[1].memo.includes("checkpoint") == false) {
                    if (tr.result[i].op[1].memo.includes("bonus")) {
                        let bd = new BonusData();
                        bd.account = tr.result[i].op[1].to;
                        bd.amount = tr.result[i].op[1].amount;
                        bd.ticket = tr.result[i].op[1].memo;

                        totalBonuses += Number(bd.amount.replace(" STEEM", ""));
                        subTotal += Number(bd.amount.replace(" STEEM", ""));

                        // extract transfer time from memo
                        let t = bd.ticket.substr(bd.ticket.length - 19, 19);
                        bd.matchingTime = t;

                        // extract ticket number from memo
                        bd.ticket = bd.ticket.replace("bonus ", "");
                        bd.ticket = bd.ticket.substr(0, bd.ticket.length - 20);

                        bonusStr += bd.account + " " + bd.amount + " " + bd.ticket + " " + bd.matchingTime + "<br>";
                        bonusDataArray.push(bd);
                        tempBag.push(bd);
                    }

                    // do nothing
                    else if (tr.result[i].op[1].memo == "") {}

                    // outgoing transfer memo that isn't "bonus" or "" is a jackpot
                    else {
                        jackpotArray.push(tr.result[i]);
                        let bonusBlock = new BonusBlock();

                        // add sent bonuses into a block
                        for (let t = 0; t < tempBag.length; t++) {
                            bonusBlock.bonusDataArray.push(tempBag[t]);
                        }

                        // name the block with the winning draw
                        bonusBlock.winningDraw = tr.result[i].op[1].memo;

                        if (tempBag.length > 0) {
                            bonusBlock.subTotal = Number(subTotal.toFixed(3));
                            bonusBlockArray.push(bonusBlock);
                            bonusStr += "↑ winning draw: " + bonusBlock.winningDraw + "<br>";
                            bonusStr += "subtotal: " + subTotal.toFixed(3) + " STEEM" + "<br>";
                            bonusStr += "<br>";
                        }

                        // clear bag
                        tempBag = new Array();
                        subTotal = 0;
                    }
                }
            }
        }
    }

    if (tempBag.length > 0) {
        console.log("");
        console.log("---non cleared bag (outstanding bonuses)---");
        console.log(tempBag);
        console.log(subTotal.toFixed(3));

        let outstandingBonuses = new BonusBlock();
        outstandingBonuses.winningDraw = "outstanding bonuses";
        outstandingBonuses.subTotal = Number(subTotal.toFixed(3));

        for (let i = 0; i < tempBag.length; i++) {
            outstandingBonuses.bonusDataArray.push(tempBag[i]);
        }

        bonusBlockArray.push(outstandingBonuses);
    }

    bonusStr += "↑ bonuses for outstanding tickets: " + subTotal.toFixed(3) + " STEEM" + "<br>";

    bonusStr += "<br>";
    bonusStr += "total bonuses sent: " + totalBonuses.toFixed(3) + " STEEM" + "<br>";

    let e = document.getElementById("bonusesSent");

    if (e != null) {
        e.innerHTML = bonusStr;
    }
}

function OutstandingData() {
    this.buyer = null;
    this.ticket = null;
    this.timestamp = null;
}

function BonusData() {
    this.account = null;
    this.amount = null;
    this.ticket = null;
    this.matchingTime = null;
}

async function procBonus(sender) {
    console.log("");
    console.log("---processing bonus---");

    for (let i = outstandingDataArray.length - 1; i >= 0; i--) {
        let alreadySent = false;

        for (let k = 0; k < bonusDataArray.length; k++) {
            if (outstandingDataArray[i].buyer == bonusDataArray[k].account) {
                if (outstandingDataArray[i].ticket == bonusDataArray[k].ticket) {
                    if (outstandingDataArray[i].timestamp == bonusDataArray[k].matchingTime) {
                        alreadySent = true;
                    }
                }
            }
        }

        // shouldn't give self bonuses
        if (outstandingDataArray[i].buyer == "roundbeargames") {
            alreadySent = true;
        }

        if (alreadySent == false) {
            console.log("");
            console.log("eligible bonus: " + outstandingDataArray[i].buyer + " " + outstandingDataArray[i].ticket + " " + outstandingDataArray[i].timestamp);
            let bonusAmount = getBonusAmount();
            console.log("random bonus: " + bonusAmount);

            // @ts-ignore
            let key = document.getElementById("senderKey").value;
            let receiver = outstandingDataArray[i].buyer;
            let message = "bonus " + outstandingDataArray[i].ticket + " " + outstandingDataArray[i].timestamp;
            let fixed = bonusAmount.toFixed(3) + " STEEM";

            //console.log(sender);
            //console.log(key);
            //console.log(message);
            let result = null;
            try {
                // @ts-ignore
                result = await steem.broadcast.transferAsync(key, sender, receiver, fixed, message);
            } catch (err) {
                console.log(err);
            } finally {
                console.log(result);
            }
        } else {
            console.log("");
            console.log("already sent bonus: " + outstandingDataArray[i].buyer + " " + outstandingDataArray[i].ticket + " " + outstandingDataArray[i].timestamp);
        }
    }
}

function getBonusAmount() {
    // @ts-ignore fortunaGenerator.js
    let b = getFortunaRand(1, 101, 0);

    if (b <= 40 && b >= 1) {
        return 0.003;
    } else if (b <= 70 && b >= 41) {
        return 0.01;
    } else if (b <= 90 && b >= 71) {
        return 0.02;
    } else if (b <= 100 && b >= 91) {
        return 0.03;
    }

    return 0.001;
}

function BonusBlock() {
    this.winningDraw = null;
    this.bonusDataArray = new Array();
    this.subTotal = 0;
}

function getBonusBlocks() {
    return bonusBlockArray;
}

function getTotalBonuses(accountName, bonusBlockData) {
    let total = 0;
    for (let i = 0; i < bonusBlockData.length; i++) {
        for (let d = 0; d < bonusBlockData[i].bonusDataArray.length; d++) {
            if (accountName == bonusBlockData[i].bonusDataArray[d].account) {
                let b = Number(bonusBlockData[i].bonusDataArray[d].amount.replace(" STEEM", ""));
                total += b;
            }
        }
    }

    return total;
}

function isBonusEligible(accountName, slottoHistory) {
    let history = slottoHistory.result;
    //console.log("");
    //console.log("---checking bonus eligibility---");
    //console.log(history);

    for (let i = 0; i < history.length; i++) {
        //console.log(accountName + " vs " + history[i].op[1].from);

        if (history[i].op[1].from == accountName) {
            return true;
        }

        if (history[i].op[1].memo.includes("checkpoint")) {
            break;
        }
    }

    return false;
}

let jackpotArray = null;
let outstandingDataArray = null;
let bonusDataArray = null;
let bonusBlockArray = null;