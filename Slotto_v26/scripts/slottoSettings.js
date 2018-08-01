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
    return { memo: "42,13,32 2018-08-01T07:10:48", sender: "slotto.register" };
}

function getTestSendMilliSeconds() {
    let seconds = 10;
    return seconds * 1000;
}

function getHistoryInterval() {
    return 1000;
}