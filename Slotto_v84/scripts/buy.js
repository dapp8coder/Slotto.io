//@ts-check

function initBuy() {
    generateRandomTicket();
    getPrize();
    getTicketNumbers();
}

async function getPrize() {
    // @ts-ignore accountBalance.js
    let result = await getSteemBalance("slotto.register");
    let steemBalance = 0; /*Number(result.replace(" STEEM", ""));*/

    document.getElementById("prizeSteem").textContent = Number(steemBalance.toFixed(1)) + " STEEM";

    /*
    // @ts-ignore slottoSettings.js
    if (steemBalance < getReserveAmount()) {
        document.getElementById("prizeSteem").textContent = "LOADING";
    } else {
        document.getElementById("prizeSteem").textContent = Number(steemBalance.toFixed(1)) + " STEEM";
    }*/
}

function ticketIsValid(num1, num2, num3) {
    if (num1.includes(".") || num2.includes(".") || num3.includes(".")) {
        return false;
    }

    if (isNaN(Number(num1)) == false &&
        isNaN(Number(num2)) == false &&
        isNaN(Number(num3)) == false) {
        if (num1 >= 1 && num1 <= 49) {
            if (num2 >= 1 && num2 <= 49) {
                if (num3 >= 1 && num3 <= 49) {
                    return true;
                }
            }
        }
    }

    return false;
}

function buy() {
    // @ts-ignore
    let num1 = document.getElementById("num1").value;
    // @ts-ignore
    let num2 = document.getElementById("num2").value;
    // @ts-ignore
    let num3 = document.getElementById("num3").value;

    if (ticketIsValid(num1, num2, num3)) {
        if (num1 < 10 && String(num1).substr(0, 1) != "0") {
            num1 = "0" + num1;
        }

        if (num2 < 10 && String(num2).substr(0, 1) != "0") {
            num2 = "0" + num2;
        }

        if (num3 < 10 && String(num3).substr(0, 1) != "0") {
            num3 = "0" + num3;
        }
        const memo = num1 + "," + num2 + "," + num3;

        console.log("");
        console.log("purchasing ticket..");
        console.log(memo);
        purchaseTicket(memo);
    } else {
        console.log("");
        console.log("ticket is invalid!");
        alert("Tickets must be integers! (1~49)")
    }
}

function purchaseTicket(memo) {
    // @ts-ignore slotto.Settings.js
    let amount = getTicketPrice();

    // @ts-ignore slotto.Settings.js
    let receiver = getDefaultRegisterAccount();
    // @ts-ignore steemConnect2.js
    let link = api.sign("transfer", {
        to: receiver,
        amount: amount,
        memo: memo,
    }, "https://slotto.io");

    console.log("transfer link: ", link)
    window.open(link);
    //window.open("https://busy.org/@roundbeargames");

    generateRandomTicket();
}

function generateRandomTicket() {
    console.log("");
    console.log("generating random ticket..");
    // @ts-ignore fortunaGenerator.js
    document.getElementById("num1").value = getFortunaRand(1, 50, 0);
    // @ts-ignore fortunaGenerator.js
    document.getElementById("num2").value = getFortunaRand(1, 50, 0);
    // @ts-ignore fortunaGenerator.js
    document.getElementById("num3").value = getFortunaRand(1, 50, 0);

    // @ts-ignore
    const num1 = document.getElementById("num1").value;
    // @ts-ignore
    const num2 = document.getElementById("num2").value;
    // @ts-ignore
    const num3 = document.getElementById("num3").value;
    const string = num1 + "," + num2 + "," + num3;
    console.log(string);
}

async function getTicketNumbers() {
    // @ts-ignore steemHistory.js
    let receivehistory = new SteemHistory("slotto.register");
    // @ts-ignore steemHistory.js
    receivehistory.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await receivehistory.download();

    // @ts-ignore steemTransfers.js
    let receiveTransfers = new SteemTransfers();
    receiveTransfers.filterTransfers(null, "slotto.register", receivehistory.result);

    // @ts-ignore watcher.js
    let watcher = new Watcher();
    await watcher.getWinners(receiveTransfers.result);

    let tCount = watcher.outstandingTickets.length;

    if (tCount >= 100) {
        //console.log("");
        //console.log("---total outstanding tickets---");
        //console.log(tCount);

        let ticketsStr = "Total tickets sold: " + tCount + "<br>(current round)";
        document.getElementById("totalTicketsSold").innerHTML = ticketsStr;
    }

}

initBuy();