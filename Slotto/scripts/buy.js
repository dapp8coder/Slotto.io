function initBuy() {
    console.log("wtf");
    //console.log(document.getElementById("entropy"));
    //document.getElementById("entropy").style.display = "none";
    generateRandomTicket();
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
    let num1 = document.getElementById("num1").value;
    let num2 = document.getElementById("num2").value;
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
    }
}

function purchaseTicket(memo) {
    let amount = getTicketPrice();
    console.log(amount);
    let receiver = getDefaultRegisterAcount();
    let link = api.sign("transfer", {
        to: receiver,
        amount: amount,
        memo: memo,
    }, "http://localhost:8000/demo/");

    console.log("transfer link: ", link)
    window.open(link);
}

function generateRandomTicket() {
    console.log("");
    console.log("generating random ticket..");
    document.getElementById("num1").value = getFortunaRand(1, 50, 0);
    document.getElementById("num2").value = getFortunaRand(1, 50, 0);
    document.getElementById("num3").value = getFortunaRand(1, 50, 0);

    const num1 = document.getElementById("num1").value;
    const num2 = document.getElementById("num2").value;
    const num3 = document.getElementById("num3").value;
    const string = num1 + "," + num2 + "," + num3;
    console.log(string);
}

initBuy();