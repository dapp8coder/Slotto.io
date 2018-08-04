//@ts-check

function cancelReserve() {
    location.reload();
}

async function checkReserveAccount() {

}

async function sendReserve() {
    console.clear();

    document.getElementById("inputField").style.display = "none";
    document.getElementById("cancelButton").style.display = "block";

    // @ts-ignore accountBalance.js
    let resultReg = await getSteemBalance("slotto.register");
    let registerAmount = Number(resultReg.replace(" STEEM", ""));
    // @ts-ignore slottoSettings.js
    let reserveAmount = getReserveAmount();

    if (registerAmount < reserveAmount) {
        console.log("register has less than " + reserveAmount + " STEEM");

        // @ts-ignore
        let resultReserve = await getSteemBalance(document.getElementById("reserve").value);
        let reserve = Number(resultReserve.replace(" STEEM", ""));

        if (reserve >= reserveAmount) {
            console.log("reserve has " + reserveAmount + " STEEM");
            //send reserve
            await procSend();
        } else {
            console.log("reserve has less than " + reserveAmount + " (skipping)");
        }
    } else {
        console.log("register has more than " + reserveAmount + " (skipping)");
    }

    let date = new Date();
    let utc = date.toUTCString();
    console.log("");
    console.log("check time: " + utc);
    document.getElementById("checkTime").textContent = "check time: " + utc;

    setTimeout("sendReserve();", 1000);
}

async function procSend() {
    // @ts-ignore
    let rAccount = document.getElementById("reserve").value;
    // @ts-ignore
    let rKey = document.getElementById("reserveKey").value;

    let name = "slotto.register";
    let memo = "51,51,51";
    let amount = getReserveAmount().toFixed(3) + " STEEM";

    console.log("");
    console.log("---sending reserve---");
    console.log(amount);

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