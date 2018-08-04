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
    let winners = watcher.result;

    let str = "";

    for (let i = winners.length - 1; i >= 0; i--) {
        console.log(winners);
        let isTestAccount = false;
        for (let w = 0; w < winners[i].winnerNames.length; w++) {
            //exclude test accounts
            if (winners[i].winnerNames[w] != "hitmanchoi" &&
                winners[i].winnerNames[w] != "slotto.game") {
                str += winners[i].winnerNames[w];
                if (winners[i].winnerNames[w].includes("slotto.ninja")) {
                    str += " (testrun)"
                } else if (winners[i].winnerNames[w].includes("roundbeargames")) {
                    str += " (testrun)"
                }
                str += "<br>"
            } else {
                isTestAccount = true;
            }
        }

        //exclude test accounts
        if (!isTestAccount) {
            str += "<div style='color:rgb(255, 234, 47)'>" + winners[i].sum.STEEM + " STEEM </div>";
            str += winners[i].winningDraw + "<br><br>";
        }
    }

    document.getElementById("loading").style.display = "none";
    document.getElementById("winnersList").innerHTML = str;

    hideSlowLoad();
}