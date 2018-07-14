//@ts-check

function InitRandomGenerator() {
    console.log("initializing random draws");
    document.getElementById("status").style.display = "none";
}

function getMinsDeadline() {
    // @ts-ignore
    let minsDeadline = document.getElementById("minsDeadline").value

    minsDeadline = Math.floor(minsDeadline);
    minsDeadline = parseInt(minsDeadline);

    if (minsDeadline <= 0) {
        minsDeadline = 1;
    } else if (minsDeadline >= 59) {
        minsDeadline = 59
    }

    return minsDeadline;
}

function startProcess() {
    hideInputFields();

    document.getElementById("status").style.display = "block";

    console.log("starting process at.. 1 generation per ", getMinsDeadline(), " minute(s)");
    // @ts-ignore
    console.log("test rand: ", getFortunaRand(1, 50, 0));
    updateDraw();
}

function updateDraw() {
    document.getElementById("utcDisplay").style.display = "block";

    const date = new Date();
    const utc = date.toUTCString();
    const min = date.getUTCMinutes();
    const lastGen = document.getElementById("lastGen").textContent;

    document.getElementById("utcDisplay").textContent = utc;

    const minsDeadline = getMinsDeadline();
    if (isGenerationMinute(min, minsDeadline)) {
        if (lastGen.includes("None")) {
            drawWinner();
        } else if (isGenerated() == false) {
            drawWinner();
        } else {
            nextDraw();
        }
    } else {
        nextDraw();
    }
}

function nextDraw() {
    setTimeout("updateDraw()", getSimpleFortunaRand(900, 999));
}

function getSimpleFortunaRand(min, max) {
    // @ts-ignore
    fortuna.init({ timeBasedEntropy: true, accumulateTimeout: 100 });
    // @ts-ignore
    let r = parseInt((fortuna.random() * (max - min)) + min);
    let sr = "";
    if (r < 10) {
        sr = "0" + r;
    }
    return sr;
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
        nextDraw();
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
            } else {
                nextDraw();
            }
        } else {
            console.log("");
            console.log("trying again..");
            transferMoney(key, sender, receiver, amount, message, resend);
        }
    });
}

function getNextGenerationMin(currentUTCMin, deadlineMin) {
    const nextMin = (Math.floor(currentUTCMin / deadlineMin) + 1) * deadlineMin;
    return nextMin;
}

function isGenerationMinute(currentUTCMin, deadlineMin) {
    if (currentUTCMin % deadlineMin == 0) {
        return true;
    } else {
        return false;
    }
}

function isGenerated() {
    const lastGen = document.getElementById("lastGen").textContent;

    if (lastGen.includes("None")) {
        return false;
    }

    const genDate = new Date(lastGen);
    const genYear = genDate.getUTCFullYear();
    const genMonth = genDate.getUTCMonth();
    const genDay = genDate.getUTCDay();
    const genHour = genDate.getUTCHours();
    const genMin = genDate.getUTCMinutes();

    const date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDay();
    const hour = date.getUTCHours();
    const min = date.getUTCMinutes();

    if (genYear == year) {
        if (genMonth == month) {
            if (genDay == day) {
                if (genHour == hour) {
                    if (genMin == min) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function drawWinner() {
    const date = new Date();
    const utc = date.toUTCString()
    const miliseconds = date.getUTCMilliseconds();
    // @ts-ignore
    const rand = generateTicket(3, miliseconds);
    let message = "";

    if (getFifty == true) {
        message = "50,50,50 " + utc + " " + miliseconds;
    } else {
        message = rand + " " + utc + " " + miliseconds;
    }

    console.log("");
    console.log(message);

    document.getElementById("lastGen").textContent = utc;
    document.getElementById("lastDraw").textContent = message;

    saveOnBlockchain(message);
}

function hideInputFields() {
    document.getElementById("description").style.display = "none";
    document.getElementById("form1").style.display = "none";
}

function refresh() {
    location.reload();
}

function onClickFifty() {
    // @ts-ignore
    getFifty = document.getElementById("fifty").checked;
    console.log("");
    console.log("getFifty: " + getFifty)
}

let getFifty = null;