//@ts-check

async function getRecentDraws() {
    console.clear();

    // @ts-ignore
    let history = new SteemHistory("slotto.register");
    // @ts-ignore
    history.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);

    try {
        await history.download();
    } catch (err) {
        console.log("");
        console.log("---error downloading history---");
        console.log(err);

        console.log("");
        console.log("trying again..");

        setTimeout("getRecentDraws()", 5000);
    } finally {
        document.getElementById("spinner").style.display = "none";

        // @ts-ignore
        let transfers = new SteemTransfers();
        transfers.filterTransfers("slotto.gen", "slotto.register", history.result);

        let all = transfers.result;
        let gen = new Array();
        // @ts-ignore
        let draws = "all draws since " + getMemoLimit().memo.substring(9, getMemoLimit().memo.length) + " (UTC)" + "<br><br>";

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

        // @ts-ignore
        //let g = getGenerationMin() * 60 * 1000;
        setTimeout("getRecentDraws()", 30000);
    }
}

getRecentDraws();