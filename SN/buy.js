function init() {
    document.getElementById("entropy").style.display = "none";
    generateRandomTicket();
}

function buy() {
    console.log("");
    console.log("purchasing ticket..");
    const num1 = document.getElementById("num1").value;
    const num2 = document.getElementById("num2").value;
    const num3 = document.getElementById("num3").value;
    const memo = num1 + "," + num2 + "," + num3;
    console.log(memo);

    purchaseTicket(memo);
}

function purchaseTicket(memo) {
    let amount = getTicketPrice();

    console.log(amount);

    let link = api.sign("transfer", {
        to: "slotto.ninja",
        amount: amount,
        memo: memo,
    }, "http://localhost:8000/demo/");

    console.log("transfer link: ", link)
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