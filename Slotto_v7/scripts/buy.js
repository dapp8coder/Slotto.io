//@ts-check

function initBuy() {
    generateRandomTicket();
    getPrize();
}

async function getPrize() {
    // @ts-ignore
    let receivehistory = new SteemHistory("slotto.register");
    // @ts-ignore
    receivehistory.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await receivehistory.download();

    // @ts-ignore
    let receiveTransfers = new SteemTransfers();
    receiveTransfers.filterTransfers(null, "slotto.register", receivehistory.result);

    // @ts-ignore
    let watcher = new Watcher();
    watcher.getWinners(receiveTransfers.result);
    prize = watcher.sumOutstanding.STEEM + " STEEM";
    //showScramble(prize);
    console.log("");
    console.log("---current prize---");
    console.log(prize);

    document.getElementById("prizeSteem").textContent = prize;
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
    console.log(amount);
    // @ts-ignore slotto.Settings.js
    let receiver = getDefaultRegisterAccount();
    // @ts-ignore steemConnect2.js
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

// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
    constructor(el) {
        this.el = el
        this.chars = '!<>-_\\/[]{}—=+*^?#________'
        this.update = this.update.bind(this)
    }
    setText(newText) {
        const oldText = this.el.innerText
        const length = Math.max(oldText.length, newText.length)
        const promise = new Promise((resolve) => this.resolve = resolve)
        this.queue = []
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || ''
            const to = newText[i] || ''
            const start = Math.floor(Math.random() * 40)
            const end = start + Math.floor(Math.random() * 40)
            this.queue.push({ from, to, start, end })
        }
        cancelAnimationFrame(this.frameRequest)
        this.frame = 0
        this.update()
        return promise
    }
    update() {
        let output = ''
        let complete = 0
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i]
            if (this.frame >= end) {
                complete++
                output += to
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar()
                    this.queue[i].char = char
                }
                output += `<span class="dud">${char}</span>`
            } else {
                output += from
            }
        }
        this.el.innerHTML = output
        if (complete === this.queue.length) {
            this.resolve()
        } else {
            this.frameRequest = requestAnimationFrame(this.update)
            this.frame++
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)]
    }
}

// ——————————————————————————————————————————————————
// Example
// ——————————————————————————————————————————————————

const phrases = [
    'Neo,',
    'sooner or later',
    'you\'re going to realize',
    'just as I did',
    'that there\'s a difference',
    'between knowing the path',
    'and walking the path'
]

function showScramble(phrase) {
    fx.setText(phrase);
}

let prize = "";
let el = document.getElementById('loadingText')
let fx = new TextScramble(el)

let showPrizeAnim = false;

showScramble("loading");