function repeatSend() {
    const key = document.getElementById("senderKey").value;
    const sender = document.getElementById("sender").value;

    const key2 = document.getElementById("senderKey2").value;
    const sender2 = document.getElementById("sender2").value;

    const date = new Date();
    const utc = date.toUTCString()
    const miliseconds = date.getUTCMilliseconds();
    const rand = generateTicket(3, miliseconds);
    let message = "";

    let pick = Math.floor(Math.random() * 10);

    console.log("");
    if (getFifty == true) {
        message = "50,50,50 " + utc + " " + miliseconds;
    } else {
        message = rand + " " + utc + " " + miliseconds;
    }

    document.getElementById("memo").value = message;
    console.log(message);

    if (key == "") {
        console.log("skipping send..");
        setTimeout("repeatSend()", repeatTime);
    } else {
        if (pick <= 4) {
            console.log("sending with account1");
            testSend(key, sender, "slotto.ninja", getTicketPrice(), message);
        } else {
            console.log("sending with account2");
            testSend(key2, sender2, "slotto.ninja", getTicketPrice(), message);
        }
    }
}

async function testSend(key, sender, receiver, amount, message) {
    try {
        let result = await steem.broadcast.transferAsync(key, sender, receiver, amount, message);
        console.log(result);
        console.log("send complete ");
        setTimeout("repeatSend()", repeatTime);
    } catch (err) {
        console.log(err);
        console.log("");
        setTimeout("repeatSend()", repeatTime);
    }
}

function returnSteem() {
    console.log("sending back money..")
    const key = document.getElementById("receiverKey").value;
    const receiver = document.getElementById("receiver").value;
    const sender = document.getElementById("sender").value;
    const sender2 = document.getElementById("sender2").value;
    const amount = document.getElementById("amount").value;

    steem.broadcast.transfer(key, receiver, sender, amount, "", function(err, result) {
        console.log(err);
        console.log(result);
    });

    steem.broadcast.transfer(key, receiver, sender2, amount, "", function(err, result) {
        console.log(err);
        console.log(result);
    });
}

function onClickFifty() {
    getFifty = document.getElementById("fifty").checked;
    console.log("getFifty: " + getFifty)
}

let getFifty = null;
const repeatTime = 10000; //10 secs