//@ts-check

function InitRandomGenerator() {
    console.log("initializing random draws");
    document.getElementById("status").style.display = "none";
}

function getMinsDeadline() {
    // @ts-ignore
    let minsDeadline = getGenerationMin();

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
    console.log("test rand: ", getFortunaRand(800, 900, 0));
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

    if (lastGen.includes("None")) {
        saveOnBlockchain(drawWinner());
    } else if (isGenerationMinute(min, minsDeadline)) {
        if (isGenerated(document.getElementById("lastGen").textContent) == false) {
            saveOnBlockchain(drawWinner());
        } else {
            nextDraw();
        }
    } else {
        nextDraw();
    }
}

function getNextDrawTime(lastGen) {
    // @ts-ignore
    let deadline = new Date(lastGen).getTime();

    var extraMins = Math.floor((deadline % (1000 * 60 * 60)) / (1000 * 60));
    extraMins = extraMins % getMinsDeadline();
    let extraSeconds = Math.floor(deadline % (1000 * 60));
    let extraMilliSecconds = Math.floor(deadline % 1000 / 10);

    deadline = deadline + (getMinsDeadline() * 1000 * 60) - (extraMins * 60 * 1000) - (extraSeconds) - (extraMilliSecconds);

    let now = new Date().getTime();
    let distance = deadline - now;

    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    let milliSeconds = Math.floor(distance % 1000 / 100);

    if (minutes <= 0) {
        // @ts-ignore
        minutes = "00";
    } else if (minutes < 10) {
        // @ts-ignore
        minutes = "0" + minutes;
    }

    if (seconds <= 0) {
        // @ts-ignore
        seconds = "00";
    } else if (seconds < 10) {
        // @ts-ignore
        seconds = "0" + seconds;
    }

    if (milliSeconds <= 0) {
        // @ts-ignore
        milliSeconds = "00";
    } else if (milliSeconds < 10) {
        // @ts-ignore
        milliSeconds = "0" + milliSeconds;
    }

    return (minutes + " : " + seconds);
    //return (minutes + " : " + seconds + " : " + milliSeconds);
}

function nextDraw() {
    // @ts-ignore
    let interval = getFortunaRand(0, 100, 0);
    setTimeout("updateDraw()", interval);
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

function isGenerated(lastGen) {
    //const lastGen = document.getElementById("lastGen").textContent;

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

    // @ts-ignore
    if (document.getElementById("fifty").checked == true) {
        message = "50,50,50 " + utc + " " + miliseconds;
    } else {
        message = rand + " " + utc + " " + miliseconds;
    }

    console.log("");
    console.log(message);

    document.getElementById("lastGen").textContent = utc;
    document.getElementById("lastDraw").textContent = message;

    return message;
}

function hideInputFields() {
    document.getElementById("description").style.display = "none";
    document.getElementById("form1").style.display = "none";
}

function refresh() {
    location.reload();
}