async function showWinners() {
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

    console.log("");
    console.log("---winners---");
    console.log(winners);

    let str = "";

    for (let i = 0; i < winners.length; i++) {
        for (let w = 0; w < winners[i].winnerNames.length; w++) {
            str += winners[i].winnerNames[w] + "<br>";
        }
    }

    document.getElementById("winnersList").innerHTML = str;
}