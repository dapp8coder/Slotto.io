//@ts-check

function getTicketPrice() {
    let price = 0.1;
    let fixed = price.toFixed(3);
    let amount = fixed + " STEEM"

    return amount;
}

function getGenerationMin() {
    return 5;
}

// @ts-ignore slotto.Settings.js
function getDefaultRegisterAccount() {
    return "slotto.register";
}

function getMemoLimit() {
    return { memo: "38,24,15 2018-07-31T19:35:09", sender: "slotto.register" };
}

function getTestSendMilliSeconds() {
    let seconds = 10;
    return seconds * 1000;
}

function getHistoryInterval() {
    return 1000;
}