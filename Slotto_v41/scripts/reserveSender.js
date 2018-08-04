//@ts-check

function cancelReserve() {
    location.reload();
}

async function sendReserve() {
    console.clear();

    document.getElementById("inputField").style.display = "none";
    document.getElementById("cancelButton").style.display = "block";

    // @ts-ignore accountBalance.js
    let resultReg = await getSteemBalance("slotto.register");
    let register = Number(resultReg.replace(" STEEM", ""));
    // @ts-ignore slottoSettings.js
    let reserveAmount = getReserveAmount();

    if (register < reserveAmount) {
        console.log("register has less than " + reserveAmount + " STEEM");

        // @ts-ignore
        let resultReserve = await getSteemBalance(document.getElementById("reserve").value);
        let reserve = Number(resultReserve.replace(" STEEM", ""));

        if (reserve >= reserveAmount) {
            console.log("reserve has " + reserveAmount + " STEEM");
        }
    }
    /*let result = null;

    try {
        // @ts-ignore
        result = await steem.api.getAccountsAsync(["slotto.register"]);
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again - getting slotto.register balance");
        await sendReserve();
    } finally {
        if (result != null) {
            let steemBalance = result[0].balance.replace(" STEEM", "");

            console.log("");
            console.log("---balance---");
            console.log(steemBalance);

            document.getElementById("registerBalance").textContent = "slotto.register balance: " + steemBalance + " STEEM";

            if (steemBalance < 100) {
                await procSend();
            } else {
                console.log("slotto.register already has over 100 STEEM (skipping)");
            }

            let date = new Date();
            let utc = date.toUTCString();
            console.log("check time: " + utc);
            document.getElementById("checkTime").textContent = "check time: " + utc;

            console.log("");
            console.log("updating again in 3 mins");
            setTimeout("sendReserve()", rInterval);
        } else {
            await sendReserve();
        }
    }*/
    setTimeout("sendReserve();", 1000);
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
        }
    } else {
        console.log("no active key!");
    }
}

function initReserve() {
    document.getElementById("cancelButton").style.display = "none";
    getUTC();
}

function getUTC() {
    let date = new Date();
    let utc = date.toUTCString();
    document.getElementById("currentTime").textContent = utc;

    setTimeout("getUTC()", 1000);
}

let rInterval = 1 * 1000;