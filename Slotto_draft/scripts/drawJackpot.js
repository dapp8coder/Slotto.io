//@ts-check

function InitRandomGenerator() {
    console.log("initializing random draws");

    // @ts-ignore fortunaGenerator.js
    console.log("test rand: ", getFortunaRand(800, 900, 0));

    updateTime();
}

function updateTime() {
    const date = new Date();
    const utc = date.toUTCString();
    document.getElementById("utcDisplay").textContent = utc;

    setTimeout("updateTime();", 300);
}

function drawTicket() {
    saveOnBlockchain(drawWinner());
}

/**
 * 
 * @param {string} message 
 */
function saveOnBlockchain(message) {
    // @ts-ignore
    const senderAccount = document.getElementById("senderAccount").value;
    // @ts-ignore
    const senderActiveKey = document.getElementById("senderActiveKey").value;
    // @ts-ignore
    const receiverAccount = document.getElementById("receiverAccount").value
    const amount = "0.001 STEEM";

    if (senderActiveKey == "") {
        console.log("no sender/receiver specified (skipping transfer)");
    } else {
        console.log("saving draw on chain");
        transferMoney(senderActiveKey, senderAccount, receiverAccount, amount, message, true);
    }
}

function transferMoney(key, sender, receiver, amount, message, resend) {
    // @ts-ignore
    steem.broadcast.transfer(key, sender, receiver, amount, message, function(err, result) {
        console.log(err, result);

        if (err == null) {
            if (resend == true) {
                console.log("sending back money");
                // @ts-ignore
                const receiverActiveKey = document.getElementById("receiverActiveKey").value;
                transferMoney(receiverActiveKey, receiver, sender, amount, "", false);
            }
        } else {
            console.log("");
            console.log("trying again..");
            transferMoney(key, sender, receiver, amount, message, resend);
        }
    });
}

function drawWinner() {
    const date = new Date();
    const utc = date.toUTCString()
    const miliseconds = date.getUTCMilliseconds();
    // @ts-ignore
    const rand = generateTicket(3, miliseconds);
    let message = "";
    message = rand + " " + utc + " " + miliseconds;

    console.log("");
    console.log(message);

    return message;
}