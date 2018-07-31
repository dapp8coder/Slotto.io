//@ts-check

async function sendReserve() {
    console.clear();
    console.log("");
    console.log("checking slotto.register..");
    let result = null;

    try {
        // @ts-ignore
        result = await steem.api.getAccountsAsync(["slotto.register"]);
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again - getting slotto.register balance");
        setTimeout("sendReserve();", 1000);
    } finally {
        let steemBalance = result[0].balance.replace(" STEEM", "");

        console.log("");
        console.log("---balance---");
        console.log(steemBalance);

        if (steemBalance < 100) {
            await procSend();
        } else {
            console.log("slotto.register already has over 100 STEEM (skipping)");
        }
    }
}

async function procSend() {
    // @ts-ignore
    let rAccount = document.getElementById("reserve").value;
    // @ts-ignore
    let rKey = document.getElementById("reserveKey").value;

    let name = "slotto.register";
    let memo = "51,51,51";
    let amount = "100.000 STEEM";

    console.log("");
    console.log("---sending reserve---");

    if (rKey != "") {
        try {
            // @ts-ignore
            let result = await steem.broadcast.transferAsync(rKey, rAccount, name, amount, memo);
            console.log(result);
        } catch (err) {
            console.log(err);
            console.log("trying again in 3 mins");
            setTimeout("sendReserve()", rInterval);
        } finally {
            console.log("updating again in 3 mins");
            setTimeout("sendReserve()", rInterval);
        }
    } else {
        console.log("no active key!");
    }
}

let rInterval = 3 * 60 * 1000;