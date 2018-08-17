async function showWinners() {
    setSlowLoad();

    document.getElementById("loading").style.display = "block";

    console.clear();

    let sender = "slotto.register";

    // @ts-ignore steemHistory.js
    let receivehistory = new SteemHistory(sender);
    // @ts-ignore steemHistory.js
    receivehistory.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await receivehistory.download();

    // @ts-ignore
    let receiveTransfers = new SteemTransfers();
    receiveTransfers.filterTransfers(null, sender, receivehistory.result);

    // @ts-ignore
    let watcher = new Watcher();
    watcher.getWinners(receiveTransfers.result);

    //get bonus data (to subtract from total prize amount)
    await getBonusData(sender);
    console.log("");
    console.log("---bonus data---");
    let bonusBlocks = getBonusBlocks();
    console.log(bonusBlocks);

    let winners = watcher.result;
    let str = "";
    for (let i = winners.length - 1; i >= 0; i--) {
        let skip = false;
        for (let w = 0; w < winners[i].winnerNames.length; w++) {
            // add bonus data (for prize calculation)
            for (let b = 0; b < bonusBlocks.length; b++) {
                if (bonusBlocks[b].winningDraw == winners[i].winningDraw) {
                    winners[i].bonusesSent = bonusBlocks[b];
                }
            }

            if (showTestWinners == false) {
                if (winners[i].winnerNames[w].includes("slotto.ninja") ||
                    winners[i].winnerNames[w].includes("slotto.game") ||
                    winners[i].winnerNames[w].includes("hitmanchoi") ||
                    winners[i].winnerNames[w].includes("roundbeargames")) {
                    //str += " (testrun)"
                    skip = true;
                    break;
                }
            }

            str += winners[i].winnerNames[w];
            str += "<br>"
        }

        let sentBonus = 0;
        if (winners[i].bonusesSent != null) {
            sentBonus = winners[i].bonusesSent.subTotal;
        }

        if (skip == false) {
            let finalCalc = winners[i].sum.STEEM - sentBonus;
            if (finalCalc < 10) {
                finalCalc = finalCalc.toFixed(3);
            } else {
                finalCalc.toFixed(1);
            }
            str += "<div style='color:rgb(255, 234, 47)'>" + finalCalc + " STEEM </div>";
            str += winners[i].winningDraw + "<br><br>";
        }
    }

    document.getElementById("loading").style.display = "none";
    document.getElementById("winnersList").innerHTML = str;

    hideSlowLoad();
}

let showTestWinners = true;