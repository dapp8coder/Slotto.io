//@ts-check

async function getRecentDraws() {
    console.clear();

    let history = null;

    try {
        // @ts-ignore
        history = new SteemHistory(getMemoLimit().sender);
        // @ts-ignore
        history.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
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

        let draws = "";

        for (let i = 0; i < all.length; i++) {
            // @ts-ignore
            if (isSlottoFormat(all[i])) {
                gen.push(all[i]);
                draws += all[i].op[1].memo.substring(0, 8) + " (" + all[i].timestamp + ")" + "<br><br>";
            }
        }

        // @ts-ignore
        draws += "entire history can be viewed at <a class='drawStatus' href='https://steemd.com/@slotto.gen' target='_blank'> https://steemd.com/@slotto.gen</a>";

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