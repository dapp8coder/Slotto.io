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
    await getBonusData(receivehistory);
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

            if (showEarlyErrors == false) {
                if (winners[i].winningDraw == "46,18,24 2018-08-14T19:46:03" || //zecbroaswk
                    winners[i].winningDraw == "30,06,39 2018-08-14T12:22:03" || //mow
                    winners[i].winningDraw == "16,05,37 2018-08-14T06:42:03" || //nyakmat
                    winners[i].winningDraw == "37,29,03 2018-08-14T05:38:03" || //nyakmat
                    winners[i].winningDraw == "14,22,30 2018-08-11T21:00:00" || //channarong
                    winners[i].winningDraw == "18,08,46 2018-08-10T03:00:00" || //razzor
                    winners[i].winningDraw == "15,20,29 2018-08-06T01:00:00" || //sandyprasasty
                    winners[i].winningDraw == "43,24,40 2018-08-04T03:30:03" || //chireerocks
                    winners[i].winningDraw == "24,06,41 2018-08-02T23:25:00" //razzor
                ) {
                    skip = true;
                    break;
                }
            }

            str += winners[i].winnerNames[w];

            if (winners[i].winnerNames[w].includes("slotto.ninja") ||
                winners[i].winnerNames[w].includes("slotto.game") ||
                winners[i].winnerNames[w].includes("hitmanchoi") ||
                winners[i].winnerNames[w].includes("roundbeargames")) {
                str += " (testrun)"
            }

            str += "<br>"
        }

        let sentBonus = 0;
        if (winners[i].bonusesSent != null) {
            sentBonus = Number(winners[i].bonusesSent.subTotal);
        }

        if (skip == false) {
            let finalCalc = Number(winners[i].sum.STEEM) - sentBonus;
            finalCalc = Number(finalCalc.toFixed(3));

            str += "<div style='color:rgb(255, 234, 47)'>" + finalCalc + " STEEM </div>";
            str += winners[i].winningDraw + "<br><br>";
        }
    }

    document.getElementById("loading").style.display = "none";
    document.getElementById("winnersList").innerHTML = str;

    hideSlowLoad();
}

let showTestWinners = true;
let showEarlyErrors = false;