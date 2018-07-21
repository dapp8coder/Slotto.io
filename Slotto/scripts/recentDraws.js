//@ts-check

async function getRecentDraws() {
    console.clear();

    // @ts-ignore
    let history = new SteemHistory("slotto.register");
    history.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await history.download();

    // @ts-ignore
    let transfers = new SteemTransfers();
    transfers.filterTransfers("slotto.gen", "slotto.register", history.result);

    let all = transfers.result;
    let gen = new Array();
    let draws = "all draws since " + getMemoLimit().memo.substring(9, getMemoLimit().memo.length) + "<br><br>";

    for (let i = 0; i < all.length; i++) {
        // @ts-ignore
        if (isSlottoFormat(all[i])) {
            gen.push(all[i]);
            draws += all[i].op[1].memo.substring(0, 8) + " (" + all[i].timestamp + ")" + "<br><br>";
        }
    }

    console.log("");
    console.log("---recent draws---");
    console.log(gen);

    document.getElementById("recentDraws").innerHTML = draws;

    setTimeout("getRecentDraws()", 60000);
}

getRecentDraws();