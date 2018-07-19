//@ts-check

async function getRecentDraws() {
    console.clear();

    // @ts-ignore
    let history = new SteemHistory("slotto.register");
    history.setSearchLimit(null, null, null);
    await history.download();

    // @ts-ignore
    let transfers = new SteemTransfers();
    transfers.filterTransfers("slotto.gen", "slotto.register", history.result);

    let all = transfers.result;
    let gen = new Array();
    let draws = "";

    for (let i = 0; i < all.length; i++) {
        // @ts-ignore
        if (isSlottoFormat(all[i])) {
            gen.push(all[i]);
            draws += all[i].op[1].memo.substring(0, 8) + " (" + all[i].timestamp + ")" + "<br><br>";
            if (gen.length >= 100) {
                break;
            }
        }
    }

    console.log("");
    console.log("---recent 100 draws---");
    console.log(gen);

    document.getElementById("recentDraws").innerHTML = draws;

    setTimeout("getRecentDraws()", 60000);
}

getRecentDraws();