//@ts-check

/**
 * 
 * @param {Number} min 
 * @param {Number} max 
 * @param {Number} miliseconds 
 */
function getFortunaRand(min, max, miliseconds) {
    mili = miliseconds
        // @ts-ignore
    fortuna.init({ timeBasedEntropy: true, accumulateTimeout: 100, entropyFxn: entropyFunction });
    // @ts-ignore
    let r = parseInt((fortuna.random() * (max - min)) + min);
    if (r < 10) {
        // @ts-ignore
        r = "0" + r;
    }
    return r;
}

function entropyFunction() {
    const array = new Uint32Array(100);
    array[99] += mili;
    const cRand = window.crypto.getRandomValues(array);
    // @ts-ignore
    const entropy = sha512(cRand);
    if (document.getElementById("entropy") != null) {
        document.getElementById("entropy").textContent = entropy;
    }
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