//exclusive
function getFortunaRand(min, max, miliseconds) {
    mili = miliseconds
    fortuna.init({ timeBasedEntropy: true, accumulateTimeout: 100, entropyFxn: entropyFunction });
    let r = parseInt((fortuna.random() * (max - min)) + min);
    if (r < 10) {
        r = "0" + r;
    }
    return r;
}

function entropyFunction() {
    const array = new Uint32Array(100);
    array[99] += mili;
    const cRand = window.crypto.getRandomValues(array);
    const entropy = sha512(cRand);
    document.getElementById("entropy").textContent = entropy;
    return entropy;
}

function generateTicket(count, miliseconds) {
    let array = [];

    for (let i = 0; i < count; i++) {
        const r = getFortunaRand(1, 50, miliseconds);
        array.push(r.toString());
    }

    return array.toString();
}

var mili = 0;