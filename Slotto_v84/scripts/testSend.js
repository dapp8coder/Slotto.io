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
    if (document.getElementById("fifty").checked == true) {
        message = "50,50,50";
    } else {
        message = rand;
    }

    document.getElementById("memo").value = message;
    console.log(message);

    let receiver = document.getElementById("receiver").value;

    if (key == "") {
        console.log("skipping send..");
        setTimeout("repeatSend()", repeatTime);
    } else {
        if (pick <= 4) {
            console.log("sending with account1");
            testSend(key, sender, receiver, getTicketPrice(), message);
        } else {
            console.log("sending with account2");
            testSend(key2, sender2, receiver, getTicketPrice(), message);
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

const repeatTime = getTestSendMilliSeconds();