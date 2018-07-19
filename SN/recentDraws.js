//@ts-check

async function getRecentDraws() {
    // @ts-ignore
    let history = new SteemHistory("slotto.register");
    history.setSearchLimit(null, null, null);
    await history.download();

    // @ts-ignore
    let transfers = new SteemTransfers();
    transfers.filterTransfers("slotto.gen", "slotto.register", history.result);

    let all = transfers.result;
    let gen = new Array();

    for (let i = 0; i < all.length; i++) {
        // @ts-ignore
        if (isSlottoFormat(all[i])) {
            gen.push(all[i]);
            if (gen.length >= 100) {
                break;
            }
        }
    }

    console.log("");
    console.log("---recent 100 draws---");
    console.log(gen);

    return gen;
}

getRecentDraws();