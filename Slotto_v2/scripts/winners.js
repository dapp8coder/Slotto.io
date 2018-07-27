async function showWinners() {
    document.getElementById("spinner").style.display = "block";
    document.getElementById("loading").style.display = "block";

    console.clear();
    let sender = "slotto.register"

    // @ts-ignore
    let receivehistory = new SteemHistory(sender);
    // @ts-ignore
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

    for (let i = 0; i < winners.length; i++) {
        for (let w = 0; w < winners[i].winnerNames.length; w++) {
            str += winners[i].winnerNames[w];

            if (winners[i].winnerNames[w].includes("slotto.ninja")) {
                str += " (testrun)"
            } else if (winners[i].winnerNames[w].includes("slotto.game")) {
                str += " (testrun)"
            } else if (winners[i].winnerNames[w].includes("roundbeargames")) {
                str += " (testrun)"
            } else if (winners[i].winnerNames[w].includes("hitmanchoi")) {
                str += " (testrun)"
            }

            str += "<br>"
        }

        str += winners[i].sum.STEEM + " STEEM<br>";
        str += winners[i].winningDraw + "<br><br>";
    }

    document.getElementById("spinner").style.display = "none";
    document.getElementById("loading").style.display = "none";

    document.getElementById("winnersList").innerHTML = str;
}